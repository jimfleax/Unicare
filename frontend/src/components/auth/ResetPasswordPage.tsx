import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CircleAlert, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function ResetPasswordPage({ theme }: Props) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      <header className="home-header">
        <div className="home-brand">
          <ShieldCheck size={28} className="brand-icon" />
          <span className="brand-text">UNI<span className="brand-accent">CARE</span></span>
        </div>
      </header>
      <main className="home-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '400px', width: '100%', margin: '2rem' }}>
          <h1 className="auth-title">Reset Password</h1>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={48} color="green" style={{ margin: '0 auto 1rem' }} />
              <p style={{ marginBottom: '1.5rem' }}>Your password has been successfully reset.</p>
              <Link to="/login" className="auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="auth-subtitle">Enter your new password below</p>

              {error && (
                <div className="auth-error">
                  <CircleAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label>New Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label>Confirm Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
