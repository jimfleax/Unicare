import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginApi, getMeApi } from '../services/api'

/* ── Types ─────────────────────────────────────────────────── */
export interface AuthUser {
  _id: string
  name: string
  email: string
  role: 'student' | 'technician' | 'admin' | 'lab_admin'
  token: string
}

/** Frontend display role derived from backend role */
export type DisplayRole = 'Admin' | 'Tech' | 'Student'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  displayRole: DisplayRole
  login: (email: string, password: string) => Promise<boolean>
  
  logout: () => void
  clearError: () => void
}


const AuthContext = createContext<AuthContextValue | null>(null)

/* ── Helpers ───────────────────────────────────────────────── */
const STORAGE_KEY = 'ucare-auth'

function mapToDisplayRole(backendRole: string): DisplayRole {
  switch (backendRole?.toLowerCase()) {
    case 'admin':
    case 'lab_admin':
      return 'Admin'
    case 'technician':
      return 'Tech'
    case 'student':
    default:
      return 'Student'
  }
}

function saveToStorage(user: AuthUser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch { /* quota exceeded fallback */ }
}

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

/* ── Provider ──────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Validate existing session on mount
  useEffect(() => {
    async function restoreSession() {
      const stored = loadFromStorage()
      if (!stored?.token) {
        setLoading(false)
        return
      }

      try {
        const result = await getMeApi(stored.token)
        if (result && result.user) {
          const restored: AuthUser = {
            _id: result.user._id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            token: stored.token,
          }
          setUser(restored)
          saveToStorage(restored)
        } else {
          // Token invalid or backend offline — keep stored user for offline access
          setUser(stored)
        }
      } catch {
        // Backend unreachable — use stored data so the app still works
        setUser(stored)
      }

      setLoading(false)
    }

    restoreSession()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null)
    setLoading(true)

    try {
      const result = await loginApi(email, password)
      if (!result.success) {
        setError(result.message || 'Login failed')
        setLoading(false)
        return false
      }

      const authUser: AuthUser = {
        _id: result.data.user._id,
        name: result.data.user.name,
        email: result.data.user.email,
        role: result.data.user.role,
        token: result.data.token,
      }

      setUser(authUser)
      saveToStorage(authUser)
      setLoading(false)
      return true
    } catch (err: any) {
      setError(err.message || 'Network error — is the backend running?')
      setLoading(false)
      return false
    }
  }, [])

  

  const logout = useCallback(() => {
    setUser(null)
    clearStorage()
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value: AuthContextValue = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    displayRole: user ? mapToDisplayRole(user.role) : 'Student',
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ── Hook ──────────────────────────────────────────────────── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export { mapToDisplayRole }
