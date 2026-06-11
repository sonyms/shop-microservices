import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Cart', path: '/cart' },
    { name: 'Orders', path: '/orders' }
  ];

  return (
    <nav style={{ background: '#ffffff', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
        
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary-blue)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          ShopSphere
        </Link>
        
        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {navLinks.map(link => {
            if ((link.name === 'Cart' || link.name === 'Orders') && !user) return null;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                style={{ 
                  textDecoration: 'none', 
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  background: isActive ? '#eff6ff' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search" 
              style={{
                padding: '0.5rem 1rem 0.5rem 2.5rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: '#f8fafc',
                fontSize: '0.9rem',
                width: '200px',
                outline: 'none'
              }} 
            />
          </div>

          <Link 
            to="/cart" 
            style={{ 
              textDecoration: 'none', 
              color: 'var(--accent-orange)', 
              fontWeight: 600, 
              padding: '0.4rem 1rem', 
              border: '1px solid #fed7aa', 
              borderRadius: '20px', 
              background: '#fff7ed',
              fontSize: '0.9rem'
            }}
          >
            Cart
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={handleLogout} title="Logout">
              <div style={{ 
                width: '35px', 
                height: '35px', 
                borderRadius: '50%', 
                background: 'var(--primary-blue)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.25rem', borderRadius: '20px', fontSize: '0.9rem' }}>
              Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
