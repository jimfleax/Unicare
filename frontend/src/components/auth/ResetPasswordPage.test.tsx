/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResetPasswordPage } from './ResetPasswordPage';
import { AuthProvider } from '../../context/AuthContext';

const mockToggleTheme = vi.fn();

describe('ResetPasswordPage', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/reset-password/fake-token']}>
        <AuthProvider>
          <Routes>
            <Route path="/reset-password/:token" element={<ResetPasswordPage theme="light" toggleTheme={() => {}} />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders the reset password form', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeDefined();
    expect(screen.getAllByPlaceholderText('••••••••').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeDefined();
  });

  it('shows error if passwords do not match', () => {
    renderComponent();
    
    const inputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(inputs[0], { target: { value: 'password123' } });
    fireEvent.change(inputs[1], { target: { value: 'password456' } });
    
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Passwords do not match')).toBeDefined();
  });
});
