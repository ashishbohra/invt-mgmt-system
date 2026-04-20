import { useState, useEffect, useCallback, useRef } from 'react';
import userService from '../../services/userService';
import UserModal from './UserModal';
import '../../styles/pages.css';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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
      const { data: res } = await userService.list({ search, page, limit });
      setUsers(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDelete = async (id) => {
    setOpenMenu(null);
    if (!window.confirm('Delete this user?')) return;
    try {
      await userService.delete(id);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="page-card">
      <div className="page-header">
        <h2>Users</h2>
        <button className="btn-primary" onClick={() => setModal('new')}>+ New User</button>
      </div>
      <div className="toolbar">
        <div className="toolbar-search">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Tenant</th><th>Roles</th><th>Portals</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="6" className="empty">Loading...</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan="6" className="empty">No users found</td></tr>
          ) : users.map((u) => (
            <tr key={u.id}>
              <td className="text-bold">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.tenant_id ? <span className="text-muted">#{u.tenant_id}</span> : <span className="badge Confirmed">Admin</span>}</td>
              <td>{(u.roles || []).map((r) => <span key={r} className="badge Active" style={{ marginRight: 4 }}>{r}</span>)}</td>
              <td>{(u.portals || []).map((p) => <span key={p} className="badge Confirmed" style={{ marginRight: 4 }}>{p.replace('Portal', '')}</span>)}</td>
              <td style={{ textAlign: 'right', position: 'relative' }} ref={openMenu === u.id ? menuRef : null}>
                <button className="action-menu-btn" onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}>⋮</button>
                {openMenu === u.id && (
                  <div className="action-dropdown">
                    <button onClick={() => { setOpenMenu(null); setModal(u.id); }}>Edit</button>
                    <button className="text-danger" onClick={() => handleDelete(u.id)}>Delete</button>
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
        <UserModal
          userId={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
