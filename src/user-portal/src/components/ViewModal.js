import '../styles/modal.css';

export default function ViewModal({ title, fields, loading, error, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          {loading ? <p className="text-muted">Loading...</p> : fields.map((f, i) => (
            <div className="view-row" key={i}>
              <span className="view-label">{f.label}</span>
              <span className="view-value">{f.value}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
