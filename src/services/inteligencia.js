// Geração determinística de dados de inteligência política a partir de um @handle.
// Em produção, este módulo deve consumir:
//   - Meta Graph API (Instagram Business)  → /me/insights
//   - CrowdTangle ou similar para alcance público
//   - APIs de social listening (Brand24, Sprout, etc.)
// Como esses provedores exigem credenciais e aprovação, a geração local cria um
// dataset realista e estável (seed por handle) para visualização e testes.

const NOMES = [
  'Ana Silva', 'Carlos Oliveira', 'Mariana Souza', 'Pedro Santos', 'Beatriz Lima',
  'Rafael Costa', 'Juliana Pereira', 'Lucas Almeida', 'Camila Rodrigues', 'Thiago Ferreira',
  'Larissa Carvalho', 'Bruno Martins', 'Renata Gomes', 'Felipe Ribeiro', 'Patrícia Dias',
  'Gabriel Barbosa', 'Aline Cardoso', 'Marcos Vieira', 'Tatiana Lopes', 'Diego Araújo',
  'Vanessa Castro', 'Eduardo Pinto', 'Carolina Mendes', 'Rodrigo Freitas', 'Isabela Nunes',
  'Daniel Moreira', 'Sabrina Teixeira', 'Henrique Correia', 'Priscila Cunha', 'Vinícius Ramos',
  'Letícia Andrade', 'Murilo Cavalcanti', 'Adriana Borges', 'Leonardo Macedo', 'Natália Pires',
  'André Sales', 'Cristina Duarte', 'Fernando Rocha', 'Bianca Monteiro', 'Roberto Tavares',
];

const CIDADES_AL = ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares', 'São Miguel dos Campos', 'Coruripe'];
const CIDADES_OUTRAS = ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte', 'Recife', 'Fortaleza', 'Curitiba', 'Porto Alegre'];
const FAIXAS = ['18-24', '25-34', '35-44', '45-54', '55+'];
const SEXOS = ['F', 'M'];
const INTERESSES = ['Política', 'Educação', 'Saúde', 'Economia', 'Cultura', 'Esporte', 'Tecnologia', 'Meio Ambiente', 'Religião', 'Empreendedorismo'];
const TIPOS = ['Pessoal', 'Influenciador', 'Jornalista', 'Empresarial', 'Anônimo'];

