import { useState, useEffect, useCallback, useRef } from 'react';
import tenantService from '../../services/tenantService';
import TenantModal from './TenantModal';
import '../../styles/pages.css';

export default function TenantListPage() {
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef();
  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await tenantService.list({ search, status: statusFilter, page, limit, sortBy, sortOrder });
      setTenants(res.data);
      setTotal(res.total);
      setTotalActive(res.totalActive);
      setTotalInactive(res.totalInactive);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDelete = async (id) => {
    setOpenMenu(null);
    if (!window.confirm('Deactivate this tenant? It will be marked as Inactive.')) return;
    try {
      await tenantService.delete(id);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  const handleSort = (value) => {
    const [col, dir] = value.split(':');
    setSortBy(col);
    setSortOrder(dir);
    setPage(1);
  };

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="page-card">
      <div className="page-header">
        <h2>Tenants</h2>
        <button className="btn-primary" onClick={() => setModal('new')}>+ New Tenant</button>
      </div>

      <div className="summary-tiles">
        <div className="tile">
          <div className="tile-label">Total Tenants</div>
          <div className="tile-count">{totalActive + totalInactive}</div>
          <div className="tile-sub">tracked tenants</div>
        </div>
        <div className="tile tile-highlight">
          <div className="tile-label">Active / Inactive</div>
          <div className="tile-count">{totalActive} / {totalInactive}</div>
          <div className="tile-sub">health status</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <span className="search-icon">🔍</span>
          <input placeholder="Search tenants..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="toolbar-right">
          <span className="sort-label">Status:</span>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <span className="sort-label">Sort by:</span>
          <select value={`${sortBy}:${sortOrder}`} onChange={(e) => handleSort(e.target.value)}>
            <option value="name:ASC">Name (A-Z)</option>
            <option value="name:DESC">Name (Z-A)</option>
            <option value="created_at:DESC">Newest</option>
            <option value="created_at:ASC">Oldest</option>
            <option value="status:ASC">Status</option>
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Tenant ID</th>
            <th>Tenant Name</th>
            <th>Domains</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="empty">Loading...</td></tr>
          ) : tenants.length === 0 ? (
            <tr><td colSpan="5" className="empty">No tenants found</td></tr>
          ) : tenants.map((t) => (
            <tr key={t.id}>
              <td className="text-muted">{t.tenant_id || '—'}</td>
              <td className="text-bold">{t.name}</td>
              <td>
                {(t.domains || []).length > 0
                  ? t.domains.map((d) => <span key={d} className="badge Confirmed" style={{ marginRight: 4 }}>{d}</span>)
                  : <span className="text-muted">—</span>}
              </td>
              <td><span className={`badge ${t.status}`}>{t.status}</span></td>
              <td style={{ textAlign: 'right', position: 'relative' }} ref={openMenu === t.id ? menuRef : null}>
                <button className="action-menu-btn" onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}>⋮</button>
                {openMenu === t.id && (
                  <div className="action-dropdown">
                    <button onClick={() => { setOpenMenu(null); setModal(t.id); }}>Edit</button>
                    <button className="text-danger" onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span className="pagination-info">Showing {total > 0 ? startRow : 0} to {endRow} of {total} results</span>
        <div className="pagination-controls">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1;
            return <button key={p} className={page === p ? 'page-active' : ''} onClick={() => setPage(p)}>{p}</button>;
          })}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      {modal !== null && (
        <TenantModal
          tenantId={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
