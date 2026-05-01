import { MONTHS_FR, FRUIT_TYPE_MARKER_COLORS } from './constants'

export function formatDate(isoDateString: string): string {
  const parsedDate = new Date(isoDateString)
  return parsedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatHarvestMonths(harvestMonthNumbers: number[]): string {
  if (harvestMonthNumbers.length === 0) return 'Non renseigné'
  return harvestMonthNumbers.map((monthNumber) => MONTHS_FR[monthNumber - 1]).join(', ')
}

export function getMarkerColor(fruitType: string): string {
  return FRUIT_TYPE_MARKER_COLORS[fruitType] ?? FRUIT_TYPE_MARKER_COLORS.default
}

export function buildPhotoUrl(photoPath: string): string {
  const baseApiUrl = import.meta.env.VITE_API_URL ?? ''
  if (photoPath.startsWith('http')) return photoPath
  return `${baseApiUrl}${photoPath}`
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_KM = 6371
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180
  const haversineA =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(deltaLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA))
}
