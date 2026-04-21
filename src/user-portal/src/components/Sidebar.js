import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';

export default function Sidebar() {
  const link = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">IMS User</div>
      <div className="sidebar-nav">
        <NavLink to="/products" className={link}><span className="nav-icon">📦</span> Products</NavLink>
        <NavLink to="/inventory" className={link}><span className="nav-icon">🏷️</span> Inventory</NavLink>
        <NavLink to="/orders" className={link}><span className="nav-icon">📋</span> Orders</NavLink>
      </div>
    </nav>
  );
}
