import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    brandId: ''
  });
  const [imageFile, setImageFile] = useState(null);

  // Taxonomy inline add state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products?page=${currentPage}&size=20`);
      setProducts(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
      
      const catRes = await api.get('/taxonomy/categories');
      setCategories(catRes.data.data || []);
      
      const brandRes = await api.get('/taxonomy/brands');
      setBrands(brandRes.data.data || []);
    } catch (err) {
      addToast('Failed to load catalog data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        const uploadRes = await api.post('/products/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.data; // e.g. /uploads/filename.png
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        imageUrl: imageUrl,
        category: formData.categoryId ? { id: formData.categoryId } : null,
        brand: formData.brandId ? { id: formData.brandId } : null
      };

      if (editProductId) {
        await api.put(`/products/${editProductId}`, payload);
        addToast('Product updated successfully!', 'success');
      } else {
        await api.post('/products', payload);
        addToast('Product created successfully!', 'success');
      }
      
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', stockQuantity: '', categoryId: '', brandId: '' });
      setImageFile(null);
      setEditProductId(null);
      fetchProducts();
    } catch (err) {
      addToast('Failed to save product', 'error');
    }
  };

  const handleEditClick = (p) => {
    setEditProductId(p.id);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      stockQuantity: p.stockQuantity,
      categoryId: p.category ? p.category.id : '',
      brandId: p.brand ? p.brand.id : ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDeleteProduct = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/products/${id}`);
          addToast('Product deleted successfully', 'success');
          fetchProducts();
        } catch (err) {
          addToast('Failed to delete product', 'error');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
      }
    });
  };

  const submitNewCategory = async () => {
    if (!newCategoryName.trim()) {
      setIsAddingCategory(false);
      return;
    }
    try {
      const res = await api.post('/taxonomy/categories', { name: newCategoryName });
      addToast('Category added', 'success');
      setCategories([...categories, res.data.data]);
      setFormData({ ...formData, categoryId: res.data.data.id });
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err) { addToast('Failed to add category', 'error'); }
  };

  const submitNewBrand = async () => {
    if (!newBrandName.trim()) {
      setIsAddingBrand(false);
      return;
    }
    try {
      const res = await api.post('/taxonomy/brands', { name: newBrandName });
      addToast('Brand added', 'success');
      setBrands([...brands, res.data.data]);
      setFormData({ ...formData, brandId: res.data.data.id });
      setNewBrandName('');
      setIsAddingBrand(false);
    } catch (err) { addToast('Failed to add brand', 'error'); }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#0f172a' }}>Product Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your catalog, stock levels, and pricing.</p>
        </div>
        <button onClick={() => {
          setEditProductId(null);
          setFormData({ name: '', description: '', price: '', stockQuantity: '', categoryId: '', brandId: '' });
          setImageFile(null);
          setShowModal(true);
        }} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569', width: '60px' }}>Image</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Category</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Price</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Stock</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No products found.</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {p.imageUrl ? 
                      <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${p.imageUrl}`} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> :
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>No Img</span>
                      </div>
                    }
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    <div>{p.name}</div>
                    {p.brand && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.brand.name}</div>}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>{p.category ? p.category.name : '-'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>₹{p.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge ${p.stockQuantity > 10 ? 'badge-success' : 'badge-error'}`}>
                      {p.stockQuantity} in stock
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button onClick={() => handleEditClick(p)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', marginRight: '1rem' }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={18} /></button>
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

      {/* Add Product Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editProductId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleCreateProduct}>
              <div className="input-group">
                <label className="input-label">Product Name</label>
                <input type="text" name="name" className="input-field" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label">Category</label>
                    {!isAddingCategory && (
                      <button type="button" onClick={() => setIsAddingCategory(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>+ Add New</button>
                    )}
                  </div>
                  {isAddingCategory ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" className="input-field" placeholder="New Category..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus style={{ flex: 1 }} />
                      <button type="button" onClick={submitNewCategory} className="btn btn-primary" style={{ padding: '0 0.75rem' }}><Check size={16} /></button>
                      <button type="button" onClick={() => setIsAddingCategory(false)} className="btn btn-outline" style={{ padding: '0 0.75rem' }}><X size={16} /></button>
                    </div>
                  ) : (
                    <select name="categoryId" className="input-field" value={formData.categoryId} onChange={handleInputChange}>
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label">Brand</label>
                    {!isAddingBrand && (
                      <button type="button" onClick={() => setIsAddingBrand(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>+ Add New</button>
                    )}
                  </div>
                  {isAddingBrand ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" className="input-field" placeholder="New Brand..." value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} autoFocus style={{ flex: 1 }} />
                      <button type="button" onClick={submitNewBrand} className="btn btn-primary" style={{ padding: '0 0.75rem' }}><Check size={16} /></button>
                      <button type="button" onClick={() => setIsAddingBrand(false)} className="btn btn-outline" style={{ padding: '0 0.75rem' }}><X size={16} /></button>
                    </div>
                  ) : (
                    <select name="brandId" className="input-field" value={formData.brandId} onChange={handleInputChange}>
                      <option value="">Select Brand...</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea name="description" className="input-field" value={formData.description} onChange={handleInputChange} rows="3" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Price (₹)</label>
                  <input type="number" step="0.01" name="price" className="input-field" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Stock Quantity</label>
                  <input type="number" name="stockQuantity" className="input-field" value={formData.stockQuantity} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Product Image</label>
                <input type="file" className="input-field" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {confirmDialog.isOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: confirmDialog.isDestructive ? 'var(--error)' : 'var(--text-primary)' }}>
              {confirmDialog.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false })} 
                className="btn btn-outline" 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm} 
                className="btn" 
                style={{ 
                  flex: 1, 
                  backgroundColor: confirmDialog.isDestructive ? 'var(--error)' : 'var(--primary-blue)',
                  color: 'white'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminProducts;
