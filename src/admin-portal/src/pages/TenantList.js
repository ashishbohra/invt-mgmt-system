import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantApi } from '../services/api';
import './Pages.css';

export default function TenantList() {
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const limit = 10;

  const load = useCallback(async () => {
    const { data } = await tenantApi.list({ search, page, limit });
    setTenants(data.data);
    setTotal(data.total);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tenant?')) return;
    await tenantApi.delete(id);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tenants</h2>
        <button className="btn-primary" onClick={() => navigate('/tenants/new')}>+ Create Tenant</button>
      </div>
      <div className="toolbar">
        <input placeholder="Search tenants..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Tenant Name</th><th>Tenant ID</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.id}</td>
              <td><span className={`badge ${t.status}`}>{t.status}</span></td>
              <td className="actions">
                <button onClick={() => navigate(`/tenants/${t.id}/edit`)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {tenants.length === 0 && <tr><td colSpan="4" className="empty">No tenants found</td></tr>}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
        <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
