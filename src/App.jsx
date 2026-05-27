import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import SemPermissao from './pages/SemPermissao.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Demandas from './pages/Demandas.jsx';
import Radar from './pages/Radar.jsx';
import Configuracoes from './pages/Configuracoes.jsx';

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
        path="/demandas"
        element={
          <ProtectedRoute allowedRoles={['cidadao', 'vereador', 'admin_municipal', 'admin_estadual', 'admin_master']}>
            <Layout><Demandas /></Layout>
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
