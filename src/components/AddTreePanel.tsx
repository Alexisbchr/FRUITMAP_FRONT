import { useState, useRef, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, MapPin, XCircle } from 'lucide-react'
import { useCreateTree } from '../hooks/useTrees'
import { useOfflineStatus } from '../hooks/useOfflineStatus'
import { FRUIT_TYPES, MONTHS_FR, MAX_PHOTOS_PER_TREE, MAX_PHOTO_SIZE_MB } from '../utils/constants'
import type { AxiosError } from 'axios'
import type { ApiError } from '../types'

const addTreeFormSchema = z.object({
  species: z.string().min(1, 'Espèce requise'),
  fruitType: z.string().min(1, 'Type de fruit requis'),
  description: z.string().min(10, 'Description trop courte (min. 10 caractères)'),
  lat: z.number({ required_error: 'Cliquez sur la carte pour placer l\'arbre' }),
  lng: z.number({ required_error: 'Cliquez sur la carte pour placer l\'arbre' }),
  address: z.string().optional(),
  city: z.string().min(1, 'Ville requise'),
  accessibility: z.enum(['public', 'semi-public', 'private']),
  harvestMonths: z.array(z.number()),
  condition: z.enum(['healthy', 'sick', 'unknown']),
})

type AddTreeFormValues = z.infer<typeof addTreeFormSchema>

interface AddTreePanelProps {
  selectedLocation: [number, number] | null
  onClose: () => void
  onSuccess: (treeId: string) => void
}

export function AddTreePanel({ selectedLocation, onClose, onSuccess }: AddTreePanelProps) {
  const { isOnline } = useOfflineStatus()
  const createTreeMutation = useCreateTree()
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
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

  useEffect(() => {
    if (selectedLocation) {
      setValue('lat', selectedLocation[0])
      setValue('lng', selectedLocation[1])
    }
  }, [selectedLocation, setValue])

  function handlePhotoFilesSelected(changeEvent: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(changeEvent.target.files ?? [])
    const filesToAdd = newFiles.slice(0, MAX_PHOTOS_PER_TREE - selectedPhotos.length)
    setSelectedPhotos((prev) => [...prev, ...filesToAdd])
    setPhotoPreviewUrls((prev) => [...prev, ...filesToAdd.map((f) => URL.createObjectURL(f))])
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photoPreviewUrls[index])
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  async function onFormSubmit(formValues: AddTreeFormValues) {
    if (!isOnline) {
      setServerError('Vous êtes hors-ligne.')
      return
    }
    try {
      setServerError(null)
      const createdTree = await createTreeMutation.mutateAsync({
        treePayload: formValues,
        photoFiles: selectedPhotos,
      })
      onSuccess(createdTree.id)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      setServerError(axiosError.response?.data?.error ?? 'Erreur lors du signalement')
    }
  }

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl z-30 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-lg font-bold text-gray-900">Signaler un arbre</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <XCircle size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!isOnline && (
          <div role="alert" className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-sm">
            Vous êtes hors-ligne. Le signalement nécessite une connexion.
          </div>
        )}

        <form id="add-tree-panel-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {serverError && (
            <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {serverError}
            </div>
          )}

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-forest-600" />
              Localisation
            </h3>
            {selectedLocation ? (
              <div className="px-3 py-2 bg-forest-50 border border-forest-200 rounded-xl text-sm text-forest-700">
                📍 {selectedLocation[0].toFixed(5)}, {selectedLocation[1].toFixed(5)}
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 text-center">
                Cliquez sur la carte pour placer l'arbre
              </div>
            )}
            {errors.lat && <p className="mt-1 text-xs text-red-600">{errors.lat.message}</p>}

            <div className="mt-3">
              <label htmlFor="panel-city" className="block text-sm font-medium text-gray-700 mb-1">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                id="panel-city"
                type="text"
                {...register('city')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                placeholder="Paris, Lyon, Bordeaux…"
              />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Identification</h3>

            <div>
              <label htmlFor="panel-fruit-type" className="block text-sm font-medium text-gray-700 mb-1">
                Type de fruit <span className="text-red-500">*</span>
              </label>
              <select
                id="panel-fruit-type"
                {...register('fruitType')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Sélectionner…</option>
                {FRUIT_TYPES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {errors.fruitType && <p className="mt-1 text-xs text-red-600">{errors.fruitType.message}</p>}
            </div>

            <div>
              <label htmlFor="panel-species" className="block text-sm font-medium text-gray-700 mb-1">
                Espèce / variété <span className="text-red-500">*</span>
              </label>
              <input
                id="panel-species"
                type="text"
                {...register('species')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                placeholder="ex: Pommier Golden, Figuier commun…"
              />
              {errors.species && <p className="mt-1 text-xs text-red-600">{errors.species.message}</p>}
            </div>

            <div>
              <label htmlFor="panel-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="panel-description"
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
                placeholder="Décrivez l'arbre, son emplacement précis, des infos utiles…"
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Détails</h3>

            <div>
              <label htmlFor="panel-accessibility" className="block text-sm font-medium text-gray-700 mb-1">
                Accessibilité
              </label>
              <select
                id="panel-accessibility"
                {...register('accessibility')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="public">Public</option>
                <option value="semi-public">Semi-public</option>
                <option value="private">Privé (avec accord)</option>
              </select>
            </div>

            <div>
              <label htmlFor="panel-condition" className="block text-sm font-medium text-gray-700 mb-1">
                État de l'arbre
              </label>
              <select
                id="panel-condition"
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
                  <div className="grid grid-cols-4 gap-1.5">
                    {MONTHS_FR.map((monthName, monthIndex) => {
                      const monthNumber = monthIndex + 1
                      const isSelected = field.value.includes(monthNumber)
                      return (
                        <button
                          key={monthName}
                          type="button"
                          onClick={() => {
                            const updated = isSelected
                              ? field.value.filter((m) => m !== monthNumber)
                              : [...field.value, monthNumber]
                            field.onChange(updated)
                          }}
                          className={`py-1 text-xs rounded-lg border transition-colors ${
                            isSelected
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

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Photos{' '}
              <span className="font-normal text-gray-400">
                ({selectedPhotos.length}/{MAX_PHOTOS_PER_TREE} — max. {MAX_PHOTO_SIZE_MB} Mo)
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {photoPreviewUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                    aria-label="Supprimer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {selectedPhotos.length < MAX_PHOTOS_PER_TREE && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
                >
                  <Upload size={16} />
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
        </form>
      </div>

      <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          form="add-tree-panel-form"
          disabled={isSubmitting || !isOnline}
          className="flex-1 py-2.5 bg-forest-600 text-white rounded-xl text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi…' : 'Signaler'}
        </button>
      </div>
    </div>
  )
}
