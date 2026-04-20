import { useState, useEffect } from 'react';
import tenantService from '../../services/tenantService';
import '../../styles/pages.css';
import '../../styles/modal.css';

export default function TenantModal({ tenantId, onClose, onSaved }) {
  const isEdit = Boolean(tenantId);
  const [form, setForm] = useState({ name: '', domains: [], status: 'Active' });
  const [domainInput, setDomainInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      tenantService.getById(tenantId).then(({ data: res }) => {
        setForm({ name: res.data.name, domains: res.data.domains || [], status: res.data.status });
      }).catch(() => setError('Failed to load tenant'));
    }
  }, [tenantId, isEdit]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const addDomain = () => {
    const d = domainInput.trim();
    if (!d) return;
    setForm((prev) => ({
      ...prev,
      domains: prev.domains.includes(d) ? prev.domains : [...prev.domains, d],
    }));
    setDomainInput('');
  };

  const removeDomain = (d) => setForm((prev) => ({ ...prev, domains: prev.domains.filter((x) => x !== d) }));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addDomain(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Auto-add any pending domain input before saving
    let finalDomains = form.domains;
    const pending = domainInput.trim();
    if (pending && !finalDomains.includes(pending)) {
      finalDomains = [...finalDomains, pending];
    }

    try {
      const payload = { ...form, domains: finalDomains };
      if (isEdit) await tenantService.update(tenantId, payload);
      else await tenantService.create({ name: payload.name, domains: payload.domains });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Tenant' : 'Create Tenant'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>Tenant Name *
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Enter tenant name" />
            </label>
            <label>Domains
              <div className="domain-input-row">
                <input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. tenant.example.com" />
                <button type="button" className="btn-primary domain-add-btn" onClick={addDomain}>Add</button>
              </div>
              {form.domains.length > 0 && (
                <div className="domain-tags">
                  {form.domains.map((d) => (
                    <span key={d} className="domain-tag">
                      {d}
                      <button type="button" onClick={() => removeDomain(d)}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </label>
            {isEdit && (
              <label>Status
                <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            )}
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
