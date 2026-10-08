import React, { useState } from 'react';
import useSWR from 'swr';
import { fetcher, createAssetApi, updateAssetApi, deleteAssetApi, createInventoryApi, updateInventoryApi, deleteInventoryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Grid2X2, Plus, Edit2, Trash2, Box, Cpu } from 'lucide-react';

export function InventoryAssetsManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assets' | 'inventory'>('assets');
  
  const { data: assets = [], mutate: mutateAssets } = useSWR('/assets', fetcher);
  const { data: inventory = [], mutate: mutateInventory } = useSWR('/inventory', fetcher);

  const isAdmin = user?.role === 'admin' || user?.role === 'lab_admin';

  // State for forms
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [editingInventory, setEditingInventory] = useState<any>(null);

  // Asset Form State
  const [assetForm, setAssetForm] = useState({ tagId: '', name: '', healthStatus: 'healthy', location: '', category: '' });

  // Inventory Form State
  const [inventoryForm, setInventoryForm] = useState({ name: '', sku: '', category: '', stock: 0, minStockLevel: 10, unit: 'pcs', price: 0 });

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAsset) {
      await updateAssetApi(editingAsset.tagId, assetForm);
    } else {
      await createAssetApi(assetForm);
    }
    setShowAssetForm(false);
    setEditingAsset(null);
    mutateAssets();
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInventory) {
      await updateInventoryApi(editingInventory._id, inventoryForm);
    } else {
      await createInventoryApi(inventoryForm);
    }
    setShowInventoryForm(false);
    setEditingInventory(null);
    mutateInventory();
  };

  const handleDeleteAsset = async (tagId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      await deleteAssetApi(tagId);
      mutateAssets();
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (confirm('Are you sure you want to delete this spare part?')) {
      await deleteInventoryApi(id);
      mutateInventory();
    }
  };

  const editAsset = (asset: any) => {
    setEditingAsset(asset);
    setAssetForm({ tagId: asset.tagId, name: asset.name, healthStatus: asset.healthStatus, location: asset.location, category: asset.category });
    setShowAssetForm(true);
  };

  const editInventory = (part: any) => {
    setEditingInventory(part);
    setInventoryForm({ name: part.name, sku: part.sku, category: part.category, stock: part.stock, minStockLevel: part.minStockLevel, unit: part.unit, price: part.price });
    setShowInventoryForm(true);
  };

  return (
    <div className="dashboard-content">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--txt)' }}>
          <Grid2X2 className="inline-block mr-2" /> 
          Inventory & Assets Manager
        </h1>
        
        {isAdmin && (
          <div>
            {activeTab === 'assets' ? (
              <button onClick={() => { setEditingAsset(null); setAssetForm({ tagId: '', name: '', healthStatus: 'healthy', location: '', category: '' }); setShowAssetForm(true); }} className="btn-red flex items-center gap-2">
                <Plus size={16} /> Add Asset
              </button>
            ) : (
              <button onClick={() => { setEditingInventory(null); setInventoryForm({ name: '', sku: '', category: '', stock: 0, minStockLevel: 10, unit: 'pcs', price: 0 }); setShowInventoryForm(true); }} className="btn-red flex items-center gap-2">
                <Plus size={16} /> Add Spare Part
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[var(--border)]">
        <button 
          onClick={() => setActiveTab('assets')} 
          className={`pb-2 px-4 ${activeTab === 'assets' ? 'border-b-2 border-red-500 text-red-500 font-bold' : 'text-[var(--txt-muted)]'}`}
        >
          <Cpu className="inline-block mr-2" size={18} /> Assets
        </button>
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`pb-2 px-4 ${activeTab === 'inventory' ? 'border-b-2 border-red-500 text-red-500 font-bold' : 'text-[var(--txt-muted)]'}`}
        >
          <Box className="inline-block mr-2" size={18} /> Spare Parts
        </button>
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-left" style={{ color: 'var(--txt)' }}>
          <thead className="bg-[var(--bg-card-alt)]">
            <tr>
              {activeTab === 'assets' ? (
                <>
                  <th className="p-4 font-semibold text-sm">Tag ID</th>
                  <th className="p-4 font-semibold text-sm">Name</th>
                  <th className="p-4 font-semibold text-sm">Category</th>
                  <th className="p-4 font-semibold text-sm">Location</th>
                  <th className="p-4 font-semibold text-sm">Health</th>
                </>
              ) : (
                <>
                  <th className="p-4 font-semibold text-sm">SKU</th>
                  <th className="p-4 font-semibold text-sm">Name</th>
                  <th className="p-4 font-semibold text-sm">Category</th>
                  <th className="p-4 font-semibold text-sm">Stock</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                </>
              )}
              {isAdmin && <th className="p-4 font-semibold text-sm text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {activeTab === 'assets' ? (
              assets.map((item: any) => (
                <tr key={item.tagId} className="border-t border-[var(--border)]">
                  <td className="p-4 text-sm font-mono">{item.tagId}</td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-sm">{item.category}</td>
                  <td className="p-4 text-sm">{item.location}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${item.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' : item.healthStatus === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {item.healthStatus}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <button data-testid={`edit-asset-${item.tagId}`} onClick={() => editAsset(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                      <button data-testid={`delete-asset-${item.tagId}`} onClick={() => handleDeleteAsset(item.tagId)} className="p-2 text-red-500 hover:bg-red-50 rounded ml-2"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              inventory.map((item: any) => (
                <tr key={item._id} className="border-t border-[var(--border)]">
                  <td className="p-4 text-sm font-mono">{item.sku}</td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-sm">{item.category}</td>
                  <td className="p-4 text-sm">{item.stock} {item.unit}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${item.status === 'In Stock' ? 'bg-green-100 text-green-800' : item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {item.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <button data-testid={`edit-inv-${item._id}`} onClick={() => editInventory(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                      <button data-testid={`delete-inv-${item._id}`} onClick={() => handleDeleteInventory(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded ml-2"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Asset Modal */}
      {showAssetForm && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
              <button className="modal-close" onClick={() => setShowAssetForm(false)}>✕</button>
            </div>
            <form onSubmit={handleAssetSubmit} className="p-6 flex flex-col gap-4">
              <input type="text" placeholder="Tag ID" value={assetForm.tagId} onChange={e => setAssetForm({...assetForm, tagId: e.target.value})} disabled={!!editingAsset} required className="p-2 border rounded" />
              <input type="text" placeholder="Name" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} required className="p-2 border rounded" />
              <select value={assetForm.healthStatus} onChange={e => setAssetForm({...assetForm, healthStatus: e.target.value})} className="p-2 border rounded">
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="broken">Broken</option>
              </select>
              <input type="text" placeholder="Location" value={assetForm.location} onChange={e => setAssetForm({...assetForm, location: e.target.value})} className="p-2 border rounded" />
              <input type="text" placeholder="Category" value={assetForm.category} onChange={e => setAssetForm({...assetForm, category: e.target.value})} className="p-2 border rounded" />
              <button type="submit" className="btn-red py-2 mt-2" data-testid="submit-asset">Save Asset</button>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryForm && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingInventory ? 'Edit Spare Part' : 'Add New Spare Part'}</h3>
              <button className="modal-close" onClick={() => setShowInventoryForm(false)}>✕</button>
            </div>
            <form onSubmit={handleInventorySubmit} className="p-6 flex flex-col gap-4">
              <input type="text" placeholder="SKU" value={inventoryForm.sku} onChange={e => setInventoryForm({...inventoryForm, sku: e.target.value})} required className="p-2 border rounded" />
              <input type="text" placeholder="Name" value={inventoryForm.name} onChange={e => setInventoryForm({...inventoryForm, name: e.target.value})} required className="p-2 border rounded" />
              <input type="text" placeholder="Category" value={inventoryForm.category} onChange={e => setInventoryForm({...inventoryForm, category: e.target.value})} className="p-2 border rounded" />
              <input type="number" placeholder="Stock" value={inventoryForm.stock} onChange={e => setInventoryForm({...inventoryForm, stock: Number(e.target.value)})} required className="p-2 border rounded" />
              <input type="number" placeholder="Min Stock Level" value={inventoryForm.minStockLevel} onChange={e => setInventoryForm({...inventoryForm, minStockLevel: Number(e.target.value)})} className="p-2 border rounded" />
              <input type="text" placeholder="Unit (e.g. pcs, m)" value={inventoryForm.unit} onChange={e => setInventoryForm({...inventoryForm, unit: e.target.value})} className="p-2 border rounded" />
              <button type="submit" className="btn-red py-2 mt-2" data-testid="submit-inv">Save Spare Part</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
