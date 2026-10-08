import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { InventoryAssetsManager } from './InventoryAssetsManager';
import { useAuth } from '../../context/AuthContext';
import useSWR from 'swr';
import { createAssetApi, deleteAssetApi } from '../../services/api';

vi.mock('../../context/AuthContext');
vi.mock('swr');
vi.mock('../../services/api', () => ({
  fetcher: vi.fn(),
  createAssetApi: vi.fn(),
  updateAssetApi: vi.fn(),
  deleteAssetApi: vi.fn(),
  createInventoryApi: vi.fn(),
  updateInventoryApi: vi.fn(),
  deleteInventoryApi: vi.fn(),
}));

describe('InventoryAssetsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default admin mock
    (useAuth as any).mockReturnValue({
      user: { role: 'admin', name: 'Admin' }
    });

    (useSWR as any).mockImplementation((key: string) => {
      if (key === '/assets') {
        return { data: [{ tagId: 'TAG-1', name: 'Asset 1', healthStatus: 'healthy', location: 'Lab', category: 'IT' }], mutate: vi.fn() };
      }
      if (key === '/inventory') {
        return { data: [{ _id: '1', sku: 'SKU-1', name: 'Part 1', category: 'Parts', stock: 10, unit: 'pcs', status: 'In Stock' }], mutate: vi.fn() };
      }
      return { data: [] };
    });
  });

  it('renders assets tab by default and shows admin actions', () => {
    render(<InventoryAssetsManager />);
    expect(screen.getByText('Inventory & Assets Manager')).toBeTruthy();
    expect(screen.getByText('Add Asset')).toBeTruthy();
    expect(screen.getByText('Asset 1')).toBeTruthy();
    expect(screen.getByTestId('edit-asset-TAG-1')).toBeTruthy();
    expect(screen.getByTestId('delete-asset-TAG-1')).toBeTruthy();
  });

  it('hides admin actions for non-admin users', () => {
    (useAuth as any).mockReturnValue({
      user: { role: 'technician', name: 'Tech' }
    });
    render(<InventoryAssetsManager />);
    expect(screen.queryByText('Add Asset')).toBeNull();
    expect(screen.queryByTestId('edit-asset-TAG-1')).toBeNull();
    expect(screen.queryByTestId('delete-asset-TAG-1')).toBeNull();
  });

  it('switches to inventory tab', () => {
    render(<InventoryAssetsManager />);
    fireEvent.click(screen.getByText('Spare Parts'));
    expect(screen.getByText('Part 1')).toBeTruthy();
    expect(screen.getByText('Add Spare Part')).toBeTruthy();
  });

  it('opens add asset form and submits', async () => {
    (createAssetApi as any).mockResolvedValueOnce(true);
    
    render(<InventoryAssetsManager />);
    fireEvent.click(screen.getByText('Add Asset'));
    
    expect(screen.getByText('Add New Asset')).toBeTruthy();
    
    const tagInput = screen.getByPlaceholderText('Tag ID');
    const nameInput = screen.getByPlaceholderText('Name');
    
    fireEvent.change(tagInput, { target: { value: 'TAG-NEW' } });
    fireEvent.change(nameInput, { target: { value: 'New Asset' } });
    
    fireEvent.click(screen.getByTestId('submit-asset'));
    
    await waitFor(() => {
      expect(createAssetApi).toHaveBeenCalledWith(expect.objectContaining({ tagId: 'TAG-NEW', name: 'New Asset' }));
    });
  });
});
