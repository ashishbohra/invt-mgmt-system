import { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/modal.css';

export default function OrderViewModal({ orderId, onClose, onViewProduct, onUpdated, onReorder }) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  const isManager = user?.roles?.includes('Manager');

  const load = () => {
    orderService.getById(orderId).then(({ data }) => setOrder(data.data || data)).catch(() => setError('Failed to load order'));
  };

  useEffect(() => { load(); }, [orderId]);

  const handleConfirm = async () => {
    setError('');
    setLoading('confirm');
    try {
      await orderService.confirm(orderId);
      load();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm');
    } finally {
      setLoading('');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { setError('Cancel reason is required'); return; }
    setError('');
    setLoading('cancel');
    try {
      await orderService.cancel(orderId, cancelReason.trim());
      load();
      setShowCancelForm(false);
      setCancelReason('');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setLoading('');
    }
  };

  const isActive = order?.is_active;
  const canAct = order && isActive && (order.status === 'Created' || order.status === 'Pending');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            Order #{order?.id}
            {order && !isActive && <span className="badge Inactive" style={{ marginLeft: 8, fontSize: '0.7rem' }}>Deleted</span>}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          {!order ? <p className="text-muted">Loading...</p> : (
            <>
              <div className="view-row">
                <span className="view-label">Product</span>
                <span className="view-value"><button className="link-btn" onClick={() => onViewProduct(order.product_id)}>{order.product_name}</button></span>
              </div>
              <div className="view-row"><span className="view-label">SKU</span><span className="view-value">{order.sku}</span></div>
              <div className="view-row"><span className="view-label">Cost per Unit</span><span className="view-value">${order.cost_per_unit}</span></div>
              <div className="view-row"><span className="view-label">Requested Quantity</span><span className="view-value">{order.quantity}</span></div>
              <div className="view-row"><span className="view-label">Current Inventory</span><span className="view-value">{order.current_inventory ?? 'N/A'}</span></div>
              <div className="view-row">
                <span className="view-label">Order Status</span>
                <span className="view-value"><span className={`badge ${order.status}`}>{order.status}</span></span>
              </div>
              <div className="view-row">
                <span className="view-label">Record Status</span>
                <span className="view-value"><span className={`badge ${isActive ? 'Active' : 'Inactive'}`}>{isActive ? 'Active' : 'Deleted'}</span></span>
              </div>
              <div className="view-row"><span className="view-label">Ordered On</span><span className="view-value">{new Date(order.created_at).toLocaleString()}</span></div>
              <div className="view-row"><span className="view-label">Ordered By</span><span className="view-value text-muted">{order.created_by || '—'}</span></div>

              {order.status === 'Confirmed' && (
                <>
                  <div className="view-section-title">Approval Details</div>
                  <div className="view-row"><span className="view-label">Approved By</span><span className="view-value text-muted">{order.approved_by}</span></div>
                  <div className="view-row"><span className="view-label">Approved On</span><span className="view-value text-muted">{new Date(order.approved_at).toLocaleString()}</span></div>
                </>
              )}

              {order.status === 'Cancelled' && (
                <>
                  <div className="view-section-title">Cancellation Details</div>
                  <div className="view-row"><span className="view-label">Cancelled By</span><span className="view-value text-muted">{order.cancelled_by}</span></div>
                  <div className="view-row"><span className="view-label">Cancelled On</span><span className="view-value text-muted">{new Date(order.cancelled_at).toLocaleString()}</span></div>
                  <div className="view-row"><span className="view-label">Reason</span><span className="view-value" style={{ color: '#dc3545' }}>{order.cancel_reason}</span></div>
                </>
              )}

              {canAct && isManager && showCancelForm && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 500, fontSize: '0.9rem', color: '#444' }}>
                    Cancel Reason *
                    <textarea required value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Enter reason for cancellation..."
                      style={{ padding: '10px 14px', border: '1px solid #dde2e8', borderRadius: 8, fontSize: '0.9rem', outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} />
                  </label>
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          {canAct && isManager && !showCancelForm && (
            <>
              <button className="btn-icon danger" onClick={() => setShowCancelForm(true)} disabled={!!loading}>✕ Cancel Order</button>
              <button className="btn-primary" onClick={handleConfirm} disabled={!!loading}>
                {loading === 'confirm' ? 'Approving...' : '✓ Approve Order'}
              </button>
            </>
          )}
          {canAct && isManager && showCancelForm && (
            <>
              <button className="modal-cancel" onClick={() => { setShowCancelForm(false); setCancelReason(''); setError(''); }}>Back</button>
              <button className="btn-icon danger" onClick={handleCancel} disabled={!!loading}>
                {loading === 'cancel' ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </>
          )}
          {canAct && !isManager && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Only Managers can approve or cancel orders</p>}
          {!canAct && (
            <>
              {order && isActive && <button className="btn-primary" onClick={() => onReorder({ product_id: order.product_id, quantity: order.quantity })}>🔄 Reorder</button>}
              <button className="modal-cancel" onClick={onClose}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
