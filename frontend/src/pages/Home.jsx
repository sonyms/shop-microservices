import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    // Fetch a few products for recommendations
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setRecommendedProducts((res.data.data.content || []).slice(0, 4));
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Mobiles', bg: '#eff6ff' },
    { name: 'Fashion', bg: '#fff7ed' },
    { name: 'Home', bg: '#ecfdf5' },
    { name: 'Books', bg: '#f5f3ff' }
  ];

  return (
    <div className="animate-fade-in">
      
      {/* Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Main Banner */}
        <div style={{ background: '#e0f2fe', padding: '4rem 3rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a', lineHeight: 1.1 }}>
            Everything you need, delivered fast
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '2rem' }}>
            A modern marketplace for electronics, fashion, home, books and more.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>Shop Now</Link>
            <Link to="/products" className="btn" style={{ padding: '0.85rem 2rem', background: 'white', color: 'var(--primary-blue)', border: '1px solid white' }}>Explore Deals</Link>
          </div>
        </div>

        {/* Today's Deal */}
        <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#0f172a' }}>Today's Deal</h2>
          <h3 style={{ fontSize: '1.4rem', color: '#334155', marginBottom: '1rem' }}>Smart Watch Pro</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '1rem' }}>
            ₹4,999
          </div>
          <div>
            <span style={{ background: '#fff7ed', color: 'var(--accent-orange)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              40% OFF
            </span>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Featured Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {categories.map(cat => (
            <div key={cat.name} className="card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/products')}>
              <div style={{ height: '100px', background: cat.bg, borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: '#0f172a' }}>{cat.name}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Explore top offers</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Products */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recommended Products</h2>
        <div className="product-grid">
          {recommendedProducts.map(product => (
            <div key={product.id} className="product-card" style={{ border: 'none', background: 'transparent' }}>
              <div className="product-image-placeholder" style={{ background: '#f8fafc', borderRadius: '16px', marginBottom: '1rem' }}>
                Product Image
              </div>
              <div style={{ padding: '0 0.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem' }}
                  onClick={() => navigate('/products')}
                >
                  View Details
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Fast delivery • 4.5 ★</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
