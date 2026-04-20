import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">IMS</div>
      <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Products</NavLink>
      <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Inventory</NavLink>
      <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Orders</NavLink>
    </nav>
  );
}
