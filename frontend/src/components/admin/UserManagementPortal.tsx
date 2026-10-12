import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '../ui';

export const UserManagementPortal: React.FC = () => {
  const { data: usersData, isLoading, mutate } = useSWR('/users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  
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
    const matchesRole = filterRole !== 'all' ? u.role === filterRole : true;
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

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setUserToDelete(null);
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
        <div style={{ minWidth: '150px' }}>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="adm-select" style={{ height: '38px', minWidth: '150px' }}>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>
                  {u.role === 'technician' && <span className="adm-badge badge-tech">{u.specialty}</span>}
                  {u.role === 'student' && <span className="adm-badge badge-student">{u.branch}</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="adm-btn-icon" onClick={() => handleOpenModal(u)} aria-label="Edit user">
                          <Edit2 size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Edit user</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="adm-btn-icon text-red" onClick={() => setUserToDelete({ id: u.id, name: u.name })} aria-label="Delete user">
                          <Trash2 size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Delete user</TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* User Create/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent style={{ maxWidth: '520px' }}>
          <DialogHeader>
            <DialogTitle>{editingUserId ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>
              {editingUserId ? 'Update account details and role permissions.' : 'Create a new user account with role permissions.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} style={{ marginTop: '16px' }}>
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
              <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                <SelectTrigger id="role" style={{ width: '100%' }}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'technician' && (
              <>
                <div className="adm-form-group">
                  <label htmlFor="specialty">Specialty</label>
                  <input id="specialty" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
                </div>
                <div className="adm-form-group">
                  <label htmlFor="status">Status</label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger id="status" style={{ width: '100%' }}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Off Duty">Off Duty</SelectItem>
                      <SelectItem value="On Shift">On Shift</SelectItem>
                      <SelectItem value="In Field">In Field</SelectItem>
                    </SelectContent>
                  </Select>
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

            <div className="adm-modal-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="adm-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="adm-btn-primary">Save</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User AlertDialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => { if (!open) setUserToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} style={{ background: 'var(--red)', color: '#fff' }}>
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
