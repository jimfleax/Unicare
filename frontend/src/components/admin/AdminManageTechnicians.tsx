import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminManageTechnicians = () => {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/technicians');
      setTechnicians(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch technicians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleOpenModal = (tech: any = null) => {
    if (tech) {
      setFormData(tech);
      setIsEditing(true);
    } else {
      setFormData({ name: '', email: '', password: '', specialty: '', phone: '' });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/users/technicians/${formData.id || formData._id}`, formData);
      } else {
        await api.post('/users/technicians', formData);
      }
      setShowModal(false);
      fetchTechnicians();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save technician');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this technician?')) return;
    try {
      await api.delete(`/users/technicians/${id}`);
      fetchTechnicians();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete technician');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="adm-container">
      <div className="adm-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="adm-btn-outline" onClick={() => navigate('/admin')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h2>Manage Technicians</h2>
        </div>
        <button className="adm-btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Technician
        </button>
      </div>

      <div className="adm-table-wrap" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table className="adm-table" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => (
              <tr key={t.id || t._id}>
                <td>{t.name}</td>
                <td>{t.email}</td>
                <td>{t.specialty || '-'}</td>
                <td>{t.phone || '-'}</td>
                <td>{t.status || '-'}</td>
                <td>
                  <button style={{ marginRight: '10px', cursor: 'pointer' }} onClick={() => handleOpenModal(t)}>
                    <Edit2 size={16} />
                  </button>
                  <button style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDelete(t.id || t._id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>{isEditing ? 'Edit Technician' : 'Add Technician'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required className="adm-input" />
              <input type="email" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required className="adm-input" />
              {!isEditing && <input type="password" placeholder="Password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required className="adm-input" />}
              <input type="text" placeholder="Specialty" value={formData.specialty || ''} onChange={e => setFormData({...formData, specialty: e.target.value})} className="adm-input" />
              <input type="text" placeholder="Phone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="adm-input" />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="adm-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
