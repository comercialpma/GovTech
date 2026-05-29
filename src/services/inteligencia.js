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

const CIDADES_CONTAGEM = ['Contagem', 'Belo Horizonte', 'Betim', 'Ibirité', 'Nova Lima', 'Ribeirão das Neves', 'Santa Luzia', 'Vespasiano'];
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

// Usa proxy de imagens (wsrv.nl) para contornar bloqueio CORS do CDN do Instagram
function proxyImage(url) {
  if (!url) return null;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}`;
}

function parseUser(u, handle) {
  if (!u) throw new Error('perfil não encontrado');
  
  const rawPosts = u.edge_owner_to_timeline_media?.edges || [];
  const postsData = rawPosts.map((edge) => {
    const node = edge.node;
    return {
      id: node.id,
      caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      imgUrl: proxyImage(node.display_url),
      likes: node.edge_liked_by?.count || 0,
      comments: node.edge_media_to_comment?.count || 0,
      url: `https://instagram.com/p/${node.shortcode}/`,
    };
  });

  return {
    handle,
    userId: u.id || u.pk,
    fullName: u.full_name,
    biography: u.biography,
    profilePic: proxyImage(u.profile_pic_url_hd || u.profile_pic_url),
    followers: u.edge_followed_by?.count ?? 0,
    following: u.edge_follow?.count ?? 0,
    posts: u.edge_owner_to_timeline_media?.count ?? 0,
    postsData,
    engagement: 0,
    sentiment: { positivo: 60, neutro: 25, negativo: 15 },
    growth30d: 0,
    verified: !!u.is_verified,
    tipoEstimado: u.is_business_account ? 'Empresarial' : u.is_professional_account ? 'Profissional' : 'Pessoal',
    source: 'instagram',
  };
}

