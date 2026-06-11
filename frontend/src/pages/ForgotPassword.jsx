import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }
    
    // In Phase 3, this will call the backend API to trigger a password reset email
    setSubmitted(true);
    addToast('Password reset instructions sent to your email', 'success');
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg-main)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>Reset Password</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            {submitted ? "Check your inbox for the next steps." : "Enter your email to receive reset instructions."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="sony@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1.5rem' }}>
              Send Reset Link
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ width: '100%', padding: '0.85rem' }}>
              Try another email
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            ← Back to Login
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default ForgotPassword;
