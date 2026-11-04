import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserManagementPortal } from './UserManagementPortal';
import { TooltipProvider } from '@radix-ui/react-tooltip';
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

    render(
      <TooltipProvider>
        <UserManagementPortal />
      </TooltipProvider>
    );

    expect(screen.getByText('User Management')).toBeDefined();
    expect(screen.getByText('Student One')).toBeDefined();
    expect(screen.getByText('Tech One')).toBeDefined();
    expect(screen.getByText('CSE')).toBeDefined();
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

    mockApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: '3', name: 'New User', email: 'new@example.com', role: 'student' }
      }
    });

    render(
      <TooltipProvider>
        <UserManagementPortal />
      </TooltipProvider>
    );

    fireEvent.click(screen.getByText('Create User'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
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

    render(
      <TooltipProvider>
        <UserManagementPortal />
      </TooltipProvider>
    );

    fireEvent.click(screen.getAllByRole('button').find(b => b.classList.contains('text-red')) as HTMLElement);

    // Click confirm inside AlertDialog
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));

    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith('/users/1');
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
