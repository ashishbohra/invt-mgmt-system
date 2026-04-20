import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { inventoryApi } from '../services/api';
import './Pages.css';

export default function InventoryList() {
  const { selectedTenant } = useTenant();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [belowThreshold, setBelowThreshold] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const limit = 10;

  const load = useCallback(async () => {
    if (!selectedTenant) return;
    const { data } = await inventoryApi.list({ tenantId: selectedTenant, page, limit });
    setItems(data.data);
    setTotal(data.total);
    setBelowThreshold(data.belowThreshold);
  }, [selectedTenant, page]);

  useEffect(() => { setPage(1); }, [selectedTenant]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inventory record?')) return;
    await inventoryApi.delete(id);
    load();
  };

  return (
    <div className="page">
      <h2>Inventory</h2>
      <div className="summary-tiles">
        <div className="tile"><div className="count">{total}</div><div className="label">Total Products</div></div>
        <div className="tile" style={{ background: belowThreshold > 0 ? '#fff3cd' : '#f5f5f5' }}>
          <div className="count">{belowThreshold}</div><div className="label">Below Reorder</div>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Product Name</th><th>SKU</th><th>Cost/Unit</th><th>Current Inventory</th><th>Reorder Threshold</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} style={i.current_inventory < i.reorder_threshold ? { background: '#fff8e1' } : {}}>
              <td>{i.product_name}</td>
              <td>{i.sku}</td>
              <td>${i.cost_per_unit}</td>
              <td>{i.current_inventory}</td>
              <td>{i.reorder_threshold}</td>
              <td className="actions">
                <button onClick={() => navigate(`/inventory/${i.id}`)}>View</button>
                <button onClick={() => navigate(`/inventory/${i.id}/edit`)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(i.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan="6" className="empty">No inventory data</td></tr>}
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
