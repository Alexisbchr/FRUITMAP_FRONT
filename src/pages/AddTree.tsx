import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Upload, X, MapPin } from 'lucide-react'
import { useCreateTree } from '../hooks/useTrees'
import { useGeolocation } from '../hooks/useGeolocation'
import { useOfflineStatus } from '../hooks/useOfflineStatus'
import { FRUIT_TYPES, MONTHS_FR, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAX_PHOTOS_PER_TREE, MAX_PHOTO_SIZE_MB } from '../utils/constants'
import type { AxiosError } from 'axios'
import type { ApiError } from '../types'

const addTreeFormSchema = z.object({
  species: z.string().min(1, 'Espèce requise'),
  fruitType: z.string().min(1, 'Type de fruit requis'),
  description: z.string().min(10, 'Description trop courte (min. 10 caractères)'),
  lat: z.number({ required_error: 'Placez le marqueur sur la carte' }),
  lng: z.number({ required_error: 'Placez le marqueur sur la carte' }),
  address: z.string().optional(),
  city: z.string().min(1, 'Ville requise'),
  accessibility: z.enum(['public', 'semi-public', 'private']),
  harvestMonths: z.array(z.number()),
  condition: z.enum(['healthy', 'sick', 'unknown']),
})

type AddTreeFormValues = z.infer<typeof addTreeFormSchema>

interface LocationPickerProps {
  onLocationSelected: (lat: number, lng: number) => void
  markerPosition: [number, number] | null
}

