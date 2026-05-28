const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();

// Segredos das integrações de comunicação.
// Configure com: firebase functions:secrets:set META_WA_TOKEN  (idem para os demais)
const META_WA_TOKEN = defineSecret('META_WA_TOKEN');          // Bearer token Meta Cloud API
const META_WA_PHONE_ID = defineSecret('META_WA_PHONE_ID');    // PHONE_NUMBER_ID
const TWILIO_SID = defineSecret('TWILIO_SID');                // Account SID
const TWILIO_TOKEN = defineSecret('TWILIO_TOKEN');            // Auth Token
const TWILIO_FROM = defineSecret('TWILIO_FROM');              // Número remetente
const FCM_PROJECT_ID = defineSecret('FCM_PROJECT_ID');        // Projeto FCM v1
const SENDGRID_KEY = defineSecret('SENDGRID_KEY');            // API key
const SENDGRID_FROM = defineSecret('SENDGRID_FROM');          // E-mail remetente verificado

// Papéis válidos no sistema GovTech
const VALID_ROLES = [
  'cidadao',
  'vereador',
  'admin_municipal',
  'admin_estadual',
  'admin_master',
];

// Papéis autorizados a chamar setCustomRole
const AUTHORIZED_CALLERS = ['admin_master', 'admin_estadual'];

/**
 * setCustomRole — Callable Function
 *
 * Atribui um custom claim `role` a um usuário do Firebase Auth.
 * Apenas admin_master e admin_estadual podem invocar.
 *
 * Payload esperado: { uid: string, role: string, cidadeId?: string, estadoId?: string }
 */
exports.setCustomRole = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    const { auth, data } = request;

    // 1) Autenticação obrigatória
    if (!auth) {
      throw new HttpsError(
        'unauthenticated',
        'É necessário estar autenticado para chamar esta função.'
      );
    }

    // 2) Autorização: somente admin_master ou admin_estadual
    const callerRole = auth.token.role;
    if (!AUTHORIZED_CALLERS.includes(callerRole)) {
      logger.warn('Tentativa não autorizada de setCustomRole', {
        callerUid: auth.uid,
        callerRole,
      });
      throw new HttpsError(
        'permission-denied',
        'Você não possui permissão para alterar papéis de usuários.'
      );
    }

    // 3) Validação do payload
    const { uid, role, cidadeId, estadoId } = data || {};

    if (!uid || typeof uid !== 'string') {
      throw new HttpsError('invalid-argument', 'Parâmetro "uid" é obrigatório.');
    }
    if (!role || !VALID_ROLES.includes(role)) {
      throw new HttpsError(
        'invalid-argument',
        `Parâmetro "role" inválido. Use um dos seguintes: ${VALID_ROLES.join(', ')}.`
      );
    }

    // 4) Regra de escalonamento: admin_estadual NÃO pode criar admin_master
    if (callerRole === 'admin_estadual' && role === 'admin_master') {
      throw new HttpsError(
        'permission-denied',
        'admin_estadual não pode promover usuários a admin_master.'
      );
    }

    // 5) Aplica os claims
    try {
      const targetUser = await admin.auth().getUser(uid);
      const existingClaims = targetUser.customClaims || {};

      const newClaims = {
        ...existingClaims,
        role,
        ...(cidadeId !== undefined && { cidadeId }),
        ...(estadoId !== undefined && { estadoId }),
      };

      await admin.auth().setCustomUserClaims(uid, newClaims);

      // Espelha no Firestore para consulta administrativa (opcional, mas útil)
      await admin.firestore().collection('users').doc(uid).set(
        {
          role,
          ...(cidadeId !== undefined && { cidadeId }),
          ...(estadoId !== undefined && { estadoId }),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: auth.uid,
        },
        { merge: true }
      );

      logger.info('Custom role atribuído com sucesso', {
        targetUid: uid,
        newRole: role,
        callerUid: auth.uid,
      });

      return {
        success: true,
        uid,
        role,
        message: 'Papel atribuído com sucesso. O usuário precisa renovar o token (logout/login ou getIdToken(true)) para refletir a mudança.',
      };
    } catch (err) {
      logger.error('Erro ao atribuir custom role', err);

      // Repassa HttpsError já tratado
      if (err instanceof HttpsError) throw err;

      // Erros conhecidos do Admin SDK
      if (err.code === 'auth/user-not-found') {
        throw new HttpsError('not-found', 'Usuário não encontrado.');
      }

      throw new HttpsError(
        'internal',
        'Falha ao atribuir o papel. Tente novamente.'
      );
    }
  }
);

// ============================================================================
// dispatchCampaign — Disparo multicanal real (WhatsApp / SMS / Push / E-mail)
// ============================================================================
const DISPATCH_ROLES = ['vereador', 'admin_municipal', 'admin_estadual', 'admin_master'];