// Tenta raspar a lista REAL de seguidores via endpoint friendships/followers.
// IMPORTANTE: este endpoint exige cookie de sessão autenticada (sessionid) na maioria
// dos casos. O Instagram retorna 401/403 para chamadas anônimas. Quando o usuário
// fornecer um sessionId válido, a função o injeta via header.
export async function fetchInstagramFollowersReal(userId, { sessionId, max = 100 } = {}) {
  if (!userId) throw new Error('userId obrigatório');
  const collected = [];
  let nextMaxId = '';
  const igPath = (cursor) => `/api/v1/friendships/${userId}/followers/?count=50${cursor ? `&max_id=${cursor}` : ''}`;

  while (collected.length < max) {
    const path = igPath(nextMaxId);
    const headers = { 'X-IG-App-ID': '936619743392459', Accept: 'application/json' };
    if (sessionId) headers['X-Session-Id'] = sessionId;

    const attempts = [
      { url: `/ig-api${path}`, headers },
      { url: `https://corsproxy.io/?${encodeURIComponent('https://i.instagram.com' + path)}`, headers: { 'X-IG-App-ID': '936619743392459' } },
    ];

    let payload;
    for (const a of attempts) {
      try {
        const res = await fetch(a.url, { headers: a.headers, credentials: sessionId ? 'include' : 'omit' });
        if (!res.ok) continue;
        payload = await res.json();
        break;
      } catch { /* tenta próximo */ }
    }
    if (!payload?.users?.length) break;

    payload.users.forEach((u) => {
      collected.push({
        id: u.pk,
        nome: u.full_name || u.username,
        username: u.username,
        profilePic: proxyImage(u.profile_pic_url),
        verificado: !!u.is_verified,
        privado: !!u.is_private,
        source: 'instagram',
      });
    });

    if (!payload.next_max_id) break;
    nextMaxId = payload.next_max_id;
  }

  // Enriquecer com dados públicos dos perfis (scraping)
  // Tentamos extrair dados reais da BIO para inferir cidade, interesses e tipo.
  const toEnrich = collected.slice(0, 50); // Aumentado para 50
  await Promise.all(toEnrich.map(async (f) => {
    try {
      const igFull = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(f.username)}`;
      const attempts = [
        { url: `/ig-api/api/v1/users/web_profile_info/?username=${encodeURIComponent(f.username)}`, headers: {} },
        { url: `https://corsproxy.io/?${encodeURIComponent(igFull)}`, headers: { 'X-IG-App-ID': '936619743392459' } }
      ];
      for (const a of attempts) {
        const res = await fetch(a.url, { headers: { ...a.headers, Accept: 'application/json' } });
        if (!res.ok) continue;
        const json = await res.json();
        const u = json?.data?.user;
        if (u) {
          f.realSeguidores = u.edge_followed_by?.count || 0;
          f.realPosts = u.edge_owner_to_timeline_media?.count || 0;
          f.bio = u.biography || '';
          break;
        }
      }
    } catch (e) {}
  }));

  // Processar os dados REAIS coletados
  for (const f of collected) {
    if (f.realSeguidores !== undefined) {
      f.seguidores = f.realSeguidores;
      f.engajamentoMedio = 0; // Não é possível saber sem curtir posts

      // Heurística Real: Tipo
      if (f.verificado) f.tipo = 'Institucional / Oficial';
      else if (f.realSeguidores > 10000) f.tipo = 'Influenciador';
      else if (f.realSeguidores > 2000) f.tipo = 'Criador de Conteúdo';
      else f.tipo = 'Pessoal';

      // Heurística Real: Extração da Bio (Cidade e Interesses)
      const bioLower = (f.bio || '').toLowerCase();
      
      // Tentar achar cidade
      f.cidade = 'N/D';
      f.estado = '-';
      const cityMap = { 'contagem': 'Contagem', 'bh': 'Belo Horizonte', 'belo horizonte': 'Belo Horizonte', 'betim': 'Betim', 'sp': 'São Paulo', 'rj': 'Rio de Janeiro' };
      for (const [key, val] of Object.entries(cityMap)) {
        if (bioLower.includes(key)) {
          f.cidade = val;
          f.estado = val === 'São Paulo' ? 'SP' : val === 'Rio de Janeiro' ? 'RJ' : 'MG';
          break;
        }
      }

      // Tentar achar interesses
      const foundInterests = [];
      if (bioLower.includes('polític') || bioLower.includes('vereador') || bioLower.includes('deputad')) foundInterests.push('Política');
      if (bioLower.includes('médic') || bioLower.includes('saúde') || bioLower.includes('enferm')) foundInterests.push('Saúde');
      if (bioLower.includes('advogad') || bioLower.includes('direito') || bioLower.includes('oab')) foundInterests.push('Direito');
      if (bioLower.includes('engenheir') || bioLower.includes('arquitet') || bioLower.includes('obra')) foundInterests.push('Engenharia/Construção');
      if (bioLower.includes('professor') || bioLower.includes('educaç')) foundInterests.push('Educação');
      if (bioLower.includes('mãe') || bioLower.includes('pai de')) foundInterests.push('Família');
      if (bioLower.includes('deus') || bioLower.includes('crist') || bioLower.includes('jesus')) foundInterests.push('Religião');
      if (bioLower.includes('empreendedor') || bioLower.includes('ceo') || bioLower.includes('founder')) foundInterests.push('Negócios');
      
      f.interesses = foundInterests.length > 0 ? foundInterests.join(', ') : 'N/D';
      
      // Faixa etária e Ultima Interação não são públicos no Instagram
      f.faixaEtaria = 'N/D';
      f.ultimaInteracao = 'N/D';
      
    } else {
      // Se não conseguiu enriquecer (limitado a 50), deixa como Não Disponível
      f.seguidores = 'N/D';
      f.engajamentoMedio = 'N/D';
      f.bio = '';
      f.cidade = 'N/D';
      f.estado = '-';
      f.faixaEtaria = 'N/D';
      f.tipo = 'N/D';
      f.interesses = 'N/D';
      f.ultimaInteracao = 'N/D';
    }
  }

  return collected;
}

