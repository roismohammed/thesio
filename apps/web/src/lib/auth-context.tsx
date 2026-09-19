import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

import { api } from "@/lib/api"

export interface CurrentUser {
  id: number
  name: string
  email: string
  is_disabled: boolean
  roles: string[]
  permissions: string[]
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface AuthContextValue {
  user: CurrentUser | null
  loading: boolean
  refresh: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_STORAGE_KEY = "thesio_auth_user"

function getStoredUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CurrentUser) : null
  } catch {
    return null
  }
}

function setStoredUser(user: CurrentUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => getStoredUser())
  const [loading, setLoading] = useState(() => !getStoredUser())

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh(): Promise<void> {
    try {
      const payload = await api<{ data: CurrentUser }>("/api/auth/me")
      setUser(payload.data)
      setStoredUser(payload.data)
    } catch {
      setUser(null)
      setStoredUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string): Promise<void> {
    const payload = await api<{ data: CurrentUser }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    })
    setUser(payload.data)
    setStoredUser(payload.data)
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const response = await api<{ data: CurrentUser }>("/api/auth/register", {
      method: "POST",
      body: payload,
    })
    setUser(response.data)
    setStoredUser(response.data)
  }

  async function signOut(): Promise<void> {
    try {
      await api("/api/auth/logout", { method: "POST" })
    } finally {
      setUser(null)
      setStoredUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return value
}
