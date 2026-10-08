import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminScheduleMaintenance = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, assetRes, techRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/assets'),
        api.get('/users/technicians')
      ]);
      setSchedules(schedRes.data.data);
      setAssets(assetRes.data.data);
      setTechnicians(techRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({ assetId: '', scheduledDate: '', assignedTo: '', description: '', status: 'Pending' });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', formData);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to schedule maintenance');
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
          <h2>Schedule Maintenance</h2>
        </div>
        <button className="adm-btn-primary" onClick={handleOpenModal}>
          <Plus size={16} /> New Schedule
        </button>
      </div>

      <div className="adm-table-wrap" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table className="adm-table" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Description</th>
              <th>Date</th>
              <th>Assigned To</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s._id}>
                <td>{s.assetId?.name || s.assetId}</td>
                <td>{s.description}</td>
                <td>{new Date(s.scheduledDate).toLocaleDateString()}</td>
                <td>{s.assignedTo?.name || s.assignedTo?.email || '-'}</td>
                <td>
                  <span className={`badge-status ${s.status === 'Completed' ? 'available' : s.status === 'Pending' ? 'in-progress' : 'critical'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Schedule Maintenance</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={formData.assetId || ''} onChange={e => setFormData({...formData, assetId: e.target.value})} required className="adm-input">
                <option value="">Select Asset</option>
                {assets.map(a => (
                  <option key={a.id || a._id} value={a.id || a._id}>{a.name} ({a.category})</option>
                ))}
              </select>
              <select value={formData.assignedTo || ''} onChange={e => setFormData({...formData, assignedTo: e.target.value})} required className="adm-input">
                <option value="">Assign Technician</option>
                {technicians.map(t => (
                  <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                ))}
              </select>
              <input type="date" value={formData.scheduledDate || ''} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} required className="adm-input" />
              <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} required className="adm-input" />
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
