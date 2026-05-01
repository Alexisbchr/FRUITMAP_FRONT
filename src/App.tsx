import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { OfflineBanner } from './components/OfflineBanner'
import { Home } from './pages/Home'
import { MapPage } from './pages/MapPage'
import { TreeDetail } from './pages/TreeDetail'
import { Profile } from './pages/Profile'
import { Admin } from './pages/Admin'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { useAuth } from './hooks/useAuth'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, authenticatedUser } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!['MODERATOR', 'ADMIN'].includes(authenticatedUser?.role ?? '')) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-bark-50 font-sans">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/trees/:treeId" element={<TreeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-tree" element={<Navigate to="/map" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <OfflineBanner />
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
