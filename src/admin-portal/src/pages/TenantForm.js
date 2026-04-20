import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantApi } from '../services/api';
import './Pages.css';

export default function TenantForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      tenantApi.getById(id).then(({ data }) => {
        setName(data.name);
        setStatus(data.status);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) await tenantApi.update(id, { name, status });
      else await tenantApi.create({ name });
      navigate('/tenants');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page">
      <h2>{isEdit ? 'Edit Tenant' : 'Create Tenant'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Tenant Name *
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {isEdit && (
          <label>Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
        )}
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn-primary">{isEdit ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/tenants')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
