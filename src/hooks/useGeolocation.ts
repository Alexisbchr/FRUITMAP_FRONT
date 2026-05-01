import { useState, useCallback } from 'react'

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null
  isLoading: boolean
  error: string | null
}

export function useGeolocation() {
  const [geolocationState, setGeolocationState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: false,
    error: null,
  })

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGeolocationState((previous) => ({
        ...previous,
        error: 'La géolocalisation n\'est pas supportée par ce navigateur',
      }))
      return
    }

    setGeolocationState({ coordinates: null, isLoading: true, error: null })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocationState({
          coordinates: { lat: position.coords.latitude, lng: position.coords.longitude },
          isLoading: false,
          error: null,
        })
      },
      (positionError) => {
        const errorMessages: Record<number, string> = {
          1: 'Permission de géolocalisation refusée',
          2: 'Position indisponible',
          3: 'Délai de géolocalisation dépassé',
        }
        setGeolocationState({
          coordinates: null,
          isLoading: false,
          error: errorMessages[positionError.code] ?? 'Erreur de géolocalisation',
        })
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  return { ...geolocationState, requestPosition }
}
