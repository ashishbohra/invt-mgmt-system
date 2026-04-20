import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import './Pages.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    productApi.getById(id).then(({ data }) => setProduct(data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this product?')) return;
    await productApi.delete(id);
    navigate('/products');
  };

  if (!product) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Product Detail</h2>
        <div className="actions">
          <button onClick={() => navigate(`/products/${id}/edit`)}>Edit</button>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
      <div className="detail-card">
        <p><strong>Name:</strong> {product.name}</p>
        <p><strong>SKU:</strong> {product.sku}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Status:</strong> <span className={`badge ${product.status}`}>{product.status}</span></p>
        <p><strong>Cost per Unit:</strong> ${product.cost_per_unit}</p>
        <p><strong>Reorder Threshold:</strong> {product.reorder_threshold}</p>
      </div>
      <button onClick={() => navigate('/products')}>← Back to Products</button>
    </div>
  );
}
