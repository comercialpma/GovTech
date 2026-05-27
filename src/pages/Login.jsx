import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Credenciais inválidas. Verifique e tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ===== Lado esquerdo — institucional ===== */}
      <aside className="hidden lg:flex lg:w-1/2 relative bg-[#0b1733] text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&w=1600&q=60')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1733]/95 via-[#0b1733]/85 to-[#0b1733]/95" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GovTech Sistema de Gestão Pública" className="h-12 w-auto bg-white p-2 rounded" />
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-5">
              Sistemas Inteligentes para a Gestão Pública
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Nossa plataforma integra dados, segurança e transparência para
              impulsionar a modernização do estado e a entrega de serviços de
              excelência ao cidadão.
            </p>

            <div className="grid grid-cols-2 gap-8 mt-10">
              <div>
                <div className="text-3xl font-bold text-emerald-400">99.9%</div>
                <div className="text-xs tracking-widest text-slate-400 mt-1">
                  UPTIME GARANTIDO
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sky-400">SSL</div>
                <div className="text-xs tracking-widest text-slate-400 mt-1">
                  SEGURANÇA AVANÇADA
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            v2.4.0-STABLE — © {new Date().getFullYear()} GovTech Solutions
          </div>
        </div>
      </aside>

      {/* ===== Lado direito — formulário ===== */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                Acesso ao Sistema
              </h2>
              <p className="text-sm text-amber-600 mt-1 mb-6">
                Insira suas credenciais para continuar.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    E-mail ou CPF
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                                 placeholder:text-slate-400"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-slate-700"
                    >
                      Senha
                    </label>
                    <a
                      href="#"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Esqueci minha senha
                    </a>
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                                 placeholder:text-slate-400"
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
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                             py-3 rounded-lg text-sm flex items-center justify-center gap-2
                             transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                             shadow-sm"
                >
                  {submitting ? 'Entrando...' : (
                    <>
                      Entrar <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400 tracking-wider">
                    OU
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-slate-300
                           bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg
                           text-sm transition-colors"
              >
                <Building2 size={16} className="text-blue-600" />
                Acesso via Gov.br
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-700">Termos de Uso</a>
              <a href="#" className="hover:text-slate-700">Privacidade</a>
              <a href="#" className="hover:text-slate-700">Suporte</a>
            </div>
          </div>
        </div>

        <div className="lg:hidden text-center text-xs text-slate-400 pb-6">
          v2.4.0-STABLE — © {new Date().getFullYear()} GovTech Solutions
        </div>
      </main>
    </div>
  );
}
