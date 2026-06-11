import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, CreditCard, CheckCircle, Package, Trash2 } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      try {
        const cartRes = await api.get(`/cart/${user.username}`);
        const rawCart = cartRes.data.data;
        
        setCart(rawCart);
      } catch (err) {
        console.error("Failed to load cart", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCartAndProducts();
  }, [user]);

  const handleRemoveItem = async (productId) => {
    try {
      const res = await api.delete(`/cart/${user.username}/items/${productId}`);
      if (res.data.code === 'SUCCESS') {
        // Re-fetch products just in case, or we could just filter the existing state, but we need the names/prices.
        // Easiest is to manually filter the state.
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => item.productId !== productId)
        }));
        addToast('Item removed from cart', 'success');
      }
    } catch (err) {
      addToast("Failed to remove item: " + (err.response?.data?.message || 'Unknown error'), 'error');
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await api.post(`/orders/${user.username}/checkout`);
      if (res.data.code === 'SUCCESS') {
        setOrderReceipt(res.data.data);
        addToast('Checkout successful!', 'success');
      }
    } catch (err) {
      addToast("Checkout failed: " + (err.response?.data?.message || 'Unknown error'), 'error');
      setCheckingOut(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}><h3>Loading cart...</h3></div>;

  if (orderReceipt) {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
        <h1 className="gradient-text">Order Received!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {orderReceipt.status === 'PENDING' 
            ? 'Your order is pending inventory verification. Check the Orders tab for updates!'
            : 'Thank you for your purchase!'}
        </p>
        
        <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order ID</span>
            <strong>#{orderReceipt.id}</strong>
          </div>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span className="badge badge-success">{orderReceipt.status}</span>
          </div>
          
          <h4 style={{ marginBottom: '1rem' }}>Items</h4>
          {orderReceipt.items.map((item, idx) => (
            <div key={idx} className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span>Product #{item.productId} <span style={{ color: 'var(--text-secondary)' }}>x{item.quantity}</span></span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          
          <div className="flex-between" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '2px solid var(--glass-border)', fontSize: '1.25rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-primary)' }}>${orderReceipt.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <button className="btn btn-secondary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShoppingCart size={32} color="var(--accent-primary)" />
        <h1 style={{ margin: 0 }}>Your Cart</h1>
      </div>

      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="flex-center glass-panel" style={{ padding: '4rem', flexDirection: 'column' }}>
          <Package size={64} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h2>Your cart is empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Catalog</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            {cart.items.map((item, idx) => (
              <div key={idx} className="flex-between" style={{ padding: '1.5rem 0', borderBottom: idx !== cart.items.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div className="product-image-placeholder" style={{ width: '80px', height: '80px', borderRadius: '8px', fontSize: '1.5rem' }}>
                    P{item.productId}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.productId)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove item"
                  >
                    <Trash2 size={20} className="hover-error" style={{ transition: 'color 0.2s' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ margin: '0 0 1.5rem 0' }}>Order Summary</h3>
              
              <div className="flex-between" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal ({cart.items.length} items)</span>
                <span>${cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              
              <div className="flex-between" style={{ padding: '1.5rem 0', borderTop: '1px solid var(--glass-border)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-primary)' }}>
                  ${cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? 'Processing...' : (
                  <>
                    <CreditCard size={20} /> Secure Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
