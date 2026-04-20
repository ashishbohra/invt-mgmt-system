import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { productApi, orderApi } from '../services/api';
import './Pages.css';

export default function OrderForm() {
  const { selectedTenant } = useTenant();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTenant) productApi.getActive(selectedTenant).then(({ data }) => setProducts(data));
  }, [selectedTenant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await orderApi.create({ tenant_id: selectedTenant, product_id: Number(productId), quantity: Number(quantity) });
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page">
      <h2>Create Order</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Product *
          <select required value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select a product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </select>
        </label>
        <label>Requested Quantity *
          <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn-primary">Place Order</button>
          <button type="button" onClick={() => navigate('/orders')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
