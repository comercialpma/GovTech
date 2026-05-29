// Gerenciamento e raspagem de jornais locais via RSS.
// Persistência local + sincronização entre abas.

const KEY = 'govtech.imprensa.jornais';
const EVENT = 'govtech:imprensa-changed';

// Sugestões pré-carregadas relevantes para Contagem-MG e região metropolitana
export const SUGESTOES = [
  { nome: 'O Tempo — Cidades', url: 'https://www.otempo.com.br', rss: 'https://www.otempo.com.br/rss/cidades.xml' },
  { nome: 'Estado de Minas — Gerais', url: 'https://www.em.com.br', rss: 'https://www.em.com.br/rss/noticia/gerais/' },
  { nome: 'Hoje em Dia', url: 'https://www.hojeemdia.com.br', rss: 'https://www.hojeemdia.com.br/rss' },
  { nome: 'G1 Minas Gerais', url: 'https://g1.globo.com/mg', rss: 'https://g1.globo.com/rss/g1/mg/' },
  { nome: 'Itatiaia', url: 'https://www.itatiaia.com.br', rss: 'https://www.itatiaia.com.br/rss/ultimas-noticias' },
  { nome: 'BHAZ', url: 'https://bhaz.com.br', rss: 'https://bhaz.com.br/feed/' },
];

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeAll(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
  window.dispatchEvent(new Event(EVENT));
}

export function listJornais() { return readAll(); }

export function addJornal(j) {
  const all = readAll();
  if (all.find((x) => x.rss === j.rss)) return;
  all.push({ id: Date.now(), addedAt: Date.now(), ...j });
  writeAll(all);
}

export function removeJornal(id) {
  writeAll(readAll().filter((j) => j.id !== id));
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

// Tenta descobrir o feed RSS automaticamente a partir da URL do jornal.
// Em caso de dúvida, retorna a própria URL.
export function autoDiscoverRSS(siteUrl) {
  const clean = siteUrl.replace(/\/$/, '');
  const candidates = ['/rss', '/feed', '/feed/', '/rss.xml', '/feed.xml', '/index.xml'];
  // Retorna lista de candidatos para tentativa em ordem
  return [siteUrl, ...candidates.map((c) => clean + c)];
}

// Raspa um feed RSS via rss2json (proxy gratuito, CORS aberto).
export async function fetchFeed(rssUrl) {
  if (!rssUrl) return { items: [], error: 'URL ausente' };
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=10`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { items: [], error: `HTTP ${res.status}` };
    const data = await res.json();
    if (data.status !== 'ok') return { items: [], error: data.message || 'RSS inválido' };
    return {
      feed: data.feed,
      items: (data.items || []).map((it) => ({
        title: it.title,
        link: it.link,
        pubDate: it.pubDate,
        description: stripHtml(it.description).slice(0, 240),
        thumbnail: it.thumbnail || extractImg(it.description),
        author: it.author,
        categories: it.categories,
      })),
    };
  } catch (e) {
    return { items: [], error: e.message };
  }
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function extractImg(html) {
  const m = html?.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] || null;
}
