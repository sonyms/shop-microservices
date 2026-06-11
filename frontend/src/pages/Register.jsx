import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '', // Currently mapped to username in backend
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", 'error');
      return;
    }
    
    try {
      // Phase 3 implemented: backend now accepts first name, last name, mobile directly!
      const res = await api.post('/auth/register', { 
        username: formData.email, 
        password: formData.password, 
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        role: 'USER' 
      });
      
      if (res.data.code === 'SUCCESS') {
        addToast('Account created! Please login.', 'success');
        navigate('/login');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg-main)', padding: '2rem 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>Create Account</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">First Name</label>
              <input 
                type="text" 
                name="firstName"
                className="input-field" 
                placeholder="Sony"
                value={formData.firstName}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                className="input-field" 
                placeholder="MS"
                value={formData.lastName}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              placeholder="sony@example.com"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mobile</label>
            <input 
              type="tel" 
              name="mobile"
              className="input-field" 
              placeholder="98765 43210"
              value={formData.mobile}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="input-field" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              className="input-field" 
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '2rem' }}>
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            Already have an account? Login
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default Register;
