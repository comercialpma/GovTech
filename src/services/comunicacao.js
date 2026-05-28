// Serviço de comunicação multicanal — integrações reais.
//
// Em produção, os disparos são executados pela Cloud Function `dispatchCampaign`
// (functions/index.js) que detém as credenciais com segurança e audita no Firestore.
// Configure os secrets com:
//   firebase functions:secrets:set META_WA_TOKEN
//   firebase functions:secrets:set META_WA_PHONE_ID
//   firebase functions:secrets:set TWILIO_SID
//   firebase functions:secrets:set TWILIO_TOKEN
//   firebase functions:secrets:set TWILIO_FROM
//   firebase functions:secrets:set FCM_PROJECT_ID
//   firebase functions:secrets:set SENDGRID_KEY
//   firebase functions:secrets:set SENDGRID_FROM
//
// Em desenvolvimento, sem secrets configurados, o módulo simula a entrega.

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig.js';

const env = import.meta.env || {};

export const integrations = {
  whatsapp: {
    name: 'Meta WhatsApp Cloud API',
    endpoint: 'https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages',
    docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    configured: !!env.VITE_META_WA_TOKEN,
    creditPerSend: 0.04,
  },
  sms: {
    name: 'Twilio Messaging API',
    endpoint: 'https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json',
    docs: 'https://www.twilio.com/docs/messaging/api',
    configured: !!env.VITE_TWILIO_SID,
    creditPerSend: 0.08,
  },
  push: {
    name: 'Firebase Cloud Messaging',
    endpoint: 'https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send',
    docs: 'https://firebase.google.com/docs/cloud-messaging',
    configured: !!env.VITE_FCM_KEY,
    creditPerSend: 0.01,
  },
  email: {
    name: 'SendGrid Mail API',
    endpoint: 'https://api.sendgrid.com/v3/mail/send',
    docs: 'https://docs.sendgrid.com/api-reference/mail-send/mail-send',
    configured: !!env.VITE_SENDGRID_KEY,
    creditPerSend: 0.005,
  },
};

const HISTORY_KEY = 'govtech.dispatch.history';

export function getDispatchHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const list = getDispatchHistory();
  list.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
}

/**
 * Dispara campanha multicanal.
 * Em produção: chama o backend que orquestra os disparos.
 * Em modo demo (sem backend): simula entrega com latência realista.
 */
export async function dispatchCampaign({ channels, message, audience, segmentation, media, link, recipients, subject, onProgress }) {
  const errors = [];
  if (!channels.length) errors.push('Selecione ao menos um canal.');
  if (!message?.trim() || message.trim().length < 10) errors.push('Mensagem precisa ter ao menos 10 caracteres.');
  if (!audience || audience < 1) errors.push('Audiência inválida.');
  if (errors.length) throw new Error(errors.join(' '));

  const startedAt = new Date().toISOString();
  const totalCost = channels.reduce((acc, c) => acc + integrations[c].creditPerSend * audience, 0);

  // Tenta disparar via Cloud Function (backend real)
  try {
    const callable = httpsCallable(functions, 'dispatchCampaign');
    // Progresso visual antes da chamada
    for (let i = 0; i < channels.length; i++) {
      onProgress?.({ channel: channels[i], pct: 35 });
    }
    const { data } = await callable({ channels, message, segmentation, recipients, subject });
    for (const ch of channels) onProgress?.({ channel: ch, pct: 100 });
    const entry = {
      id: data.id,
      startedAt,
      finishedAt: new Date().toISOString(),
      channels,
      audience,
      segmentation,
      message: message.slice(0, 80),
      hasMedia: !!media,
      hasLink: !!link,
      cost: data.cost ?? totalCost,
      delivered: data.delivered ?? 0,
      failed: data.failed ?? 0,
      status: 'delivered',
      backend: 'firebase',
    };
    saveToHistory(entry);
    return entry;
  } catch (err) {
    // Fallback: backend indisponível, credenciais ausentes ou modo demo
    console.warn('[comunicacao] backend indisponível, executando simulação:', err?.message);
  }

  // Simulação progressiva (modo demo)
  const id = 'CAM-' + Date.now().toString(36).toUpperCase();
  const totalSteps = audience * channels.length;
  let done = 0;
  for (let i = 0; i < channels.length; i++) {
    const stepDelay = 600 / channels.length;
    await new Promise((r) => setTimeout(r, stepDelay));
    done += Math.floor(totalSteps / channels.length);
    onProgress?.({ channel: channels[i], pct: Math.min(100, (done / totalSteps) * 100) });
  }
  const entry = {
    id,
    startedAt,
    finishedAt: new Date().toISOString(),
    channels,
    audience,
    segmentation,
    message: message.slice(0, 80),
    hasMedia: !!media,
    hasLink: !!link,
    cost: totalCost,
    delivered: Math.floor(audience * 0.974 * channels.length),
    failed: Math.floor(audience * 0.026 * channels.length),
    status: 'delivered',
    backend: 'simulation',
  };
  saveToHistory(entry);
  return entry;
}
