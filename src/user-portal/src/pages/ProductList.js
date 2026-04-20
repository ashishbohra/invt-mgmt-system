import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { productApi } from '../services/api';
import './Pages.css';

export default function ProductList() {
  const { selectedTenant } = useTenant();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const navigate = useNavigate();
  const limit = 10;

  const load = useCallback(async () => {
    if (!selectedTenant) return;
    const { data } = await productApi.list({ tenantId: selectedTenant, search, page, limit, sortBy, sortOrder });
    setProducts(data.data);
    setTotal(data.total);
  }, [selectedTenant, search, page, sortBy, sortOrder]);

  useEffect(() => { setPage(1); }, [selectedTenant]);
  useEffect(() => { load(); }, [load]);

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(col); setSortOrder('ASC'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await productApi.delete(id);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Products</h2>
        <button className="btn-primary" onClick={() => navigate('/products/new')}>+ Add Product</button>
      </div>
      <div className="toolbar">
        <input placeholder="Search by name or SKU..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name {sortBy === 'name' ? (sortOrder === 'ASC' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('sku')}>SKU</th>
            <th onClick={() => handleSort('category')}>Category</th>
            <th onClick={() => handleSort('status')}>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category}</td>
              <td><span className={`badge ${p.status}`}>{p.status}</span></td>
              <td className="actions">
                <button onClick={() => navigate(`/products/${p.id}`)}>View</button>
                <button onClick={() => navigate(`/products/${p.id}/edit`)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan="5" className="empty">No products found</td></tr>}
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
