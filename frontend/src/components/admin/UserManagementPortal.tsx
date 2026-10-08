import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export const UserManagementPortal: React.FC = () => {
  const { data: usersData, error, isLoading, mutate } = useSWR('/users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    specialty: '',
    status: 'Off Duty',
    branch: '',
    batch: '',
    rollNo: ''
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const users = usersData?.data || [];
  
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole ? u.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUserId(user.id);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'student',
        specialty: user.specialty || '',
        status: user.status || 'Off Duty',
        branch: user.branch || '',
        batch: user.batch || '',
        rollNo: user.rollNo || ''
      });
    } else {
      setEditingUserId(null);
      setFormData({
        name: '', email: '', password: '', role: 'student', specialty: '', status: 'Off Duty', branch: '', batch: '', rollNo: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      if (formData.password) payload.password = formData.password;
      
      if (formData.role === 'technician') {
        payload.specialty = formData.specialty;
        payload.status = formData.status;
      } else if (formData.role === 'student') {
        payload.branch = formData.branch;
        payload.batch = formData.batch;
        payload.rollNo = formData.rollNo;
      }

      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setIsModalOpen(false);
      mutate();
    } catch (err) {
      console.error(err);
      alert('Error saving user');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        mutate();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="adm-container">
      <h1 className="adm-header">User Management</h1>
      
      <div className="adm-actions-row">
        <button className="adm-btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Create User
        </button>
        <div className="adm-search-wrap">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="adm-select">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="technician">Technician</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Categories/Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u: any) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.role === 'technician' && <span className="adm-badge badge-tech">{u.specialty}</span>}
                  {u.role === 'student' && <span className="adm-badge badge-student">{u.branch}</span>}
                </td>
                <td>
                  <button className="adm-btn-icon" onClick={() => handleOpenModal(u)}><Edit2 size={16} /></button>
                  <button className="adm-btn-icon text-red" onClick={() => handleDelete(u.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <h2>{editingUserId ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleSave}>
              <div className="adm-form-group">
                <label htmlFor="name">Name</label>
                <input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="adm-form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="adm-form-group">
                <label htmlFor="password">Password {editingUserId && '(Leave empty to keep)'}</label>
                <input id="password" type="password" required={!editingUserId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="adm-form-group">
                <label htmlFor="role">Role</label>
                <select id="role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'technician' && (
                <>
                  <div className="adm-form-group">
                    <label htmlFor="specialty">Specialty</label>
                    <input id="specialty" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Off Duty">Off Duty</option>
                      <option value="On Shift">On Shift</option>
                      <option value="In Field">In Field</option>
                    </select>
                  </div>
                </>
              )}

              {formData.role === 'student' && (
                <>
                  <div className="adm-form-group">
                    <label htmlFor="branch">Branch</label>
                    <input id="branch" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor="batch">Batch</label>
                    <input id="batch" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} />
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor="rollNo">Roll No</label>
                    <input id="rollNo" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} />
                  </div>
                </>
              )}

              <div className="adm-modal-actions">
                <button type="button" className="adm-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="adm-btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
