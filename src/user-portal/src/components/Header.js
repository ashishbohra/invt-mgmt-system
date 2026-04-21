import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const TENANT_NAME = process.env.REACT_APP_TENANT_NAME || '';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="app-title">Inventory Management System</span>
        {TENANT_NAME && <span className="tenant-badge">{TENANT_NAME}</span>}
      </div>
      <div className="header-right">
        <span className="user-name">{user?.name}</span>
        <div className="user-avatar">{initial}</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
