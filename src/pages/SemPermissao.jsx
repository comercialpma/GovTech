import { Link } from 'react-router-dom';

export default function SemPermissao() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">Acesso negado</h1>
      <p className="text-slate-600 mb-6">
        Você não possui permissão para acessar esta página.
      </p>
      <Link
        to="/"
        className="text-sm font-medium text-slate-900 underline underline-offset-4"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
