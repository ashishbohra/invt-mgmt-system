import '../styles/modal.css';

export default function FormModal({ title, fields, error, loading, submitLabel, onSubmit, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {fields.map((f, i) => (
              <label key={i}>
                {f.label}
                {f.type === 'select' ? (
                  <select required={f.required} value={f.value} onChange={(e) => f.onChange(e.target.value)} disabled={f.disabled}>
                    {f.placeholder && <option value="">{f.placeholder}</option>}
                    {f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'} required={f.required} value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    readOnly={f.readOnly} disabled={f.disabled}
                    placeholder={f.placeholder} min={f.min} step={f.step}
                  />
                )}
              </label>
            ))}
            {error && <div className="error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : submitLabel || 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
