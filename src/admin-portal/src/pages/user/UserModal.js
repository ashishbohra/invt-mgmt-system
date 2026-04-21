import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import tenantService from '../../services/tenantService';
import '../../styles/pages.css';
import '../../styles/modal.css';

export default function UserModal({ userId, onClose, onSaved }) {
  const isEdit = Boolean(userId);
  const [form, setForm] = useState({ tenant_name: '', name: '', email: '', password: '', roles: [], portals: [] });
  const [enums, setEnums] = useState({ roles: [], portals: [] });
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userService.getEnums().then(({ data: res }) => setEnums(res.data)).catch(() => {});
    tenantService.list({ limit: 100 }).then(({ data: res }) => setTenants(res.data)).catch(() => {});
    if (isEdit) {
      userService.getById(userId).then(({ data: res }) => {
        setForm({ tenant_name: res.data.tenant_name || '', name: res.data.name, email: res.data.email, password: '', roles: res.data.roles || [], portals: res.data.portals || [] });
      }).catch(() => setError('Failed to load user'));
    }
  }, [userId, isEdit]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const isAdmin = form.portals.includes('AdminPortal');
  const isUser = form.portals.includes('UserPortal');

  const togglePortal = (portal) => {
    setForm((prev) => {
      const has = prev.portals.includes(portal);
      if (has) return { ...prev, portals: prev.portals.filter((p) => p !== portal) };
      if (portal === 'AdminPortal') return { ...prev, portals: ['AdminPortal'], roles: prev.roles.filter((r) => r !== 'User'), tenant_name: '' };
      return { ...prev, portals: ['UserPortal'], roles: prev.roles.filter((r) => r !== 'Admin') };
    });
  };

  const toggleRole = (role) => {
    setForm((prev) => {
      const list = prev.roles;
      return { ...prev, roles: list.includes(role) ? list.filter((r) => r !== role) : [...list, role] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, tenant_name: form.tenant_name || null };
      if (isEdit) {
        await userService.update(userId, { tenant_name: payload.tenant_name, name: payload.name, email: payload.email, roles: payload.roles, portals: payload.portals });
      } else {
        await userService.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit User' : 'Create User'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>Tenant
              <select value={form.tenant_name} onChange={(e) => set('tenant_name', e.target.value)} disabled={isAdmin}>
                <option value="">None (Admin)</option>
                {tenants.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </label>
            <label>Name *
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
            </label>
            <label>Email *
              <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="user@example.com" />
            </label>
            {!isEdit && (
              <label>Password *
                <input required type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
                  placeholder="Min 8 chars, upper, lower, number, special" />
              </label>
            )}
            <label>Portal Access *
              <div className="checkbox-group">
                {enums.portals.map((p) => (
                  <label key={p} className="checkbox-label">
                    <input type="checkbox" checked={form.portals.includes(p)} onChange={() => togglePortal(p)}
                      disabled={(p === 'AdminPortal' && isUser) || (p === 'UserPortal' && isAdmin)} />
                    {p.replace('Portal', ' Portal')}
                  </label>
                ))}
              </div>
            </label>
            <label>Roles *
              <div className="checkbox-group">
                {enums.roles.map((r) => (
                  <label key={r} className="checkbox-label">
                    <input type="checkbox" checked={form.roles.includes(r)} onChange={() => toggleRole(r)}
                      disabled={(r === 'Admin' && isUser) || (r === 'User' && isAdmin)} />
                    {r}
                  </label>
                ))}
              </div>
            </label>
            {error && <div className="error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
