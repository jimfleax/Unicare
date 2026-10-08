import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserManagementPortal } from './UserManagementPortal';
import useSWR from 'swr';
import { api } from '../../services/api';

vi.mock('swr');
vi.mock('../../services/api');

const mockUseSWR = useSWR as any;
const mockApi = api as any;

describe('UserManagementPortal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and lists users', async () => {
    mockUseSWR.mockReturnValue({
      data: {
        success: true,
        data: [
          { id: '1', name: 'Student One', email: 's1@example.com', role: 'student', branch: 'CSE' },
          { id: '2', name: 'Tech One', email: 't1@example.com', role: 'technician', specialty: 'IT' }
        ]
      },
      error: undefined,
      isLoading: false,
      mutate: vi.fn()
    });

    render(<UserManagementPortal />);

    expect(screen.getByText('User Management')).toBeDefined();
    expect(screen.getByText('Student One')).toBeDefined();
    expect(screen.getByText('Tech One')).toBeDefined();
    expect(screen.getByText('CSE')).toBeDefined(); // category info
    expect(screen.getByText('IT')).toBeDefined();
  });

  it('handles user creation', async () => {
    const mockMutate = vi.fn();
    mockUseSWR.mockReturnValue({
      data: { success: true, data: [] },
      error: undefined,
      isLoading: false,
      mutate: mockMutate
    });

    mockApi.post.mockResolvedValueOnce({ data: { success: true, data: { id: '3', name: 'New User' } } });

    render(<UserManagementPortal />);

    fireEvent.click(screen.getByText('Create User'));
    
    // Fill out the modal
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'student' } });
    
    // Should show branch field for student
    fireEvent.change(screen.getByLabelText('Branch'), { target: { value: 'ECE' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/users', {
        name: 'New User',
        email: 'new@example.com',
        password: 'pass123',
        role: 'student',
        branch: 'ECE',
        batch: '',
        rollNo: ''
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('handles user deletion', async () => {
    const mockMutate = vi.fn();
    mockUseSWR.mockReturnValue({
      data: {
        success: true,
        data: [{ id: '1', name: 'Delete Me', email: 'del@example.com', role: 'student' }]
      },
      error: undefined,
      isLoading: false,
      mutate: mockMutate
    });

    mockApi.delete.mockResolvedValueOnce({ data: { success: true } });

    window.confirm = vi.fn().mockReturnValue(true); // Mock confirm

    render(<UserManagementPortal />);

    fireEvent.click(screen.getAllByRole('button').find(b => b.classList.contains('text-red')) as HTMLElement);

    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith('/users/1');
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