async function sendWhatsApp(token, phoneId, recipients, message) {
  const results = await Promise.allSettled(recipients.map((to) =>
    fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } }),
    }).then((r) => r.ok)
  ));
  return {
    delivered: results.filter((r) => r.status === 'fulfilled' && r.value).length,
    failed: results.filter((r) => r.status !== 'fulfilled' || !r.value).length,
  };
}

async function sendSMS(sid, token, from, recipients, message) {
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const results = await Promise.allSettled(recipients.map((to) =>
    fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: to, From: from, Body: message }),
    }).then((r) => r.ok)
  ));
  return {
    delivered: results.filter((r) => r.status === 'fulfilled' && r.value).length,
    failed: results.filter((r) => r.status !== 'fulfilled' || !r.value).length,
  };
}

async function sendPush(projectId, tokens, message) {
  const accessToken = await admin.app().options.credential.getAccessToken();
  const results = await Promise.allSettled(tokens.map((token) =>
    fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { token, notification: { title: 'GovTech', body: message } } }),
    }).then((r) => r.ok)
  ));
  return {
    delivered: results.filter((r) => r.status === 'fulfilled' && r.value).length,
    failed: results.filter((r) => r.status !== 'fulfilled' || !r.value).length,
  };
}

async function sendEmail(apiKey, from, recipients, subject, message) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: recipients.map((to) => ({ to: [{ email: to }] })),
      from: { email: from, name: 'GovTech' },
      subject,
      content: [{ type: 'text/plain', value: message }],
    }),
  });
  return res.ok
    ? { delivered: recipients.length, failed: 0 }
    : { delivered: 0, failed: recipients.length };
}

exports.dispatchCampaign = onCall(
  {
    region: 'southamerica-east1',
    secrets: [META_WA_TOKEN, META_WA_PHONE_ID, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, FCM_PROJECT_ID, SENDGRID_KEY, SENDGRID_FROM],
  },
  async (request) => {
    const { auth, data } = request;
    if (!auth) throw new HttpsError('unauthenticated', 'Autenticação obrigatória.');
    if (!DISPATCH_ROLES.includes(auth.token.role)) {
      throw new HttpsError('permission-denied', 'Sem permissão para disparar campanhas.');
    }

    const { channels = [], message, segmentation = {}, recipients = [], subject = 'Comunicado Municipal' } = data || {};
    if (!channels.length) throw new HttpsError('invalid-argument', 'Informe ao menos um canal.');
    if (!message || message.trim().length < 10) throw new HttpsError('invalid-argument', 'Mensagem muito curta.');

    // Resolve destinatários a partir do Firestore se não vierem explicitamente
    let phones = recipients.filter((r) => r.startsWith('+'));
    let emails = recipients.filter((r) => r.includes('@'));
    let pushTokens = [];
    if (!recipients.length) {
      let q = admin.firestore().collection('cidadaos');
      if (segmentation.distrito) q = q.where('bairro', '==', segmentation.distrito);
      const snap = await q.limit(5000).get();
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.telefone) phones.push(d.telefone);
        if (d.email) emails.push(d.email);
        if (d.fcmToken) pushTokens.push(d.fcmToken);
      });
    }

    const summary = {};
    if (channels.includes('whatsapp')) {
      summary.whatsapp = await sendWhatsApp(META_WA_TOKEN.value(), META_WA_PHONE_ID.value(), phones, message);
    }
    if (channels.includes('sms')) {
      summary.sms = await sendSMS(TWILIO_SID.value(), TWILIO_TOKEN.value(), TWILIO_FROM.value(), phones, message);
    }
    if (channels.includes('push')) {
      summary.push = await sendPush(FCM_PROJECT_ID.value(), pushTokens, message);
    }
    if (channels.includes('email')) {
      summary.email = await sendEmail(SENDGRID_KEY.value(), SENDGRID_FROM.value(), emails, subject, message);
    }

    const totalDelivered = Object.values(summary).reduce((s, x) => s + x.delivered, 0);
    const totalFailed = Object.values(summary).reduce((s, x) => s + x.failed, 0);
    const COSTS = { whatsapp: 0.04, sms: 0.08, push: 0.01, email: 0.005 };
    const cost = channels.reduce((s, c) => s + (summary[c]?.delivered || 0) * COSTS[c], 0);

    const entry = {
      callerUid: auth.uid,
      callerRole: auth.token.role,
      channels,
      segmentation,
      message: message.slice(0, 280),
      summary,
      delivered: totalDelivered,
      failed: totalFailed,
      cost,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await admin.firestore().collection('campanhas').add(entry);
    logger.info('Campanha disparada', { id: ref.id, ...summary });

    return { id: ref.id, ...entry, createdAt: new Date().toISOString() };
  }
);
