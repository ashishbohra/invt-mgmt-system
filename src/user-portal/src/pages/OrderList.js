import { useState, useEffect, useCallback, useRef } from 'react';
import { orderApi } from '../services/api';
import OrderModal from './OrderModal';
import OrderViewModal from './OrderViewModal';
import ProductViewModal from './ProductViewModal';
import './Pages.css';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalCreated, setTotalCreated] = useState(0);
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [totalCancelled, setTotalCancelled] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active');
  const [createModal, setCreateModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [productView, setProductView] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef();
  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const load = useCallback(async () => {
    const { data } = await orderApi.list({ status: statusFilter, activeFilter, page, limit });
    setOrders(data.data);
    setTotal(data.total);
    setTotalActive(data.totalActive);
    setTotalInactive(data.totalInactive);
    setTotalPending(data.totalPending);
    setTotalCreated(data.totalCreated);
    setTotalConfirmed(data.totalConfirmed);
    setTotalCancelled(data.totalCancelled);
  }, [statusFilter, activeFilter, page]);

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
    if (!window.confirm('Delete this order?')) return;
    try {
      await orderApi.delete(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn-primary" onClick={() => setCreateModal({})}>+ Create Order</button>
      </div>

      <div className="summary-tiles">
        <div className="tile"><div className="count">{totalActive + totalInactive}</div><div className="label">Total Orders</div></div>
        <div className="tile"><div className="count">{totalCreated}</div><div className="label">Created</div></div>
        <div className="tile" style={totalPending > 0 ? { borderColor: '#f59e0b', background: '#fffbeb' } : {}}>
          <div className="count" style={totalPending > 0 ? { color: '#92600a' } : {}}>{totalPending}</div>
          <div className="label">Pending</div>
        </div>
        <div className="tile"><div className="count">{totalConfirmed}</div><div className="label">Confirmed</div></div>
        <div className="tile"><div className="count">{totalCancelled}</div><div className="label">Cancelled</div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-right" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <span className="sort-label">Active:</span>
          <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <span className="sort-label">Status:</span>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="Created">Created</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th><th>Product</th><th>Quantity</th><th>Status</th><th></th><th>Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan="7" className="empty">No orders found</td></tr>
          ) : orders.map((o) => (
            <tr key={o.id} style={!o.is_active ? { opacity: 0.5 } : {}}>
              <td className="text-muted">#{o.id}</td>
              <td className="text-bold">{o.product_name}</td>
              <td>{o.quantity}</td>
              <td><span className={`badge ${o.status}`}>{o.status}</span></td>
              <td><span className={`badge ${o.is_active ? 'Active' : 'Inactive'}`}>{o.is_active ? 'Active' : 'Deleted'}</span></td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td style={{ textAlign: 'right', position: 'relative' }} ref={openMenu === o.id ? menuRef : null}>
                <button className="action-menu-btn" onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)}>⋮</button>
                {openMenu === o.id && (
                  <div className="action-dropdown">
                    <button onClick={() => { setOpenMenu(null); setViewModal(o.id); }}>View</button>
                    {o.is_active && <button onClick={() => { setOpenMenu(null); setCreateModal({ product_id: o.product_id, quantity: o.quantity }); }}>Reorder</button>}
                    {o.is_active && <button className="text-danger" onClick={() => handleDelete(o.id)}>Delete</button>}
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

      {createModal !== null && (
        <OrderModal prefill={createModal.product_id ? createModal : null} onClose={() => setCreateModal(null)} onSaved={() => { setCreateModal(null); load(); }} />
      )}

      {viewModal !== null && (
        <OrderViewModal
          orderId={viewModal}
          onClose={() => setViewModal(null)}
          onUpdated={load}
          onViewProduct={(pid) => { setViewModal(null); setProductView(pid); }}
          onReorder={(prefill) => { setViewModal(null); setCreateModal(prefill); }}
        />
      )}

      {productView !== null && (
        <ProductViewModal productId={productView} onClose={() => setProductView(null)} />
      )}
    </div>
  );
}
