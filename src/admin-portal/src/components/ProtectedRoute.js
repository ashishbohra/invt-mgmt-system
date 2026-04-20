import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const hasSession = Boolean(sessionStorage.getItem('admin_auth'));
  if (!isAuthenticated && !hasSession) return <Navigate to="/login" replace />;
  return children;
}
