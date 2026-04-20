import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { productApi } from '../services/api';
import './Pages.css';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { selectedTenant } = useTenant();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', sku: '', category: '', reorder_threshold: '', cost_per_unit: '', status: 'Active' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) productApi.getById(id).then(({ data }) => setForm(data));
  }, [id, isEdit]);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) await productApi.update(id, form);
      else await productApi.create({ ...form, tenant_id: selectedTenant });
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page">
      <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>SKU *
          <input required value={form.sku} onChange={(e) => set('sku', e.target.value)} readOnly={isEdit} style={isEdit ? { background: '#eee' } : {}} />
        </label>
        <label>Product Name *
          <input required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        <label>Category *
          <input required value={form.category} onChange={(e) => set('category', e.target.value)} />
        </label>
        <label>Reorder Threshold *
          <input required type="number" value={form.reorder_threshold} onChange={(e) => set('reorder_threshold', e.target.value)} />
        </label>
        <label>Cost per Unit *
          <input required type="number" step="0.01" value={form.cost_per_unit} onChange={(e) => set('cost_per_unit', e.target.value)} />
        </label>
        {isEdit && (
          <label>Status
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
        )}
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn-primary">{isEdit ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
