import { WifiOff } from 'lucide-react'
import { useOfflineStatus } from '../hooks/useOfflineStatus'

export function OfflineBanner() {
  const { isOnline } = useOfflineStatus()

  if (isOnline) return null

  return (
    <div
      role="alert"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white text-sm"
    >
      <WifiOff size={16} />
      <span>Vous êtes hors-ligne. La carte et les arbres récents restent disponibles.</span>
    </div>
  )
}
