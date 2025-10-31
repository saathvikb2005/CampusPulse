// CampusPulse Service Worker
const CACHE_NAME = 'campuspulse-v1';

// Only cache external resources and manifest in development
const urlsToCache = [
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Only cache what we know exists
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Failed to cache resources:', error);
          // Don't fail the install if caching fails
          return Promise.resolve();
        });
      })
  );
});

// Fetch event - with error handling
self.addEventListener('fetch', (event) => {
  // Skip caching for development server requests (localhost:5173, localhost:5000)
  if (event.request.url.includes('localhost:5173') || 
      event.request.url.includes('localhost:5000') ||
      event.request.url.includes('vite') ||
      event.request.url.includes('hot-update')) {
    return; // Let Vite handle these requests
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Clone the request for fetch
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).catch((error) => {
          console.log('Fetch failed for:', event.request.url, error);
          // Return a basic response for failed fetches
          return new Response('Network error', {
            status: 408,
            statusText: 'Network timeout'
          });
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});