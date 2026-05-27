const { onCall, HttpsError } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();

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
