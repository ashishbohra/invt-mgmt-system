import { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import ViewModal from '../../components/ViewModal';

export default function InventoryViewModal({ inventoryId, onClose, onViewProduct }) {
  const [inv, setInv] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryService.getById(inventoryId).then(({ data }) => setInv(data.data || data)).catch(() => setError('Failed to load inventory'));
  }, [inventoryId]);

  const isLow = inv && inv.current_inventory < inv.reorder_threshold;

  const fields = inv ? [
    { label: 'Product', value: <button className="link-btn" onClick={() => onViewProduct(inv.product_id)}>{inv.product_name}</button> },
    { label: 'SKU', value: inv.sku },
    { label: 'Cost per Unit', value: `$${inv.cost_per_unit}` },
    { label: 'Current Inventory', value: <>{inv.current_inventory}{isLow && <span className="badge Pending" style={{ marginLeft: 8 }}>Below Reorder</span>}</> },
    { label: 'Reorder Threshold', value: inv.reorder_threshold },
    ...(inv.updated_by ? [{ label: 'Last Updated By', value: <span className="text-muted">{inv.updated_by}</span> }] : []),
  ] : [];

  return <ViewModal title="Inventory Detail" fields={fields} loading={!inv && !error} error={error} onClose={onClose} />;
}
