// Atividades legislativas registradas pelos próprios vereadores.
// Persistência local (em produção: backend Firestore / API REST).

const KEY = 'govtech.atividades';
const EVENT = 'govtech:atividades-changed';

export const TIPOS = ['Projeto', 'Votação', 'Audiência', 'Indicação', 'Discurso'];

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(EVENT));
}

export function listAtividades(vereadorId) {
  if (!vereadorId) return [];
  return (readAll()[vereadorId] || []).sort((a, b) => b.createdAt - a.createdAt);
}

export function addAtividade(vereadorId, atividade) {
  const all = readAll();
  const list = all[vereadorId] || [];
  const novo = { id: Date.now(), createdAt: Date.now(), ...atividade };
  all[vereadorId] = [novo, ...list];
  writeAll(all);
  return novo;
}

export function updateAtividade(vereadorId, id, patch) {
  const all = readAll();
  const list = all[vereadorId] || [];
  all[vereadorId] = list.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a));
  writeAll(all);
}

export function deleteAtividade(vereadorId, id) {
  const all = readAll();
  all[vereadorId] = (all[vereadorId] || []).filter((a) => a.id !== id);
  writeAll(all);
}

export function subscribe(cb) {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
