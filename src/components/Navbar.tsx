import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Map, User, ShieldCheck, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function Navbar() {
  const { isAuthenticated, authenticatedUser, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-forest-700 text-lg">
          🍎 <span>FruitMap</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-forest-50 text-forest-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Map size={16} />
            <span className="hidden sm:inline">Carte</span>
          </NavLink>


          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-forest-50 text-forest-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <User size={16} />
                <span className="hidden sm:inline">{authenticatedUser?.username}</span>
              </NavLink>

              {(authenticatedUser?.role === 'MODERATOR' || authenticatedUser?.role === 'ADMIN') && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-forest-50 text-forest-700' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <ShieldCheck size={16} />
                  <span className="hidden sm:inline">Admin</span>
                </NavLink>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors"
            >
              <LogIn size={16} />
              <span>Connexion</span>
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}
