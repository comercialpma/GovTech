import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import SemPermissao from './pages/SemPermissao.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CentroComando from './pages/CentroComando.jsx';
import PortalCidadao from './pages/PortalCidadao.jsx';
import GestaoProtocolos from './pages/GestaoProtocolos.jsx';
import Radar from './pages/Radar.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import PainelMandato from './pages/PainelMandato.jsx';
import GestaoUsuarios from './pages/GestaoUsuarios.jsx';
import CentralAjuda from './pages/CentralAjuda.jsx';
import Termos from './pages/Termos.jsx';
import Privacidade from './pages/Privacidade.jsx';
import Ouvidoria from './pages/Ouvidoria.jsx';
import PesquisaOpiniao from './pages/PesquisaOpiniao.jsx';
import Vereadores from './pages/Vereadores.jsx';
import MinhasAtividades from './pages/MinhasAtividades.jsx';
import InteligenciaPolitica from './pages/InteligenciaPolitica.jsx';

const allRoles = ['cidadao', 'vereador', 'admin_municipal', 'admin_estadual', 'admin_master'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/sem-permissao" element={<SemPermissao />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/centro-comando"
        element={
          <ProtectedRoute allowedRoles={['admin_municipal', 'admin_estadual', 'admin_master']}>
            <Layout><CentroComando /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mandato"
        element={
          <ProtectedRoute allowedRoles={['vereador', 'admin_municipal', 'admin_estadual', 'admin_master']}>
            <Layout><PainelMandato /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal-cidadao"
        element={
          <ProtectedRoute allowedRoles={allRoles}>
            <Layout><PortalCidadao /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/protocolos"
        element={
          <ProtectedRoute allowedRoles={['vereador', 'admin_municipal', 'admin_estadual', 'admin_master']}>
            <Layout><GestaoProtocolos /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute allowedRoles={['admin_municipal', 'admin_estadual', 'admin_master']}>
            <Layout><GestaoUsuarios /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/radar"
        element={
          <ProtectedRoute allowedRoles={['vereador', 'admin_estadual', 'admin_master']}>
            <Layout><Radar /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/termos" element={<Layout><Termos /></Layout>} />
      <Route path="/privacidade" element={<Layout><Privacidade /></Layout>} />
      <Route path="/ouvidoria" element={<Layout><Ouvidoria /></Layout>} />
      <Route
        path="/vereadores"
        element={
          <ProtectedRoute allowedRoles={allRoles}>
            <Layout><Vereadores /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vereadores/atividades"
        element={
          <ProtectedRoute allowedRoles={allRoles}>
            <Layout><MinhasAtividades /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vereadores/pesquisa-opiniao"
        element={
          <ProtectedRoute allowedRoles={allRoles}>
            <Layout><PesquisaOpiniao /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inteligencia"
        element={
          <ProtectedRoute allowedRoles={['vereador', 'admin_municipal', 'admin_estadual', 'admin_master']}>
            <Layout><InteligenciaPolitica /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ajuda"
        element={
          <ProtectedRoute>
            <Layout><CentralAjuda /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute allowedRoles={['admin_municipal', 'admin_estadual', 'admin_master']}>
            <Layout><Configuracoes /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
