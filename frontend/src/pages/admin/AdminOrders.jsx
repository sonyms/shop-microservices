import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';
import { Package, Search } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders?page=${currentPage}&size=20`);
      setOrders(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err) {
      addToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
      // Update local state without full refetch
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      addToast('Failed to update order status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROCESSING': return { bg: '#fff7ed', color: '#c2410c' }; // Orange
      case 'SHIPPED': return { bg: '#eff6ff', color: '#1d4ed8' }; // Blue
      case 'DELIVERED': return { bg: '#dcfce3', color: '#15803d' }; // Green
      case 'CANCELLED': return { bg: '#fee2e2', color: '#b91c1c' }; // Red
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) || 
    o.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#0f172a' }}>Order Fulfillment</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and update customer orders.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '300px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search Order ID or User..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Order ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Customer ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Total</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders found.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>#{order.id}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(order.createdAt).toLocaleDateString()} <br/>
                    <span style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.userId}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>₹{order.totalAmount.toFixed(2)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ 
                        padding: '0.5rem', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)',
                        backgroundColor: getStatusColor(order.status).bg,
                        color: getStatusColor(order.status).color,
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button className="btn btn-outline" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
            Previous
          </button>
          <span>Page {currentPage + 1} of {totalPages}</span>
          <button className="btn btn-outline" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
