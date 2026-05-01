import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { Link, useNavigate } from 'react-router-dom'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PlusCircle, Locate } from 'lucide-react'
import { useAllTrees } from '../hooks/useTrees'
import { useGeolocation } from '../hooks/useGeolocation'
import { MapFilters } from '../components/MapFilters'
import { AddTreePanel } from '../components/AddTreePanel'
import { useAuth } from '../hooks/useAuth'
import type { TreeFilters } from '../types'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../utils/constants'
import { getMarkerColor } from '../utils/helpers'

interface MapCenterUpdaterProps {
  targetCenter: [number, number]
}

function MapCenterUpdater({ targetCenter }: MapCenterUpdaterProps) {
  const leafletMap = useMap()
  useEffect(() => {
    leafletMap.setView(targetCenter, DEFAULT_MAP_ZOOM)
  }, [leafletMap, targetCenter])
  return null
}

interface MapClickHandlerProps {
  isActive: boolean
  onLocationSelected: (lat: number, lng: number) => void
}

function MapClickHandler({ isActive, onLocationSelected }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      if (isActive) onLocationSelected(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function createFruitMarkerIcon(fruitType: string) {
  const markerColor = getMarkerColor(fruitType)
  return divIcon({
    html: `<div style="background:${markerColor};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  })
}

const selectedPinIcon = divIcon({
  html: '<div style="background:#4a7c59;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export function MapPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { coordinates: userCoordinates, requestPosition, isLoading: isLocating } = useGeolocation()
  const [treeFilters, setTreeFilters] = useState<TreeFilters>({ page: 1, limit: 100 })
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_MAP_CENTER)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)

  const { trees: visibleTrees, isComplete, total } = useAllTrees(treeFilters)

  useEffect(() => {
    requestPosition()
  }, [])

  useEffect(() => {
    if (userCoordinates) {
      setMapCenter([userCoordinates.lat, userCoordinates.lng])
      setTreeFilters((previous) => ({
        ...previous,
        lat: userCoordinates.lat,
        lng: userCoordinates.lng,
      }))
    }
  }, [userCoordinates])

  function handleOpenPanel() {
    setIsPanelOpen(true)
    setSelectedLocation(null)
  }

  function handleClosePanel() {
    setIsPanelOpen(false)
    setSelectedLocation(null)
  }

  function handlePanelSuccess(treeId: string) {
    navigate(`/trees/${treeId}`)
  }

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 flex-wrap">
        <MapFilters currentFilters={treeFilters} onFiltersChange={setTreeFilters} />

        <button
          onClick={requestPosition}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <Locate size={16} className={isLocating ? 'animate-spin' : ''} />
          {isLocating ? 'Localisation…' : 'Me localiser'}
        </button>

        <div className="ml-auto text-xs bg-white/90 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 text-gray-500">
          {visibleTrees.length}{!isComplete && total > 0 ? `/${total}` : ''} arbre{visibleTrees.length > 1 ? 's' : ''}
          {!isComplete && <span className="ml-1 animate-pulse">…</span>}
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_MAP_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapCenterUpdater targetCenter={mapCenter} />
        <MapClickHandler
          isActive={isPanelOpen}
          onLocationSelected={(lat, lng) => setSelectedLocation([lat, lng])}
        />

        {selectedLocation && (
          <Marker position={selectedLocation} icon={selectedPinIcon} />
        )}

        {visibleTrees.map((fruitTree) => (
          <Marker
            key={fruitTree.id}
            position={[fruitTree.lat, fruitTree.lng]}
            icon={createFruitMarkerIcon(fruitTree.fruitType)}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-semibold text-gray-900">{fruitTree.species}</p>
                <p className="text-forest-600">{fruitTree.fruitType}</p>
                <p className="text-gray-400 text-xs mt-1">{fruitTree.city}</p>
                <Link
                  to={`/trees/${fruitTree.id}`}
                  className="inline-block mt-2 text-forest-600 font-medium text-xs hover:underline"
                >
                  Voir le détail →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isPanelOpen && (
        <>
          <AddTreePanel
            selectedLocation={selectedLocation}
            onClose={handleClosePanel}
            onSuccess={handlePanelSuccess}
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-forest-700/90 text-white text-sm rounded-xl shadow-lg pointer-events-none">
            Cliquez sur la carte pour placer l'arbre
          </div>
        </>
      )}

      {isAuthenticated && !isPanelOpen && (
        <button
          onClick={handleOpenPanel}
          className="absolute bottom-8 right-4 z-20 flex items-center gap-2 px-5 py-3 bg-forest-600 text-white rounded-2xl shadow-lg font-medium hover:bg-forest-700 transition-colors"
        >
          <PlusCircle size={20} />
          Signaler un arbre
        </button>
      )}
    </div>
  )
}
