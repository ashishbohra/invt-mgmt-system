import { useState, useEffect } from 'react';
import productService from '../../services/productService';
import ViewModal from '../../components/ViewModal';

export default function ProductViewModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    productService.getById(productId).then(({ data }) => setProduct(data.data || data)).catch(() => setError('Failed to load product'));
  }, [productId]);

  const fields = product ? [
    { label: 'Name', value: product.name },
    { label: 'SKU', value: product.sku },
    { label: 'Category', value: product.category },
    { label: 'Reorder Threshold', value: product.reorder_threshold },
    { label: 'Cost per Unit', value: `$${product.cost_per_unit}` },
    { label: 'Status', value: <span className={`badge ${product.is_active ? 'Active' : 'Inactive'}`}>{product.is_active ? 'Active' : 'Inactive'}</span> },
    ...(product.created_by ? [{ label: 'Created By', value: <span className="text-muted">{product.created_by}</span> }] : []),
    ...(product.updated_by ? [{ label: 'Updated By', value: <span className="text-muted">{product.updated_by}</span> }] : []),
  ] : [];

  return <ViewModal title="Product Detail" fields={fields} loading={!product && !error} error={error} onClose={onClose} />;
}
