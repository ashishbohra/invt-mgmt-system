import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import '../../styles/auth.css';

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const verified = useRef(false);

  if (isAuthenticated || verified.current) return <Navigate to="/tenants" replace />;

  const pendingToken = sessionStorage.getItem('pending_auth');
  if (!pendingToken) return <Navigate to="/login" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (otp !== config.defaultOtp) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    sessionStorage.removeItem('pending_auth');
    verified.current = true;
    login(pendingToken);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">IMS</div>
        <h2>Verify OTP</h2>
        <p className="auth-hint">Enter the 6-digit OTP sent to your email</p>
        <form onSubmit={handleSubmit}>
          <label>OTP Code
            <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" autoFocus />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit">Verify</button>
        </form>
        <button className="auth-link" onClick={() => { sessionStorage.removeItem('pending_auth'); navigate('/login'); }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
