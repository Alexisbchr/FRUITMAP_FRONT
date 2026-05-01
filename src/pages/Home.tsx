import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Map, List, ArrowRight } from 'lucide-react'
import { useTrees } from '../hooks/useTrees'
import { TreeCard } from '../components/TreeCard'
import { MapFilters } from '../components/MapFilters'
import type { TreeFilters } from '../types'

export function Home() {
  const [treeFilters, setTreeFilters] = useState<TreeFilters>({ page: 1, limit: 12 })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: treesResponse, isLoading, error } = useTrees(treeFilters)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Recense les arbres fruitiers autour de toi
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          FruitMap est une carte collaborative des ressources fruitières locales. Discover, partage, et cueille responsablement.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Link
            to="/map"
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors"
          >
            <Map size={18} />
            Voir la carte
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Arbres récents
            {treesResponse && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({treesResponse.pagination.total} au total)
              </span>
            )}
          </h2>
          <MapFilters currentFilters={treeFilters} onFiltersChange={setTreeFilters} />
        </div>

        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            aria-label="Vue grille"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            aria-label="Vue liste"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, skeletonIndex) => (
            <div
              key={skeletonIndex}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="text-center py-12 text-red-500">
          Impossible de charger les arbres. Vérifiez votre connexion.
        </div>
      )}

      {treesResponse && treesResponse.data.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🌿</div>
          <p>Aucun arbre trouvé avec ces critères.</p>
        </div>
      )}

      {treesResponse && treesResponse.data.length > 0 && (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }
          >
            {treesResponse.data.map((fruitTree) => (
              <TreeCard key={fruitTree.id} fruitTree={fruitTree} />
            ))}
          </div>

          {treesResponse.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setTreeFilters((previous) => ({ ...previous, page: (previous.page ?? 1) - 1 }))}
                disabled={(treeFilters.page ?? 1) <= 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {treeFilters.page} / {treesResponse.pagination.totalPages}
              </span>
              <button
                onClick={() => setTreeFilters((previous) => ({ ...previous, page: (previous.page ?? 1) + 1 }))}
                disabled={(treeFilters.page ?? 1) >= treesResponse.pagination.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-12 text-center">
        <Link
          to="/map"
          className="inline-flex items-center gap-2 text-forest-600 font-medium hover:underline"
        >
          Voir tous les arbres sur la carte <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
