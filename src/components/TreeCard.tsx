import { MapPin, Calendar, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FruitTree } from '../types'
import { Badge } from './Badge'
import { CONDITION_COLORS, CONDITION_LABELS, ACCESSIBILITY_LABELS } from '../utils/constants'
import { formatHarvestMonths, buildPhotoUrl } from '../utils/helpers'

interface TreeCardProps {
  fruitTree: FruitTree
}

export function TreeCard({ fruitTree }: TreeCardProps) {
  const coverPhotoUrl = fruitTree.photos[0] ? buildPhotoUrl(fruitTree.photos[0]) : null

  return (
    <Link
      to={`/trees/${fruitTree.id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-40 bg-gray-100 overflow-hidden">
        {coverPhotoUrl ? (
          <img
            src={coverPhotoUrl}
            alt={`${fruitTree.species} à ${fruitTree.city}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌳</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{fruitTree.species}</h3>
            <p className="text-sm text-forest-600 font-medium">{fruitTree.fruitType}</p>
          </div>
          {fruitTree.isVerified && (
            <CheckCircle size={18} className="text-forest-500 flex-shrink-0 mt-0.5" aria-label="Vérifié" />
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="truncate">{fruitTree.city}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge
            label={CONDITION_LABELS[fruitTree.condition] ?? fruitTree.condition}
            colorClasses={CONDITION_COLORS[fruitTree.condition]}
          />
          <Badge label={ACCESSIBILITY_LABELS[fruitTree.accessibility] ?? fruitTree.accessibility} />
        </div>

        {fruitTree.harvestMonths.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{formatHarvestMonths(fruitTree.harvestMonths)}</span>
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
          <span>{fruitTree.confirmations} confirmation{fruitTree.confirmations > 1 ? 's' : ''}</span>
          {fruitTree._count && (
            <span>{fruitTree._count.comments} commentaire{fruitTree._count.comments > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
