import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryApi } from '../services/api';
import InventoryModal from './InventoryModal';
import InventoryViewModal from './InventoryViewModal';
import ProductViewModal from './ProductViewModal';
import './Pages.css';

export default function InventoryList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [belowThreshold, setBelowThreshold] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [productView, setProductView] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef();
  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const load = useCallback(async () => {
    const { data } = await inventoryApi.list({ status: statusFilter, filter: stockFilter, page, limit });
    setItems(data.data);
    setTotal(data.total);
    setTotalActive(data.totalActive);
    setTotalInactive(data.totalInactive);
    setBelowThreshold(data.belowThreshold);
  }, [statusFilter, stockFilter, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Inventory</h2>
      </div>

      <div className="summary-tiles">
        <div className="tile"><div className="count">{totalActive + totalInactive}</div><div className="label">Total</div></div>
        <div className="tile"><div className="count">{totalActive}</div><div className="label">Active</div></div>
        <div className="tile"><div className="count">{totalInactive}</div><div className="label">Inactive</div></div>
        <div className="tile" style={belowThreshold > 0 ? { borderColor: '#f59e0b', background: '#fffbeb' } : {}}>
          <div className="count" style={belowThreshold > 0 ? { color: '#92600a' } : {}}>{belowThreshold}</div>
          <div className="label">Below Reorder</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-right" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <span className="sort-label">Status:</span>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <span className="sort-label">Stock:</span>
          <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="below">Below Threshold</option>
          </select>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th></th>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Cost/Unit</th>
            <th>Current Inventory</th>
            <th>Reorder Threshold</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan="7" className="empty">No inventory data</td></tr>
          ) : items.map((i) => {
            const isLow = i.current_inventory < i.reorder_threshold;
            return (
              <tr key={i.id}>
                <td style={{ width: 32, textAlign: 'center', padding: '14px 8px' }}>
                  {isLow && <span title="Below reorder threshold" style={{ fontSize: '1.1rem' }}>⚠️</span>}
                </td>
                <td className="text-bold">{i.product_name}</td>
                <td className="text-muted">{i.sku}</td>
                <td>${i.cost_per_unit}</td>
                <td>{i.current_inventory}</td>
                <td>{i.reorder_threshold}</td>
                <td style={{ textAlign: 'right', position: 'relative' }} ref={openMenu === i.id ? menuRef : null}>
                  <button className="action-menu-btn" onClick={() => setOpenMenu(openMenu === i.id ? null : i.id)}>⋮</button>
                  {openMenu === i.id && (
                    <div className="action-dropdown">
                      <button onClick={() => { setOpenMenu(null); setViewModal(i.id); }}>View</button>
                      <button onClick={() => { setOpenMenu(null); setEditModal(i.id); }}>Edit</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        <span className="pagination-info">Showing {total > 0 ? startRow : 0} to {endRow} of {total} results</span>
        <div className="pagination-controls">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1;
            return <button key={p} className={page === p ? 'page-active' : ''} onClick={() => setPage(p)}>{p}</button>;
          })}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      {editModal !== null && (
        <InventoryModal
          inventoryId={editModal}
          onClose={() => setEditModal(null)}
          onSaved={() => { setEditModal(null); load(); }}
        />
      )}

      {viewModal !== null && (
        <InventoryViewModal
          inventoryId={viewModal}
          onClose={() => setViewModal(null)}
          onViewProduct={(productId) => { setViewModal(null); setProductView(productId); }}
        />
      )}

      {productView !== null && (
        <ProductViewModal
          productId={productView}
          onClose={() => setProductView(null)}
        />
      )}
    </div>
  );
}
