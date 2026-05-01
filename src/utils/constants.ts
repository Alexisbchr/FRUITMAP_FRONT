export const DEFAULT_MAP_ZOOM = 13
export const DEFAULT_MAP_CENTER: [number, number] = [46.603354, 1.888334] // Centre de la France
export const MAX_PHOTOS_PER_TREE = 3
export const MAX_PHOTO_SIZE_MB = 5
export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export const FRUIT_TYPES = [
  'Pomme', 'Poire', 'Cerise', 'Prune', 'Mirabelle', 'Quetsche',
  'Figue', 'Noix', 'Noisette', 'Châtaigne', 'Mûre', 'Framboise',
  'Abricot', 'Pêche', 'Nectarine', 'Coing', 'Kiwi', 'Raisin',
  'Grenade', 'Olive', 'Autre',
]

export const ACCESSIBILITY_LABELS: Record<string, string> = {
  public: 'Public',
  'semi-public': 'Semi-public',
  private: 'Privé (avec accord)',
}

export const CONDITION_LABELS: Record<string, string> = {
  healthy: 'En bonne santé',
  sick: 'Malade',
  unknown: 'Inconnu',
}

export const CONDITION_COLORS: Record<string, string> = {
  healthy: 'text-green-700 bg-green-100',
  sick: 'text-red-700 bg-red-100',
  unknown: 'text-gray-700 bg-gray-100',
}

export const FRUIT_TYPE_MARKER_COLORS: Record<string, string> = {
  Pomme: '#e74c3c',
  Poire: '#f39c12',
  Cerise: '#c0392b',
  Figue: '#8e44ad',
  Noix: '#795548',
  Noisette: '#a1887f',
  default: '#4a7c59',
}
