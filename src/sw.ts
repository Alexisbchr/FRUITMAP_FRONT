import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// API arbres — réseau en priorité, cache en fallback (offline)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/trees'),
  new NetworkFirst({
    cacheName: 'api-trees-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  })
)

// Photos des arbres — affichage immédiat depuis le cache, mise à jour en arrière-plan
registerRoute(
  ({ url }) => url.pathname.startsWith('/uploads/'),
  new StaleWhileRevalidate({
    cacheName: 'tree-photos-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
)

// Tuiles OpenStreetMap — cache long durée
registerRoute(
  ({ url }) => url.hostname.includes('tile.openstreetmap.org'),
  new CacheFirst({
    cacheName: 'osm-tiles-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
)
