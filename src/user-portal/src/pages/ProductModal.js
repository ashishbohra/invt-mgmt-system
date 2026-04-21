import { useState, useEffect } from 'react';
import { productApi } from '../services/api';
import FormModal from '../components/FormModal';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Food & Beverage', 'Furniture',
  'Health & Beauty', 'Sports & Outdoors', 'Automotive',
  'Office Supplies', 'Toys & Games', 'Other',
];

export default function ProductModal({ productId, onClose, onSaved }) {
  const isEdit = Boolean(productId);
  const [form, setForm] = useState({ name: '', sku: '', category: '', reorder_threshold: '', cost_per_unit: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      productApi.getById(productId).then(({ data }) => {
        const d = data.data || data;
        setForm({ name: d.name, sku: d.sku, category: d.category, reorder_threshold: d.reorder_threshold, cost_per_unit: d.cost_per_unit });
      }).catch(() => setError('Failed to load product'));
    }
  }, [productId, isEdit]);

  const set = (k) => (v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await productApi.update(productId, form);
      else await productApi.create(form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'SKU *', value: form.sku, onChange: set('sku'), required: true, readOnly: isEdit, placeholder: 'e.g. SKU-001' },
    { label: 'Product Name *', value: form.name, onChange: set('name'), required: true, placeholder: 'Enter product name' },
    { label: 'Category *', type: 'select', value: form.category, onChange: set('category'), required: true, placeholder: 'Select category', options: CATEGORIES },
    { label: 'Reorder Threshold *', type: 'number', value: form.reorder_threshold, onChange: set('reorder_threshold'), required: true, placeholder: '0', min: '0' },
    { label: 'Cost per Unit *', type: 'number', value: form.cost_per_unit, onChange: set('cost_per_unit'), required: true, placeholder: '0.00', min: '0', step: '0.01' },
  ];

  return (
    <FormModal
      title={isEdit ? 'Edit Product' : 'Add Product'}
      fields={fields} error={error} loading={loading}
      submitLabel={isEdit ? 'Update' : 'Create'}
      onSubmit={handleSubmit} onClose={onClose}
    />
  );
}
