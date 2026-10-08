import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AdminManageTechnicians } from './AdminManageTechnicians';
import { api } from '../../services/api';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AdminManageTechnicians />
    </BrowserRouter>
  );
};

describe('AdminManageTechnicians', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (api.get as any).mockReturnValue(new Promise(() => {})); // pending promise
    renderComponent();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders table with technicians', async () => {
    const mockTechs = [
      { id: '1', name: 'John Doe', email: 'john@example.com', specialty: 'AV', phone: '123', status: 'On Duty' }
    ];
    (api.get as any).mockResolvedValue({ data: { data: mockTechs } });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('john@example.com')).toBeTruthy();
    });
  });

  it('opens add technician modal', async () => {
    (api.get as any).mockResolvedValue({ data: { data: [] } });
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Add Technician')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Add Technician'));
    expect(screen.getByPlaceholderText('Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });

  it('submits new technician', async () => {
    (api.get as any).mockResolvedValue({ data: { data: [] } });
    (api.post as any).mockResolvedValue({ data: { success: true } });
    
    renderComponent();
    
    await waitFor(() => screen.getByText('Add Technician'));
    fireEvent.click(screen.getByText('Add Technician'));
    
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'New Tech' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users/technicians', expect.objectContaining({
        name: 'New Tech',
        email: 'new@example.com',
        password: 'password123'
      }));
    });
  });
});
