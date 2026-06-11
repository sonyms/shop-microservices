import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Plus } from 'lucide-react';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(`/products?page=${currentPage}&size=12`);
        setProducts(res.data.data.content || []);
        // Spring Boot 3 Page serialization wraps metadata in a 'page' object
        setTotalPages(res.data.data.page?.totalPages || res.data.data.totalPages || 0);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setAddingToCart(product.id);
    try {
      await api.post(`/cart/${user.username}/add`, {
        productId: product.id,
        quantity: 1
      });
      addToast('Added to cart!', 'success');
    } catch (err) {
      console.error("Failed to add to cart", err);
      addToast("Failed to add to cart: " + (err.response?.data?.message || 'Unknown error'), 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}><h3>Loading catalog...</h3></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Premium Hardware</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Discover state-of-the-art tech curated just for you.</p>
      </div>
      
      {products.length === 0 ? (
        <div className="flex-center glass-panel" style={{ padding: '4rem', flexDirection: 'column' }}>
          <ShoppingBag size={64} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h2>The store is currently empty</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Check back later for new arrivals.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-placeholder">
                {product.name.charAt(0).toUpperCase()}
              </div>
              <div className="product-content">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                
                <div className="product-footer">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart === product.id || product.stockQuantity <= 0}
                  >
                    {addingToCart === product.id ? 'Adding...' : (
                      <>
                        <Plus size={16} /> Add
                      </>
                    )}
                  </button>
                </div>
                {product.stockQuantity <= 0 && (
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', marginTop: '1rem', alignSelf: 'flex-start' }}>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button 
            className="btn btn-outline" 
            disabled={currentPage === 0} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center' }}>Page {currentPage + 1} of {totalPages}</span>
          <button 
            className="btn btn-outline" 
            disabled={currentPage >= totalPages - 1} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
