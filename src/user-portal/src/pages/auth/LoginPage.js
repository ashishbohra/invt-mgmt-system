import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import '../../styles/auth.css';

const TENANT_NAME = process.env.REACT_APP_TENANT_NAME || '';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/products" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: res } = await authApi.login({ email, password });
      login(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">IMS</div>
        <h2>User Login</h2>
        {TENANT_NAME && <p style={{ color: '#888', fontSize: '0.9rem', margin: '4px 0 0' }}>{TENANT_NAME}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </label>
          <label>Password
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}
