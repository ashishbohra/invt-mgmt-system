import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';

export default function Sidebar() {
  const link = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">IMS Admin</div>
      <div className="sidebar-nav">
        <NavLink to="/tenants" className={link}><span className="nav-icon">🏢</span> Tenants</NavLink>
        <NavLink to="/users" className={link}><span className="nav-icon">👤</span> Users</NavLink>
      </div>
    </nav>
  );
}