// Importa lista de seguidores a partir de CSV/JSON exportado pelo Meta Business Suite
// ou de outras ferramentas oficiais.
export function importFollowersFromCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  const idx = (name) => headers.findIndex((h) => h.includes(name));
  const iNome = idx('nome') !== -1 ? idx('nome') : idx('name');
  const iUser = idx('username') !== -1 ? idx('username') : idx('handle');
  const iCidade = idx('cidade') !== -1 ? idx('cidade') : idx('city');
  const iEng = idx('engaj') !== -1 ? idx('engaj') : idx('engagement');

  return lines.slice(1).map((line, i) => {
    const cols = line.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ''));
    return {
      id: i + 1,
      nome: cols[iNome] || 'Sem nome',
      username: cols[iUser] || `import_${i + 1}`,
      cidade: cols[iCidade] || '—',
      estado: '—',
      faixaEtaria: '—',
      tipo: 'Importado',
      seguidores: 0,
      engajamentoMedio: Number(cols[iEng]) || 0,
      interesses: '',
      ultimaInteracao: new Date().toISOString().slice(0, 10),
      verificado: false,
      source: 'csv',
    };
  });
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
    const localCidade = rng() > 0.35 ? pick(rng, CIDADES_CONTAGEM) : pick(rng, CIDADES_OUTRAS);
    const username = nome.toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '') + (i + 1);
    list.push({
      id: i + 1,
      nome,
      username,
      sexo,
      faixaEtaria: faixa,
      cidade: localCidade,
      estado: CIDADES_CONTAGEM.includes(localCidade) ? 'MG' : 'BR',
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
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seguidores-${handle}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generatePosts(handle, count = 12) {
  const rng = mulberry32(seedFrom(handle) ^ 0x987654);
  const list = [];
  const temas = ['Reunião na prefeitura', 'Ação social no bairro', 'Vistoria em obras', 'Entrevista para jornal local', 'Discussão sobre educação', 'Empreendedorismo local', 'Comunidade engajada', 'Projeto de lei aprovado'];
  const hashtags = ['#TrabalhoSério', '#Contagem', '#Desenvolvimento', '#Educação', '#Compromisso', '#NossaCidade'];
  
  for (let i = 0; i < count; i++) {
    const id = `3${Math.floor(rng() * 1000000000000000000)}`;
    const likes = Math.floor(rng() * 1500) + 50;
    const comments = Math.floor(rng() * 200) + 5;
    const tema = pick(rng, temas);
    const hash = pick(rng, hashtags) + ' ' + pick(rng, hashtags);
    list.push({
      id,
      caption: `${tema} hoje discutindo novas abordagens e ouvindo a comunidade. O trabalho não para! ${hash}`,
      imgUrl: `https://picsum.photos/seed/${id}/400/400`,
      likes,
      comments,
      url: `https://instagram.com/p/simulated_${id}/`
    });
  }
  return list;
}

export function exportPostsCSV(handle, posts) {
  const headers = ['Usuario', 'ID do Post', 'Legenda', 'IMG URL', 'Nr de Likes', 'Nr de Comentarios'];
  const rows = posts.map((p) => [
    handle,
    `'${p.id}`,
    p.caption,
    p.imgUrl,
    p.likes,
    p.comments
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `posts-${handle}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function suggestVideoThemes(posts) {
  if (!posts || posts.length === 0) return [];
  // Simula análise de IA extraindo o "tema" baseado no engajamento
  const topPosts = [...posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 3);
  
  const suggestions = [];
  const textAll = topPosts.map(p => p.caption.toLowerCase()).join(' ');
  
  if (textAll.includes('saúde') || textAll.includes('hospital') || textAll.includes('médico')) {
    suggestions.push({
      theme: 'Bastidores na Saúde',
      description: 'Grave um vídeo estilo "vlog" visitando uma unidade de saúde local, mostrando as melhorias ou conversando com pacientes. Posts com saúde geraram alto engajamento recente.',
      icon: 'medical_services',
      tone: 'text-emerald-600 bg-emerald-100'
    });
  }
  if (textAll.includes('obra') || textAll.includes('asfalto') || textAll.includes('rua') || textAll.includes('prefeitura')) {
    suggestions.push({
      theme: 'Fiscalização de Obras',
      description: 'Faça um vídeo curto (Reels) apontando o andamento de uma obra pública. A comunidade reage muito bem a prestação de contas visuais.',
      icon: 'construction',
      tone: 'text-amber-700 bg-amber-100'
    });
  }
  if (textAll.includes('educação') || textAll.includes('escola') || textAll.includes('aluno')) {
    suggestions.push({
      theme: 'Diálogo com Educadores',
      description: 'Entreviste rapidamente um professor ou diretor de escola sobre os desafios locais. Formato de corte de podcast funciona bem para isso.',
      icon: 'school',
      tone: 'text-blue-600 bg-blue-100'
    });
  }
  
  // Fallbacks genéricos caso não encontre palavras chaves específicas
  if (suggestions.length === 0) {
    suggestions.push({
      theme: 'Vlog de Prestação de Contas',
      description: 'Mostre sua rotina na Câmara em 60 segundos. Esse formato "por trás das câmeras" humaniza o mandato e aumenta a retenção.',
      icon: 'videocam',
      tone: 'text-purple-600 bg-purple-100'
    });
    suggestions.push({
      theme: 'Respondendo Comentários',
      description: 'Pegue a dúvida mais comum do seu último post com alto engajamento e responda em vídeo direto para a câmera.',
      icon: 'forum',
      tone: 'text-secondary bg-secondary-container'
    });
  }
  
  // Sempre adiciona uma dica sobre comunidade
  if (suggestions.length < 3) {
    suggestions.push({
      theme: 'Ação no Bairro',
      description: 'Vídeo mostrando a resolução de um problema relatado pelos moradores. Use o formato "Antes e Depois".',
      icon: 'handshake',
      tone: 'text-orange-600 bg-orange-100'
    });
  }

  return suggestions.slice(0, 3);
}
