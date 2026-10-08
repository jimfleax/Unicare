import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AdminScheduleMaintenance } from './AdminScheduleMaintenance';
import { api } from '../../services/api';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AdminScheduleMaintenance />
    </BrowserRouter>
  );
};

describe('AdminScheduleMaintenance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (api.get as any).mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('fetches and renders schedules, assets, and technicians', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/maintenance') {
        return Promise.resolve({ data: { data: [{ _id: '1', description: 'Test Maint', assetId: { name: 'Asset A' }, scheduledDate: '2023-12-01T00:00:00.000Z', status: 'Pending' }] } });
      }
      if (url === '/assets') {
        return Promise.resolve({ data: { data: [{ id: 'a1', name: 'Asset A' }] } });
      }
      if (url === '/users/technicians') {
        return Promise.resolve({ data: { data: [{ id: 't1', name: 'Tech One' }] } });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Maint')).toBeTruthy();
      expect(screen.getByText('Asset A')).toBeTruthy();
    });
  });

  it('submits new maintenance schedule', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/assets') return Promise.resolve({ data: { data: [{ id: 'a1', name: 'Asset A' }] } });
      if (url === '/users/technicians') return Promise.resolve({ data: { data: [{ id: 't1', name: 'Tech One' }] } });
      return Promise.resolve({ data: { data: [] } });
    });
    (api.post as any).mockResolvedValue({ data: { success: true } });

    renderComponent();
    
    await waitFor(() => screen.getByText('New Schedule'));
    fireEvent.click(screen.getByText('New Schedule'));
    
    // Select asset and technician
    await waitFor(() => {
      expect(screen.getByText('Select Asset')).toBeTruthy();
    });
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'a1' } });
    
    fireEvent.change(selects[1], { target: { value: 't1' } });

    // Set date
    // Date input can be found by type or placeholder, let's use document query
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2023-12-01' } });
    }

    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Fix AC' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/maintenance', expect.objectContaining({
        description: 'Fix AC',
      }));
    });
  });
});
