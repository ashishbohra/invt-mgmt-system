import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../services/api';
import ProductModal from './ProductModal';
import ProductViewModal from './ProductViewModal';
import './Pages.css';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [editModal, setEditModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef();
  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const load = useCallback(async () => {
    const { data } = await productApi.list({ search, status: statusFilter, page, limit, sortBy, sortOrder });
    setProducts(data.data);
    setTotal(data.total);
    setTotalActive(data.totalActive);
    setTotalInactive(data.totalInactive);
  }, [search, statusFilter, page, sortBy, sortOrder]);

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
    if (!window.confirm('Delete this product?')) return;
    await productApi.delete(id);
    load();
  };

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Products</h2>
        <button className="btn-primary" onClick={() => setEditModal('new')}>+ Add Product</button>
      </div>

      <div className="summary-tiles">
        <div className="tile"><div className="count">{totalActive + totalInactive}</div><div className="label">Total Products</div></div>
        <div className="tile"><div className="count">{totalActive}</div><div className="label">Active</div></div>
        <div className="tile"><div className="count">{totalInactive}</div><div className="label">Inactive</div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or SKU..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="toolbar-right">
          <span className="sort-label">Status:</span>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <span className="sort-label">Sort by:</span>
          <select value={`${sortBy}:${sortOrder}`} onChange={(e) => { const [c, d] = e.target.value.split(':'); setSortBy(c); setSortOrder(d); setPage(1); }}>
            <option value="name:ASC">Name (A-Z)</option>
            <option value="name:DESC">Name (Z-A)</option>
            <option value="created_at:DESC">Newest</option>
            <option value="created_at:ASC">Oldest</option>
            <option value="is_active:ASC">Status</option>
          </select>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th><th>SKU</th><th>Category</th><th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="5" className="empty">No products found</td></tr>
          ) : products.map((p) => (
            <tr key={p.id}>
              <td className="text-bold">{p.name}</td>
              <td className="text-muted">{p.sku}</td>
              <td>{p.category}</td>
              <td><span className={`badge ${p.is_active ? 'Active' : 'Inactive'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
              <td style={{ textAlign: 'right', position: 'relative' }} ref={openMenu === p.id ? menuRef : null}>
                <button className="action-menu-btn" onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}>⋮</button>
                {openMenu === p.id && (
                  <div className="action-dropdown">
                    <button onClick={() => { setOpenMenu(null); setViewModal(p.id); }}>View</button>
                    <button onClick={() => { setOpenMenu(null); setEditModal(p.id); }}>Edit</button>
                    <button className="text-danger" onClick={() => handleDelete(p.id)}>Delete</button>
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

      {editModal !== null && (
        <ProductModal
          productId={editModal === 'new' ? null : editModal}
          onClose={() => setEditModal(null)}
          onSaved={() => { setEditModal(null); load(); }}
        />
      )}

      {viewModal !== null && (
        <ProductViewModal
          productId={viewModal}
          onClose={() => setViewModal(null)}
        />
      )}
    </div>
  );
}
