import { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import FormModal from '../components/FormModal';

export default function InventoryModal({ inventoryId, onClose, onSaved }) {
  const [stock, setStock] = useState('');
  const [productName, setProductName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inventoryId) {
      inventoryApi.getById(inventoryId).then(({ data }) => {
        const d = data.data || data;
        setStock(d.current_inventory);
        setProductName(d.product_name);
      }).catch(() => setError('Failed to load inventory'));
    }
  }, [inventoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await inventoryApi.updateStock(inventoryId, Number(stock));
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Current Inventory *', type: 'number', value: stock, onChange: setStock, required: true, min: '0' },
  ];

  return (
    <FormModal
      title={`Edit Stock — ${productName}`}
      fields={fields} error={error} loading={loading}
      submitLabel="Update Stock"
      onSubmit={handleSubmit} onClose={onClose}
    />
  );
}
