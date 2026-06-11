import React from 'react';
import { Package, Users, ShoppingCart, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Sales', value: '₹1,24,500', icon: DollarSign, color: '#10b981' },
    { title: 'Active Orders', value: '12', icon: ShoppingCart, color: '#3b82f6' },
    { title: 'Total Products', value: '45', icon: Package, color: '#f59e0b' },
    { title: 'Registered Users', value: '128', icon: Users, color: '#8b5cf6' }
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#0f172a' }}>Dashboard Overview</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Welcome back, Admin. Here's what's happening today.</p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={24} color={stat.color} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{stat.title}</p>
              <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Orders</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Module pending backend integration.</p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Low Stock Alerts</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Module pending backend integration.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
