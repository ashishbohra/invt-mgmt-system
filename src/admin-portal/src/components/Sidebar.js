import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">IMS Admin</div>
      <NavLink to="/tenants" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Tenants
      </NavLink>
    </nav>
  );
}
