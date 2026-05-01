import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import type { TreeFilters } from '../types'
import { FRUIT_TYPES, MONTHS_FR } from '../utils/constants'

interface MapFiltersProps {
  currentFilters: TreeFilters
  onFiltersChange: (updatedFilters: TreeFilters) => void
}

export function MapFilters({ currentFilters, onFiltersChange }: MapFiltersProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  function handleFilterChange(filterKey: keyof TreeFilters, filterValue: string | number | undefined) {
    onFiltersChange({ ...currentFilters, [filterKey]: filterValue || undefined, page: 1 })
  }

  const activeFiltersCount = [
    currentFilters.fruitType,
    currentFilters.accessibility,
    currentFilters.condition,
    currentFilters.harvestMonth,
  ].filter(Boolean).length

  return (
    <div className="relative">
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
        aria-expanded={isPanelOpen}
      >
        <Filter size={16} />
        Filtres
        {activeFiltersCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 bg-forest-600 text-white text-xs rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isPanelOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 z-30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filtres</h3>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fermer les filtres"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="filter-fruit" className="block text-sm font-medium text-gray-700 mb-1">
                Type de fruit
              </label>
              <select
                id="filter-fruit"
                value={currentFilters.fruitType ?? ''}
                onChange={(changeEvent) => handleFilterChange('fruitType', changeEvent.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Tous les fruits</option>
                {FRUIT_TYPES.map((fruitTypeName) => (
                  <option key={fruitTypeName} value={fruitTypeName}>
                    {fruitTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-accessibility" className="block text-sm font-medium text-gray-700 mb-1">
                Accessibilité
              </label>
              <select
                id="filter-accessibility"
                value={currentFilters.accessibility ?? ''}
                onChange={(changeEvent) => handleFilterChange('accessibility', changeEvent.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Toutes</option>
                <option value="public">Public</option>
                <option value="semi-public">Semi-public</option>
                <option value="private">Privé (avec accord)</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-condition" className="block text-sm font-medium text-gray-700 mb-1">
                État de l'arbre
              </label>
              <select
                id="filter-condition"
                value={currentFilters.condition ?? ''}
                onChange={(changeEvent) => handleFilterChange('condition', changeEvent.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Tous</option>
                <option value="healthy">En bonne santé</option>
                <option value="sick">Malade</option>
                <option value="unknown">Inconnu</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-month" className="block text-sm font-medium text-gray-700 mb-1">
                Saison de récolte
              </label>
              <select
                id="filter-month"
                value={currentFilters.harvestMonth ?? ''}
                onChange={(changeEvent) =>
                  handleFilterChange('harvestMonth', changeEvent.target.value ? parseInt(changeEvent.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Tous les mois</option>
                {MONTHS_FR.map((monthName, monthIndex) => (
                  <option key={monthName} value={monthIndex + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() =>
                  onFiltersChange({
                    page: 1,
                    limit: currentFilters.limit,
                    lat: currentFilters.lat,
                    lng: currentFilters.lng,
                  })
                }
                className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Effacer les filtres ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
