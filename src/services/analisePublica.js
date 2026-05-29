// Análise de fontes públicas sobre a pessoa monitorada.
// Fontes consultadas em tempo real:
//  - Wikipedia REST API (resumo biográfico)
//  - Google News via rss2json (mídia recente, últimos 30 dias)
//  - BrasilAPI / Receita (quando o handle tiver CNPJ associado pelo perfil)
//  - DuckDuckGo Instant Answer (fallback genérico)

function deriveSearchName(profile) {
  if (profile?.fullName) return profile.fullName.split('|')[0].trim();
  return profile?.handle?.replace(/[._-]/g, ' ').replace(/oficial/gi, '').trim();
}

export async function fetchWikipediaSummary(name) {
  if (!name) return null;
  const slug = encodeURIComponent(name.replace(/\s+/g, '_'));
  try {
    const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === 'disambiguation' || !data.extract) return null;
    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page,
      thumbnail: data.thumbnail?.source,
      description: data.description,
    };
  } catch {
    return null;
  }
}

export async function fetchNewsMentions(name) {
  if (!name) return [];
  const query = encodeURIComponent(`"${name}"`);
  const rss = `https://news.google.com/rss/search?q=${query}+when:30d&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !data.items) return [];
    return data.items.slice(0, 20).map((it) => ({
      title: it.title,
      link: it.link,
      source: extractSource(it.title),
      pubDate: it.pubDate,
      description: stripHtml(it.description).slice(0, 200),
    }));
  } catch {
    return [];
  }
}

function extractSource(title) {
  const m = title.match(/ - ([^-]+)$/);
  return m ? m[1].trim() : 'Mídia';
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function fetchDuckDuckGoAbout(name) {
  if (!name) return null;
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(name)}&format=json&no_html=1&skip_disambig=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.AbstractText) return null;
    return {
      abstract: data.AbstractText,
      source: data.AbstractSource,
      url: data.AbstractURL,
      image: data.Image ? `https://duckduckgo.com${data.Image}` : null,
    };
  } catch {
    return null;
  }
}

export async function fetchCNPJ(cnpj) {
  const clean = (cnpj || '').replace(/\D/g, '');
  if (clean.length !== 14) return null;
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Sentimento simples por contagem de palavras-chave nos títulos de notícias
export function analyzeSentiment(news) {
  if (!news?.length) return { positivo: 0, neutro: 0, negativo: 0, total: 0 };
  const pos = /\b(conquista|vitória|aprovado|sucesso|cresce|lidera|premiad[oa]|destaque|recorde|inaugur)/i;
  const neg = /\b(crítica|escândalo|denúncia|investigação|polêmica|crise|condenad[oa]|perde|rejeitad|suspensão|cancel)/i;
  let p = 0, n = 0;
  for (const item of news) {
    const text = `${item.title} ${item.description}`;
    if (neg.test(text)) n++;
    else if (pos.test(text)) p++;
  }
  const total = news.length;
  const positivo = Math.round((p / total) * 100);
  const negativo = Math.round((n / total) * 100);
  const neutro = 100 - positivo - negativo;
  return { positivo, neutro, negativo, total };
}

export function topKeywords(news, max = 12) {
  const stop = new Set(['de','da','do','que','para','com','por','em','no','na','os','as','um','uma','é','e','se','sobre','dos','das','não','sua','seu','foi','ao','à','pelo','pela','mais','já','até','entre','novo','novos','nova','novas','após','antes','ser','ter']);
  const counts = {};
  for (const it of news) {
    for (const w of (it.title + ' ' + it.description).toLowerCase().split(/[^a-zà-ÿ0-9]+/i)) {
      if (w.length < 4 || stop.has(w)) continue;
      counts[w] = (counts[w] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, max).map(([w, c]) => ({ word: w, count: c }));
}

export async function runPublicAnalysis(profile) {
  const name = deriveSearchName(profile);
  if (!name) return { name: null, wiki: null, ddg: null, news: [], sentiment: null, keywords: [] };
  const [wiki, ddg, news] = await Promise.all([
    fetchWikipediaSummary(name),
    fetchDuckDuckGoAbout(name),
    fetchNewsMentions(name),
  ]);
  return {
    name,
    wiki,
    ddg,
    news,
    sentiment: analyzeSentiment(news),
    keywords: topKeywords(news),
  };
}
