import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MapPin, Star, TreePine, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchMyContributions, fetchMyFavorites } from '../services/api'
import { TreeCard } from '../components/TreeCard'
import { formatDate } from '../utils/helpers'

type ProfileTab = 'contributions' | 'favorites'

export function Profile() {
  const { authenticatedUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('contributions')

  const { data: contributionsResponse, isLoading: isLoadingContributions } = useQuery({
    queryKey: ['my-contributions'],
    queryFn: () => fetchMyContributions(),
    enabled: activeTab === 'contributions',
  })

  const { data: favoriteTrees, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: fetchMyFavorites,
    enabled: activeTab === 'favorites',
  })

  if (!authenticatedUser) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-2xl font-bold text-forest-700">
              {authenticatedUser.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{authenticatedUser.username}</h1>
              <p className="text-sm text-gray-400">{authenticatedUser.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Membre depuis {formatDate(authenticatedUser.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('contributions')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'contributions'
              ? 'border-forest-600 text-forest-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <TreePine size={16} />
          Mes signalements
          {contributionsResponse && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {contributionsResponse.pagination.total}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'favorites'
              ? 'border-forest-600 text-forest-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star size={16} />
          Favoris
          {favoriteTrees && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {favoriteTrees.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'contributions' && (
        <>
          {isLoadingContributions && (
            <div className="text-center py-8 text-gray-400">Chargement…</div>
          )}
          {contributionsResponse?.data.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-gray-400 mb-4">Vous n'avez pas encore signalé d'arbre.</p>
              <Link
                to="/add-tree"
                className="inline-flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors"
              >
                <MapPin size={16} />
                Signaler mon premier arbre
              </Link>
            </div>
          )}
          {contributionsResponse && contributionsResponse.data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contributionsResponse.data.map((fruitTree) => (
                <TreeCard key={fruitTree.id} fruitTree={fruitTree} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'favorites' && (
        <>
          {isLoadingFavorites && (
            <div className="text-center py-8 text-gray-400">Chargement…</div>
          )}
          {favoriteTrees?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-gray-400">Aucun arbre en favoris pour l'instant.</p>
            </div>
          )}
          {favoriteTrees && favoriteTrees.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteTrees.map((fruitTree) => (
                <TreeCard key={fruitTree.id} fruitTree={fruitTree} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
