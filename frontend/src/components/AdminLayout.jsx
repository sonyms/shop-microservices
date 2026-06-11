import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.85rem 1rem',
          color: isActive ? '#ffffff' : '#94a3b8',
          background: isActive ? '#334155' : 'transparent',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
      >
        <Icon size={20} color={isActive ? 'var(--primary-blue)' : '#94a3b8'} /> 
        {children}
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #334155' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>ShopSphere</h2>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Admin Panel</span>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem to="/admin" icon={LayoutDashboard}>Dashboard</NavItem>
          <NavItem to="/admin/products" icon={Package}>Products</NavItem>
          <NavItem to="/admin/orders" icon={ShoppingCart}>Orders</NavItem>
          <NavItem to="/admin/users" icon={Users}>Users</NavItem>
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid #334155' }}>
          <button onClick={handleLogout} style={{ 
            display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', 
            padding: '0.85rem 1rem', background: 'transparent', border: 'none', 
            color: '#ef4444', textAlign: 'left', cursor: 'pointer',
            borderRadius: '8px', fontWeight: 500
          }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
      
    </div>
  );
};

export default AdminLayout;
