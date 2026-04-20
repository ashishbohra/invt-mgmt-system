import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryApi } from '../services/api';
import './Pages.css';

export default function InventoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState('');
  const [inv, setInv] = useState(null);

  useEffect(() => {
    inventoryApi.getById(id).then(({ data }) => { setInv(data); setStock(data.current_inventory); });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await inventoryApi.updateStock(id, Number(stock));
    navigate('/inventory');
  };

  if (!inv) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>Edit Inventory — {inv.product_name}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Current Inventory *
          <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary">Update</button>
          <button type="button" onClick={() => navigate('/inventory')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
