import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';

  return (
    <header className="top-header">
      <span className="app-title">Inventory Management System</span>
      <div className="header-right">
        <span className="user-name">{user?.name}</span>
        <div className="user-avatar">{initial}</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
