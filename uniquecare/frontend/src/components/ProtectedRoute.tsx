import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Backend role strings that are allowed to access this route */
  allowedRoles?: ('admin' | 'technician' | 'student' | 'lab_admin')[]
}

/** Returns the default dashboard path for a given backend role */
function getDefaultDashboard(role: string): string {
  switch (role?.toLowerCase()) {
    case 'admin':
    case 'lab_admin':
      return '/dashboard'
    case 'technician':
      return '/technician'
    case 'student':
    default:
      return '/student'
  }
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth()

  // Show loading state while session is being validated
  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', marginTop: '16px' }}>
          Validating session...
        </p>
      </div>
    )
  }

  // Not logged in → send to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → send to their own dashboard
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase()
    if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
      return <Navigate to={getDefaultDashboard(userRole)} replace />
    }
  }

  return <>{children}</>
}

export { getDefaultDashboard }
