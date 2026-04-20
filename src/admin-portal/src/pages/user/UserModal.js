import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import tenantService from '../../services/tenantService';
import '../../styles/pages.css';
import '../../styles/modal.css';

export default function UserModal({ userId, onClose, onSaved }) {
  const isEdit = Boolean(userId);
  const [form, setForm] = useState({ tenant_id: '', name: '', email: '', password: '', roles: [], portals: [] });
  const [enums, setEnums] = useState({ roles: [], portals: [] });
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userService.getEnums().then(({ data: res }) => setEnums(res.data)).catch(() => {});
    tenantService.list({ limit: 100 }).then(({ data: res }) => setTenants(res.data)).catch(() => {});
    if (isEdit) {
      userService.getById(userId).then(({ data: res }) => {
        setForm({ tenant_id: res.data.tenant_id || '', name: res.data.name, email: res.data.email, password: '', roles: res.data.roles || [], portals: res.data.portals || [] });
      }).catch(() => setError('Failed to load user'));
    }
  }, [userId, isEdit]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const toggleItem = (key, item) => {
    setForm((prev) => {
      const list = prev[key];
      return { ...prev, [key]: list.includes(item) ? list.filter((i) => i !== item) : [...list, item] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, tenant_id: form.tenant_id || null };
      if (isEdit) {
        await userService.update(userId, { tenant_id: payload.tenant_id, name: payload.name, email: payload.email, roles: payload.roles, portals: payload.portals });
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
              <select value={form.tenant_id} onChange={(e) => set('tenant_id', e.target.value)}>
                <option value="">None (Admin)</option>
                {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
            <label>Roles *
              <div className="checkbox-group">
                {enums.roles.map((r) => (
                  <label key={r} className="checkbox-label">
                    <input type="checkbox" checked={form.roles.includes(r)} onChange={() => toggleItem('roles', r)} />
                    {r}
                  </label>
                ))}
              </div>
            </label>
            <label>Portal Access *
              <div className="checkbox-group">
                {enums.portals.map((p) => (
                  <label key={p} className="checkbox-label">
                    <input type="checkbox" checked={form.portals.includes(p)} onChange={() => toggleItem('portals', p)} />
                    {p.replace('Portal', ' Portal')}
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
