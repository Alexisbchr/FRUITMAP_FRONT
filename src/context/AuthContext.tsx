import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { User } from '../types'
import { loginUser, registerUser } from '../services/api'

interface AuthContextValue {
  authenticatedUser: User | null
  authToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): User | null {
  try {
    const storedUser = localStorage.getItem('fruitmap_user')
    return storedUser ? (JSON.parse(storedUser) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(loadStoredUser)
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('fruitmap_token'))

  const persistAuthData = useCallback((token: string, user: User) => {
    localStorage.setItem('fruitmap_token', token)
    localStorage.setItem('fruitmap_user', JSON.stringify(user))
    setAuthToken(token)
    setAuthenticatedUser(user)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const authResponse = await loginUser(email, password)
    persistAuthData(authResponse.token, authResponse.user)
  }, [persistAuthData])

  const register = useCallback(async (email: string, password: string, username: string) => {
    const authResponse = await registerUser(email, password, username)
    persistAuthData(authResponse.token, authResponse.user)
  }, [persistAuthData])

  const logout = useCallback(() => {
    localStorage.removeItem('fruitmap_token')
    localStorage.removeItem('fruitmap_user')
    setAuthToken(null)
    setAuthenticatedUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        authenticatedUser,
        authToken,
        isAuthenticated: !!authenticatedUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const contextValue = useContext(AuthContext)
  if (!contextValue) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider')
  }
  return contextValue
}
