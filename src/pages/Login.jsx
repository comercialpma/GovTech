import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useLogo } from '../hooks/useLogo.jsx';

// Foto da Prefeitura de Contagem-MG hospedada localmente em /public/contagem-bg.jpg
// Fallback: imagem oficial da Wikimedia Commons (caso o arquivo local não exista)
const BG_CONTAGEM =
  "url('/contagem-bg.jpg'), url('https://www.contagem.mg.gov.br/novoportal/wp-content/uploads/2024/03/prefeitura-contagem.jpg')";

export default function Login() {
  const { login, resetPassword } = useAuth();
  const [logo] = useLogo();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState(null);
  const [resetErr, setResetErr] = useState('');
  const [resetting, setResetting] = useState(false);

  const [showGovbr, setShowGovbr] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier, password);
      if (remember) localStorage.setItem('govtech:lastEmail', identifier);
      else localStorage.removeItem('govtech:lastEmail');
      navigate(from, { replace: true });
    } catch (err) {
      const code = err?.code || '';
      const msg =
        code.includes('user-not-found') ? 'Usuário não encontrado.' :
        code.includes('wrong-password') || code.includes('invalid-credential') ? 'Senha incorreta.' :
        code.includes('too-many-requests') ? 'Muitas tentativas. Tente novamente em alguns minutos.' :
        'Credenciais inválidas. Verifique e tente novamente.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setResetErr('');
    setResetMsg(null);
    setResetting(true);
    try {
      await resetPassword(resetEmail);
      setResetMsg(`Enviamos um link de redefinição para ${resetEmail}. Verifique sua caixa de entrada e spam.`);
    } catch (err) {
      const code = err?.code || '';
      setResetErr(code.includes('user-not-found')
        ? 'E-mail não cadastrado.'
        : 'Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ===== Lado esquerdo ===== */}
      <aside className="hidden lg:flex lg:w-1/2 relative bg-[#0b1733] text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: BG_CONTAGEM }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1733]/95 via-[#0b1733]/80 to-[#0b1733]/95" />

        {/* Camada de linhas tecnológicas animadas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" preserveAspectRatio="none" viewBox="0 0 800 1000">
          <defs>
            <linearGradient id="techLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="techLine2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="techGrid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0b1733" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grade tecnológica de fundo */}
          <g stroke="#1e40af" strokeOpacity="0.18" strokeWidth="0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="1000" />
            ))}
            {Array.from({ length: 25 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} />
            ))}
          </g>

          {/* Linhas horizontais animadas (scan lines) */}
          <line x1="-400" y1="180" x2="0" y2="180" stroke="url(#techLine)" strokeWidth="1.5">
            <animate attributeName="x1" from="-400" to="800" dur="6s" repeatCount="indefinite" />
            <animate attributeName="x2" from="0" to="1200" dur="6s" repeatCount="indefinite" />
          </line>
          <line x1="-400" y1="420" x2="0" y2="420" stroke="url(#techLine2)" strokeWidth="1.2">
            <animate attributeName="x1" from="-400" to="800" dur="8s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="x2" from="0" to="1200" dur="8s" begin="1s" repeatCount="indefinite" />
          </line>
          <line x1="-400" y1="680" x2="0" y2="680" stroke="url(#techLine)" strokeWidth="1.5">
            <animate attributeName="x1" from="-400" to="800" dur="7s" begin="2.5s" repeatCount="indefinite" />
            <animate attributeName="x2" from="0" to="1200" dur="7s" begin="2.5s" repeatCount="indefinite" />
          </line>
          <line x1="-400" y1="850" x2="0" y2="850" stroke="url(#techLine2)" strokeWidth="1" >
            <animate attributeName="x1" from="-400" to="800" dur="9s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="x2" from="0" to="1200" dur="9s" begin="0.5s" repeatCount="indefinite" />
          </line>

          {/* Nós pulsantes (data points) */}
          {[
            { cx: 120, cy: 260, d: 0 },
            { cx: 620, cy: 340, d: 1.2 },
            { cx: 360, cy: 540, d: 0.6 },
            { cx: 700, cy: 720, d: 1.8 },
            { cx: 200, cy: 800, d: 2.4 },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.cx} cy={p.cy} r="3" fill="#38bdf8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin={`${p.d}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={p.cx} cy={p.cy} r="3" fill="none" stroke="#38bdf8" strokeWidth="1">
                <animate attributeName="r" values="3;18;3" dur="3s" begin={`${p.d}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" begin={`${p.d}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}

          {/* Conexões entre nós */}
          <line x1="120" y1="260" x2="620" y2="340" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="40" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="620" y1="340" x2="360" y2="540" stroke="#34d399" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="40" dur="2.5s" repeatCount="indefinite" />
          </line>
          <line x1="360" y1="540" x2="700" y2="720" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="40" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="700" y1="720" x2="200" y2="800" stroke="#34d399" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="40" dur="2.2s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="800" x2="120" y2="260" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="40" dur="2.7s" repeatCount="indefinite" />
          </line>
        </svg>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto max-w-[320px] object-contain drop-shadow-xl"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              <>
                <span className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <Building2 size={28} className="text-white" />
                </span>
                <span className="text-white font-extrabold text-3xl tracking-tight">
                  Gov<span className="text-sky-400">Tech</span>
                </span>
              </>
            )}
          </div>

          <div className="max-w-md">
            <span className="inline-block text-[11px] font-bold tracking-[0.25em] text-sky-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              CONTAGEM · MINAS GERAIS
            </span>
            <h1 className="text-4xl font-bold leading-tight mt-4 mb-5 drop-shadow-lg">
              Sistemas Inteligentes para a Gestão Pública
            </h1>
            <p className="text-slate-200 text-base leading-relaxed drop-shadow">
              Nossa plataforma integra dados, segurança e transparência para
              impulsionar a modernização do estado e a entrega de serviços de
              excelência ao cidadão.
            </p>

            <div className="grid grid-cols-2 gap-8 mt-10">
              <div>
                <div className="text-3xl font-bold text-emerald-400">99.9%</div>
                <div className="text-xs tracking-widest text-slate-300 mt-1">UPTIME GARANTIDO</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sky-400">SSL</div>
                <div className="text-xs tracking-widest text-slate-300 mt-1">SEGURANÇA AVANÇADA</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            v2.4.0-STABLE — © {new Date().getFullYear()} GovTech Solutions
          </div>
        </div>
      </aside>

      {/* ===== Lado direito ===== */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Acesso ao Sistema</h2>
              <p className="text-sm text-amber-600 mt-1 mb-6">Insira suas credenciais para continuar.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-xs font-medium text-slate-700 mb-1.5">
                    E-mail ou CPF
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-slate-700">Senha</label>
                    <button
                      type="button"
                      onClick={() => { setResetEmail(identifier); setShowReset(true); setResetMsg(null); setResetErr(''); }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Mostrar/ocultar senha"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  Lembrar de mim
                </label>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? 'Entrando...' : (<>Entrar <ArrowRight size={16} /></>)}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 tracking-wider">OU</span></div>
              </div>

              <button
                type="button"
                onClick={() => setShowGovbr(true)}
                className="w-full flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                <Building2 size={16} className="text-blue-600" />
                Acesso via Gov.br
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
              <Link to="/termos" className="hover:text-slate-700">Termos de Uso</Link>
              <Link to="/privacidade" className="hover:text-slate-700">Privacidade</Link>
              <Link to="/ouvidoria" className="hover:text-slate-700">Suporte</Link>
            </div>
          </div>
        </div>

        <div className="lg:hidden text-center text-xs text-slate-400 pb-6">
          v2.4.0-STABLE — © {new Date().getFullYear()} GovTech Solutions
        </div>
      </main>

      {/* ===== Modal Esqueci minha senha ===== */}
      {showReset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReset(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Redefinir senha</h3>
                <p className="text-xs text-slate-500 mt-1">Enviaremos um link seguro por e-mail.</p>
              </div>
              <button onClick={() => setShowReset(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {resetMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-2">
                <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">{resetMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">E-mail cadastrado</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                {resetErr && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{resetErr}</div>}
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60"
                >
                  {resetting ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===== Modal Gov.br ===== */}
      {showGovbr && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGovbr(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" /> Acesso via Gov.br
              </h3>
              <button onClick={() => setShowGovbr(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                A integração OAuth2 com o Gov.br requer cadastro deste município como aplicação oficial junto ao SERPRO/DTI.
                A configuração está pendente de aprovação.
              </p>
            </div>
            <p className="text-sm text-slate-600 mb-2">Enquanto isso, você pode:</p>
            <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5 mb-4">
              <li>Entrar com e-mail e senha do servidor</li>
              <li>Solicitar credenciais ao administrador do município</li>
              <li>Acompanhar o status em <a href="https://acesso.gov.br" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">acesso.gov.br</a></li>
            </ul>
            <button
              onClick={() => setShowGovbr(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
