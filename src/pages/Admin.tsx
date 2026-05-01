import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Trash2, BarChart2 } from 'lucide-react'
import { fetchPendingTrees, verifyTree, adminDeleteTree, fetchAdminStats } from '../services/api'
import { formatDate } from '../utils/helpers'
import type { FruitTree } from '../types'

type AdminTab = 'pending' | 'stats'

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('pending')
  const queryClient = useQueryClient()

  const { data: pendingTreesResponse, isLoading: isLoadingPending } = useQuery({
    queryKey: ['admin-pending-trees'],
    queryFn: () => fetchPendingTrees(),
    enabled: activeTab === 'pending',
  })

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    enabled: activeTab === 'stats',
  })

  const verifyMutation = useMutation({
    mutationFn: verifyTree,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending-trees'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteTree,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending-trees'] }),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Administration</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-forest-600 text-forest-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle size={16} />
          À valider
          {pendingTreesResponse && (
            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              {pendingTreesResponse.pagination.total}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-forest-600 text-forest-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 size={16} />
          Statistiques
        </button>
      </div>

      {activeTab === 'pending' && (
        <>
          {isLoadingPending && <div className="text-center py-8 text-gray-400">Chargement…</div>}

          {pendingTreesResponse?.data.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-400">Aucun signalement en attente.</p>
            </div>
          )}

          {pendingTreesResponse && pendingTreesResponse.data.length > 0 && (
            <div className="space-y-3">
              {pendingTreesResponse.data.map((pendingTree: FruitTree) => (
                <div
                  key={pendingTree.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{pendingTree.species}</h3>
                      <span className="text-sm text-forest-600">{pendingTree.fruitType}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{pendingTree.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>📍 {pendingTree.city}</span>
                      <span>
                        👤 {(pendingTree.createdBy as { username?: string })?.username ?? 'Inconnu'}
                      </span>
                      <span>📅 {formatDate(pendingTree.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => verifyMutation.mutate(pendingTree.id)}
                      disabled={verifyMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-600 text-white text-sm rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-60"
                      title="Valider"
                    >
                      <CheckCircle size={14} />
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cet arbre définitivement ?')) {
                          deleteMutation.mutate(pendingTree.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'stats' && adminStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Arbres signalés', value: adminStats.totalTrees, emoji: '🌳' },
              { label: 'Utilisateurs', value: adminStats.totalUsers, emoji: '👤' },
              { label: 'Commentaires', value: adminStats.totalComments, emoji: '💬' },
            ].map((statItem) => (
              <div
                key={statItem.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center"
              >
                <div className="text-3xl mb-2">{statItem.emoji}</div>
                <div className="text-3xl font-bold text-gray-900">{statItem.value.toLocaleString('fr-FR')}</div>
                <div className="text-sm text-gray-500 mt-1">{statItem.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top 10 des villes</h3>
            <div className="space-y-2">
              {adminStats.topCities.map((cityData, cityRank) => (
                <div key={cityData.city} className="flex items-center gap-3">
                  <span className="w-6 text-sm text-gray-400 text-right">{cityRank + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cityData.city || 'Ville inconnue'}</span>
                      <span className="text-sm text-gray-400">{cityData.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-500 rounded-full"
                        style={{ width: `${(cityData.count / adminStats.topCities[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
