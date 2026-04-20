import { useTenant } from '../context/TenantContext';
import './Header.css';

export default function Header() {
  const { tenants, selectedTenant, setSelectedTenant } = useTenant();
  return (
    <header className="top-header">
      <span>Inventory Management System</span>
      <div className="header-right">
        <select value={selectedTenant || ''} onChange={(e) => setSelectedTenant(Number(e.target.value))}>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="user-avatar">U</div>
      </div>
    </header>
  );
}
