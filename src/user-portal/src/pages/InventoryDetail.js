import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryApi } from '../services/api';
import './Pages.css';

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inv, setInv] = useState(null);
  const [stock, setStock] = useState('');

  useEffect(() => {
    inventoryApi.getById(id).then(({ data }) => { setInv(data); setStock(data.current_inventory); });
  }, [id]);

  const handleUpdate = async () => {
    await inventoryApi.updateStock(id, Number(stock));
    inventoryApi.getById(id).then(({ data }) => setInv(data));
  };

  if (!inv) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>Inventory Detail</h2>
      <div className="detail-card">
        <p><strong>Product:</strong> <Link to={`/products/${inv.product_id}`}>{inv.product_name}</Link></p>
        <p><strong>SKU:</strong> {inv.sku}</p>
        <p><strong>Cost per Unit:</strong> ${inv.cost_per_unit}</p>
        <p><strong>Current Inventory:</strong> {inv.current_inventory}</p>
        <p><strong>Reorder Threshold:</strong> {inv.reorder_threshold}</p>
      </div>
      <div className="form" style={{ flexDirection: 'row', alignItems: 'end', gap: '10px' }}>
        <label>Current Inventory *
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={handleUpdate}>Update Stock</button>
      </div>
      <br />
      <button onClick={() => navigate('/inventory')}>← Back to Inventory</button>
    </div>
  );
}
