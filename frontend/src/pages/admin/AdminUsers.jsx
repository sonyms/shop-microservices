import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';
import { Shield, Search, UserPlus, Ban, CheckCircle, Edit, Trash2 } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
  const { addToast } = useToast();

  const [adminData, setAdminData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    password: '',
    role: 'USER'
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/auth/users?page=${currentPage}&size=20`);
      setUsers(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err) {
      addToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handleToggleStatus = (user) => {
    const newStatus = user.status !== 'BANNED' ? 'BANNED' : 'ACTIVE';
    const action = newStatus === 'BANNED' ? 'ban' : 'unban';
    
    if (user.role === 'ADMIN') {
        addToast("You cannot ban an admin user", "error");
        return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `${action === 'ban' ? 'Ban' : 'Unban'} User`,
      message: `Are you sure you want to ${action} user: ${user.username}?`,
      isDestructive: action === 'ban',
      onConfirm: async () => {
        try {
          await api.put(`/auth/users/${user.id}/status`, { status: newStatus });
          addToast(`User ${user.username} is now ${newStatus}`, 'success');
          setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } catch (err) {
          addToast(`Failed to ${action} user`, 'error');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
      }
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/users', adminData);
      addToast('User created successfully!', 'success');
      setShowModal(false);
      setAdminData({ username: '', email: '', firstName: '', lastName: '', mobile: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (err) {
      addToast('Failed to create user. Username may be taken.', 'error');
    }
  };

  const handleDeleteUser = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user completely? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/auth/users/${id}`);
          addToast("User deleted successfully", "success");
          setUsers(users.filter(u => u.id !== id));
        } catch (err) {
          addToast("Failed to delete user", "error");
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
      }
    });
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const submitEditUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/users/${editingUser.id}`, { 
          username: editingUser.username,
          email: editingUser.email, 
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          mobile: editingUser.mobile,
          role: editingUser.role,
          password: editingUser.password // Will only update if not empty
      });
      addToast("User updated successfully", "success");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      addToast("Failed to update user", "error");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#0f172a' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage customers and administrator accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
            <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} /> Add User
            </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>User ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Username</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Full Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Mobile</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>#{user.id}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{user.username}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: user.role === 'ADMIN' ? '#e0e7ff' : '#f1f5f9',
                        color: user.role === 'ADMIN' ? '#4338ca' : '#475569'
                    }}>
                        {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>{user.firstName} {user.lastName}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>{user.mobile}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: user.status !== 'BANNED' ? '#dcfce3' : '#fee2e2',
                        color: user.status !== 'BANNED' ? '#15803d' : '#b91c1c'
                    }}>
                        {user.status !== 'BANNED' ? 'ACTIVE' : 'BANNED'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => handleEditUser(user)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)' }}
                            title="Edit User"
                        >
                            <Edit size={18} />
                        </button>
                        {user.role !== 'ADMIN' && (
                            <button 
                                onClick={() => handleToggleStatus(user)}
                                style={{ 
                                    background: 'none', border: 'none', cursor: 'pointer', 
                                    color: user.status !== 'BANNED' ? 'var(--success)' : 'var(--error)',
                                }}
                                title={user.status !== 'BANNED' ? 'Status: Active. Click to Ban' : 'Status: Banned. Click to Unban'}
                            >
                                {user.status !== 'BANNED' ? <CheckCircle size={18} /> : <Ban size={18} />}
                            </button>
                        )}
                        <button 
                            onClick={() => handleDeleteUser(user.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                            title="Delete User"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
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

      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={24} color="var(--primary-blue)" /> Add User
            </h2>
            <form onSubmit={handleCreateUser}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input type="text" className="input-field" required value={adminData.username} onChange={(e) => setAdminData({...adminData, username: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" className="input-field" required value={adminData.email} onChange={(e) => setAdminData({...adminData, email: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">First Name</label>
                  <input type="text" className="input-field" required value={adminData.firstName} onChange={(e) => setAdminData({...adminData, firstName: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Last Name</label>
                  <input type="text" className="input-field" required value={adminData.lastName} onChange={(e) => setAdminData({...adminData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Mobile</label>
                <input type="tel" className="input-field" required value={adminData.mobile} onChange={(e) => setAdminData({...adminData, mobile: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" required value={adminData.password} onChange={(e) => setAdminData({...adminData, password: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select className="input-field" value={adminData.role} onChange={(e) => setAdminData({...adminData, role: e.target.value})}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create User</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showEditModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={24} color="var(--primary-blue)" /> Edit User
            </h2>
            <form onSubmit={submitEditUser}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input type="text" className="input-field" required value={editingUser?.username} onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" className="input-field" required value={editingUser?.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">First Name</label>
                  <input type="text" className="input-field" required value={editingUser?.firstName || ''} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Last Name</label>
                  <input type="text" className="input-field" required value={editingUser?.lastName || ''} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Mobile</label>
                <input type="tel" className="input-field" required value={editingUser?.mobile || ''} onChange={(e) => setEditingUser({...editingUser, mobile: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select className="input-field" value={editingUser?.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Reset Password (Optional)</label>
                <input type="password" placeholder="Leave blank to keep current password" className="input-field" value={editingUser?.password || ''} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
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

export default AdminUsers;
