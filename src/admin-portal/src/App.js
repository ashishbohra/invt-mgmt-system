import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/auth/LoginPage';
import TenantListPage from './pages/tenant/TenantListPage';
import UserListPage from './pages/user/UserListPage';
import './styles/app.css';

function AppLayout({ children }) {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="main-content">{children}</main>
    </>
  );
}

function Protected({ children }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tenants" element={<Protected><TenantListPage /></Protected>} />
          <Route path="/users" element={<Protected><UserListPage /></Protected>} />
          <Route path="*" element={<Navigate to="/tenants" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
