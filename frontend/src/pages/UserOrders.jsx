import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/user/${user.username}?page=${page}&size=5&sort=createdAt,desc`);
      if (res.data && res.data.data) {
        setOrders(res.data.data.content || []);
        setTotalPages(res.data.data.page?.totalPages || res.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, page]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <AlertCircle size={20} color="var(--warning)" />;
      case 'PROCESSING': return <Clock size={20} color="var(--accent-primary)" />;
      case 'SHIPPED': return <Truck size={20} color="var(--info)" />;
      case 'DELIVERED': return <CheckCircle size={20} color="var(--success)" />;
      case 'CANCELLED': return <XCircle size={20} color="var(--error)" />;
      default: return <Package size={20} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge badge-warning';
      case 'PROCESSING': return 'badge badge-primary';
      case 'SHIPPED': return 'badge badge-info';
      case 'DELIVERED': return 'badge badge-success';
      case 'CANCELLED': return 'badge badge-error';
      default: return 'badge badge-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (!user) {
    return <div className="flex-center" style={{ height: '50vh' }}><h3>Please log in to view your orders.</h3></div>;
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Package size={32} color="var(--accent-primary)" />
          <h1 style={{ margin: 0 }}>My Orders</h1>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchOrders} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '30vh' }}><h3>Loading orders...</h3></div>
      ) : orders.length === 0 ? (
        <div className="flex-center glass-panel" style={{ padding: '4rem', flexDirection: 'column' }}>
          <Package size={64} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h2>No orders yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You haven't placed any orders.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => (
              <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div className="flex-between" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Order #{order.id}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Placed on {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getStatusIcon(order.status)}
                    <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                  </div>
                </div>
                
                <div style={{ padding: '0.5rem 0' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Items</h4>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex-between" style={{ padding: '0.5rem 0', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500' }}>Product #{item.productId}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>x{item.quantity}</span>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent-primary)' }}>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex-center" style={{ marginTop: '2rem', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={20} />
              </button>
              <span style={{ fontWeight: '500' }}>Page {page + 1} of {totalPages}</span>
              <button 
                className="btn btn-secondary" 
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserOrders;
