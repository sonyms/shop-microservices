import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password); 
      if (result.success) {
        addToast('Logged in successfully', 'success');
        if (result.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        addToast('Invalid credentials', 'error');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg-main)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>Welcome Back</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>Login to continue shopping</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="sony@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="flex-between" style={{ marginBottom: '2rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary-blue)', cursor: 'pointer' }} />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '2rem' }}>
            Login
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-color)', position: 'relative', textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ 
            background: 'var(--bg-card)', 
            padding: '0 1rem', 
            position: 'absolute', 
            top: '-12px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            Continue with Google
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            New user? Create account
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
