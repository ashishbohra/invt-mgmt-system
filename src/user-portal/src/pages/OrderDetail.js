import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import './Pages.css';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const load = () => orderApi.getById(id).then(({ data }) => setOrder(data));
  useEffect(() => { load(); }, [id]);

  const handleConfirm = async () => {
    try { await orderApi.confirm(id); load(); setError(''); }
    catch (err) { setError(err.response?.data?.error || 'Failed to confirm'); }
  };

  const handleCancel = async () => {
    await orderApi.cancel(id);
    load();
  };

  if (!order) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>Order Detail — #{order.id}</h2>
      <div className="detail-card">
        <p><strong>Product:</strong> <Link to={`/products/${order.product_id}`}>{order.product_name}</Link></p>
        <p><strong>SKU:</strong> {order.sku}</p>
        <p><strong>Requested Quantity:</strong> {order.quantity}</p>
        <p><strong>Current Inventory:</strong> {order.current_inventory ?? 'N/A'}</p>
        <p><strong>Cost per Unit:</strong> ${order.cost_per_unit}</p>
        <p><strong>Status:</strong> <span className={`badge ${order.status}`}>{order.status}</span></p>
        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
      </div>
      {error && <div className="error">{error}</div>}
      {(order.status === 'Created' || order.status === 'Pending') && (
        <div className="detail-actions">
          <button className="btn-primary" onClick={handleConfirm}>Confirm</button>
          <button className="btn-danger" style={{ padding: '8px 18px' }} onClick={handleCancel}>Cancel</button>
        </div>
      )}
      <br />
      <button onClick={() => navigate('/orders')}>← Back to Orders</button>
    </div>
  );
}
