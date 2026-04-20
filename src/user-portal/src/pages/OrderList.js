import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { orderApi } from '../services/api';
import './Pages.css';

export default function OrderList() {
  const { selectedTenant } = useTenant();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalCreated, setTotalCreated] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const limit = 10;

  const load = useCallback(async () => {
    if (!selectedTenant) return;
    const { data } = await orderApi.list({ tenantId: selectedTenant, page, limit });
    setOrders(data.data);
    setTotal(data.total);
    setTotalPending(data.totalPending);
    setTotalCreated(data.totalCreated);
  }, [selectedTenant, page]);

  useEffect(() => { setPage(1); }, [selectedTenant]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await orderApi.delete(id);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn-primary" onClick={() => navigate('/orders/new')}>+ Create Order</button>
      </div>
      <div className="summary-tiles">
        <div className="tile"><div className="count">{total}</div><div className="label">Total Orders</div></div>
        <div className="tile"><div className="count">{totalPending}</div><div className="label">Pending</div></div>
        <div className="tile"><div className="count">{totalCreated}</div><div className="label">Created</div></div>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Order ID</th><th>Product</th><th>Quantity</th><th>Status</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.product_name}</td>
              <td>{o.quantity}</td>
              <td><span className={`badge ${o.status}`}>{o.status}</span></td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td className="actions">
                <button onClick={() => navigate(`/orders/${o.id}`)}>View</button>
                <button className="btn-danger" onClick={() => handleDelete(o.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan="6" className="empty">No orders found</td></tr>}
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
