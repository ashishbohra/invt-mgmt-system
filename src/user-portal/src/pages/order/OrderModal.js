import { useState, useEffect } from 'react';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import inventoryService from '../../services/inventoryService';
import FormModal from '../../components/FormModal';

export default function OrderModal({ prefill, onClose, onSaved }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(prefill?.product_id?.toString() || '');
  const [quantity, setQuantity] = useState(prefill?.quantity?.toString() || '');
  const [availableStock, setAvailableStock] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productService.list({ status: 'Active', limit: 100 }).then(({ data }) => setProducts(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!productId) { setAvailableStock(null); return; }
    inventoryService.getByProductId(productId).then(({ data }) => {
      const inv = data.data || data;
      setAvailableStock(inv.current_inventory ?? 0);
    }).catch(() => setAvailableStock(0));
  }, [productId]);

  const qty = Number(quantity) || 0;
  const insufficient = availableStock !== null && qty > 0 && qty > availableStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (insufficient) {
      setError(`Insufficient inventory. Available: ${availableStock}, Requested: ${qty}`);
      return;
    }
    setLoading(true);
    try {
      await orderService.create({ product_id: Number(productId), quantity: qty });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const stockLabel = availableStock !== null && productId ? ` — Available: ${availableStock}` : '';

  const fields = [
    { label: 'Product *', type: 'select', value: productId, onChange: setProductId, required: true, placeholder: 'Select a product', options: products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })) },
    { label: `Requested Quantity *${stockLabel}`, type: 'number', value: quantity, onChange: setQuantity, required: true, placeholder: 'Enter quantity', min: '1' },
  ];

  return (
    <FormModal
      title={prefill ? 'Reorder' : 'Create Order'}
      fields={fields}
      error={error || (insufficient ? `⚠️ Insufficient inventory. Available: ${availableStock}, Requested: ${qty}` : '')}
      loading={loading}
      submitLabel={prefill ? 'Place Reorder' : 'Place Order'}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