// Hash determinístico simples para gerar seeds reprodutíveis
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function mulberry32(seed) {
  let t = seed;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

export function generateProfile(handle) {
  const rng = mulberry32(seedFrom(handle));
  // Heurísticas: handles longos / com pontos / com números costumam ser pessoais (menos seguidores).
  // Handles curtos e limpos tendem a ser perfis públicos consolidados (mais seguidores).
  const len = handle.length;
  const hasDot = handle.includes('.');
  const hasDigit = /\d/.test(handle);
  const ehPessoal = len > 12 || hasDot || hasDigit;

  const base = ehPessoal
    ? 300 + Math.floor(rng() * 4_500)            // perfil pessoal: 300 a ~5k
    : 5_000 + Math.floor(rng() * 80_000);        // perfil público: 5k a ~85k

  const followers = base;
  const following = ehPessoal
    ? Math.floor(150 + rng() * 600)
    : Math.floor(300 + rng() * 1500);
  const posts = ehPessoal
    ? Math.floor(30 + rng() * 400)
    : Math.floor(200 + rng() * 2000);
  const engagement = Number((ehPessoal ? 2 + rng() * 7 : 1 + rng() * 4).toFixed(1));
  const posSent = Math.floor(45 + rng() * 30);
  const neuSent = Math.floor(15 + rng() * 25);
  const negSent = Math.max(0, 100 - posSent - neuSent);

  return {
    handle,
    followers,
    following,
    posts,
    engagement,
    sentiment: { positivo: posSent, neutro: neuSent, negativo: negSent },
    growth30d: Number(((rng() - 0.3) * 6).toFixed(1)),
    verified: !ehPessoal && rng() > 0.7,
    tipoEstimado: ehPessoal ? 'Pessoal' : 'Público / Institucional',
    source: 'demo',
  };
}

function parseUser(u, handle) {
  if (!u) throw new Error('perfil não encontrado');
  return {
    handle,
    fullName: u.full_name,
    biography: u.biography,
    profilePic: u.profile_pic_url_hd || u.profile_pic_url,
    followers: u.edge_followed_by?.count ?? 0,
    following: u.edge_follow?.count ?? 0,
    posts: u.edge_owner_to_timeline_media?.count ?? 0,
    engagement: 0,
    sentiment: { positivo: 60, neutro: 25, negativo: 15 },
    growth30d: 0,
    verified: !!u.is_verified,
    tipoEstimado: u.is_business_account ? 'Empresarial' : u.is_professional_account ? 'Profissional' : 'Pessoal',
    source: 'instagram',
  };
}

// Tenta buscar dados reais do Instagram em ordem:
// 1) Cloud Function (produção)
// 2) Vite dev proxy (desenvolvimento local)
// 3) Proxies CORS públicos como último recurso
export async function fetchInstagramProfile(handle) {
  const clean = handle.replace(/^@/, '').trim();
  if (!clean) throw new Error('handle vazio');

  const igPath = `/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`;
  const igFull = `https://i.instagram.com${igPath}`;

  // Lista de tentativas em ordem de preferência
  const attempts = [
    // 1) Vite dev proxy (resolve CORS em localhost)
    { url: `/ig-api${igPath}`, headers: {} },
    // 2) Proxies públicos (fallback)
    { url: `https://corsproxy.io/?${encodeURIComponent(igFull)}`, headers: { 'X-IG-App-ID': '936619743392459' } },
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(igFull)}`, headers: { 'X-IG-App-ID': '936619743392459' } },
  ];

  let lastErr;
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, { headers: { ...a.headers, Accept: 'application/json' } });
      if (!res.ok) { lastErr = new Error(`HTTP ${res.status} em ${a.url}`); continue; }
      const json = await res.json();
      const u = json?.data?.user;
      if (u) return parseUser(u, clean);
      lastErr = new Error('payload sem data.user');
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('todos os endpoints falharam');
}

export function generateFollowers(handle, count = 200) {
  const rng = mulberry32(seedFrom(handle) ^ 0xABCDEF);
  const list = [];
  for (let i = 0; i < count; i++) {
    const nome = pick(rng, NOMES);
    const sexo = pick(rng, SEXOS);
    const faixa = pick(rng, FAIXAS);
    const localCidade = rng() > 0.35 ? pick(rng, CIDADES_AL) : pick(rng, CIDADES_OUTRAS);
    const username = nome.toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[̀-ͯ]/g, '') + (i + 1);
    list.push({
      id: i + 1,
      nome,
      username,
      sexo,
      faixaEtaria: faixa,
      cidade: localCidade,
      estado: CIDADES_AL.includes(localCidade) ? 'AL' : 'BR',
      seguidores: Math.floor(rng() * 5000),
      engajamentoMedio: (rng() * 12).toFixed(2),
      tipo: pick(rng, TIPOS),
      interesses: Array.from(new Set([pick(rng, INTERESSES), pick(rng, INTERESSES)])).join(', '),
      ultimaInteracao: new Date(Date.now() - Math.floor(rng() * 30) * 86400000).toISOString().slice(0, 10),
      verificado: rng() > 0.92,
    });
  }
  return list;
}

export function exportFollowersCSV(handle, followers) {
  const headers = ['ID', 'Nome', 'Username', 'Sexo', 'Faixa Etária', 'Cidade', 'Estado', 'Seguidores', 'Engajamento (%)', 'Tipo', 'Interesses', 'Última Interação', 'Verificado'];
  const rows = followers.map((f) => [
    f.id, f.nome, '@' + f.username, f.sexo, f.faixaEtaria, f.cidade, f.estado,
    f.seguidores, f.engajamentoMedio, f.tipo, f.interesses, f.ultimaInteracao, f.verificado ? 'Sim' : 'Não',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seguidores-${handle}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
