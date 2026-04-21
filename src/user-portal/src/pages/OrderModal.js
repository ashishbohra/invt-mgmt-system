import { useState, useEffect } from 'react';
import { productApi, orderApi } from '../services/api';
import FormModal from '../components/FormModal';

export default function OrderModal({ onClose, onSaved }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productApi.list({ status: 'Active', limit: 100 }).then(({ data }) => setProducts(data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await orderApi.create({ product_id: Number(productId), quantity: Number(quantity) });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Product *', type: 'select', value: productId, onChange: setProductId, required: true, placeholder: 'Select a product', options: products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })) },
    { label: 'Requested Quantity *', type: 'number', value: quantity, onChange: setQuantity, required: true, placeholder: 'Enter quantity', min: '1' },
  ];

  return (
    <FormModal
      title="Create Order"
      fields={fields} error={error} loading={loading}
      submitLabel="Place Order"
      onSubmit={handleSubmit} onClose={onClose}
    />
  );
}