function LocationPicker({ onLocationSelected, markerPosition }: LocationPickerProps) {
  useMapEvents({
    click(mapClickEvent) {
      onLocationSelected(mapClickEvent.latlng.lat, mapClickEvent.latlng.lng)
    },
  })

  const pinIcon = divIcon({
    html: '<div style="background:#4a7c59;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  if (!markerPosition) return null

  return <Marker position={markerPosition} icon={pinIcon} />
}

export function AddTree() {
  const navigate = useNavigate()
  const { isOnline } = useOfflineStatus()
  const { coordinates: userCoordinates, requestPosition } = useGeolocation()
  const createTreeMutation = useCreateTree()
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddTreeFormValues>({
    resolver: zodResolver(addTreeFormSchema),
    defaultValues: {
      accessibility: 'public',
      condition: 'unknown',
      harvestMonths: [],
    },
  })

  function handleLocationSelected(lat: number, lng: number) {
    setMarkerPosition([lat, lng])
    setValue('lat', lat)
    setValue('lng', lng)
  }

  function handleLocateMe() {
    requestPosition()
    if (userCoordinates) {
      handleLocationSelected(userCoordinates.lat, userCoordinates.lng)
    }
  }

  function handlePhotoFilesSelected(changeEvent: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(changeEvent.target.files ?? [])
    const remainingSlots = MAX_PHOTOS_PER_TREE - selectedPhotos.length
    const filesToAdd = newFiles.slice(0, remainingSlots)

    setSelectedPhotos((previous) => [...previous, ...filesToAdd])
    const newPreviewUrls = filesToAdd.map((photoFile) => URL.createObjectURL(photoFile))
    setPhotoPreviewUrls((previous) => [...previous, ...newPreviewUrls])
  }

  function removePhoto(photoIndex: number) {
    setSelectedPhotos((previous) => previous.filter((_, idx) => idx !== photoIndex))
    URL.revokeObjectURL(photoPreviewUrls[photoIndex])
    setPhotoPreviewUrls((previous) => previous.filter((_, idx) => idx !== photoIndex))
  }

  async function onFormSubmit(formValues: AddTreeFormValues) {
    if (!isOnline) {
      setServerError('Vous êtes hors-ligne. Reconnectez-vous pour signaler un arbre.')
      return
    }

    try {
      setServerError(null)
      const createdTree = await createTreeMutation.mutateAsync({
        treePayload: formValues,
        photoFiles: selectedPhotos,
      })
      navigate(`/trees/${createdTree.id}`)
    } catch (submissionError) {
      const axiosError = submissionError as AxiosError<ApiError>
      setServerError(axiosError.response?.data?.error ?? 'Erreur lors du signalement')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Signaler un arbre fruitier</h1>

      {!isOnline && (
        <div role="alert" className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-sm">
          Vous êtes hors-ligne. Le signalement nécessite une connexion internet.
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {serverError && (
          <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {serverError}
          </div>
        )}

        {/* Localisation */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-forest-600" />
            Localisation
          </h2>

          <div className="rounded-xl overflow-hidden border border-gray-200 mb-3" style={{ height: 240 }}>
            <MapContainer
              center={markerPosition ?? DEFAULT_MAP_CENTER}
              zoom={DEFAULT_MAP_ZOOM}
              className="w-full h-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker
                onLocationSelected={handleLocationSelected}
                markerPosition={markerPosition}
              />
            </MapContainer>
          </div>

          <p className="text-xs text-gray-400 mb-2">Cliquez sur la carte pour placer l'arbre</p>

          <button
            type="button"
            onClick={handleLocateMe}
            className="text-sm text-forest-600 font-medium hover:underline"
          >
            Utiliser ma position actuelle
          </button>

          {errors.lat && <p className="mt-1 text-xs text-red-600">{errors.lat.message}</p>}

          <div className="mt-3">
            <label htmlFor="add-city" className="block text-sm font-medium text-gray-700 mb-1">
              Ville <span className="text-red-500">*</span>
            </label>
            <input
              id="add-city"
              type="text"
              {...register('city')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="Paris, Lyon, Bordeaux…"
            />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
          </div>
        </section>

        {/* Identification */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Identification</h2>

          <div>
            <label htmlFor="add-fruit-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de fruit <span className="text-red-500">*</span>
            </label>
            <select
              id="add-fruit-type"
              {...register('fruitType')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="">Sélectionner…</option>
              {FRUIT_TYPES.map((fruitTypeName) => (
                <option key={fruitTypeName} value={fruitTypeName}>
                  {fruitTypeName}
                </option>
              ))}
            </select>
            {errors.fruitType && <p className="mt-1 text-xs text-red-600">{errors.fruitType.message}</p>}
          </div>

          <div>
            <label htmlFor="add-species" className="block text-sm font-medium text-gray-700 mb-1">
              Espèce / variété <span className="text-red-500">*</span>
            </label>
            <input
              id="add-species"
              type="text"
              {...register('species')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="ex: Pommier Golden, Figuier commun…"
            />
            {errors.species && <p className="mt-1 text-xs text-red-600">{errors.species.message}</p>}
          </div>

          <div>
            <label htmlFor="add-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="add-description"
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
              placeholder="Décrivez l'arbre, son emplacement précis, des infos utiles…"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>
        </section>

        {/* Détails */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Détails</h2>

          <div>
            <label htmlFor="add-accessibility" className="block text-sm font-medium text-gray-700 mb-1">
              Accessibilité
            </label>
            <select
              id="add-accessibility"
              {...register('accessibility')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="public">Public</option>
              <option value="semi-public">Semi-public</option>
              <option value="private">Privé (avec accord)</option>
            </select>
          </div>

          <div>
            <label htmlFor="add-condition" className="block text-sm font-medium text-gray-700 mb-1">
              État de l'arbre
            </label>
            <select
              id="add-condition"
              {...register('condition')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="unknown">Inconnu</option>
              <option value="healthy">En bonne santé</option>
              <option value="sick">Malade</option>
            </select>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Mois de récolte</p>
            <Controller
              name="harvestMonths"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2">
                  {MONTHS_FR.map((monthName, monthIndex) => {
                    const monthNumber = monthIndex + 1
                    const isMonthSelected = field.value.includes(monthNumber)
                    return (
                      <button
                        key={monthName}
                        type="button"
                        onClick={() => {
                          const updatedMonths = isMonthSelected
                            ? field.value.filter((selectedMonth) => selectedMonth !== monthNumber)
                            : [...field.value, monthNumber]
                          field.onChange(updatedMonths)
                        }}
                        className={`py-1.5 text-xs rounded-lg border transition-colors ${
                          isMonthSelected
                            ? 'bg-forest-600 text-white border-forest-600'
                            : 'border-gray-200 text-gray-600 hover:border-forest-300'
                        }`}
                      >
                        {monthName.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>
        </section>

        {/* Photos */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Photos{' '}
            <span className="text-sm font-normal text-gray-400">
              ({selectedPhotos.length}/{MAX_PHOTOS_PER_TREE} — max. {MAX_PHOTO_SIZE_MB} Mo chacune)
            </span>
          </h2>

          <div className="flex flex-wrap gap-3">
            {photoPreviewUrls.map((previewUrl, photoIndex) => (
              <div key={previewUrl} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <img src={previewUrl} alt={`Photo ${photoIndex + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photoIndex)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                  aria-label="Supprimer cette photo"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {selectedPhotos.length < MAX_PHOTOS_PER_TREE && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
              >
                <Upload size={20} />
                <span className="text-xs">Ajouter</span>
              </button>
            )}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handlePhotoFilesSelected}
            className="sr-only"
            aria-label="Sélectionner des photos"
          />
        </section>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            className="flex-1 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi en cours…' : 'Signaler l\'arbre'}
          </button>
        </div>
      </form>
    </div>
  )
}
