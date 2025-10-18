// Service Worker for Crypto Watchlist
// Aggressive caching for crypto icons and API responses

const CACHE_NAME = 'crypto-watchlist-v1';
const ICON_CACHE_NAME = 'crypto-icons-v1';
const API_CACHE_NAME = 'crypto-api-v1';

// Cache durations
const ICON_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Common crypto icons to pre-cache
const COMMON_CRYPTO_ICONS = [
  'https://assets.coingecko.com/coins/images/1/large/btc.png',
  'https://assets.coingecko.com/coins/images/1027/large/eth.png',
  'https://assets.coingecko.com/coins/images/1839/large/bnb.png',
  'https://assets.coingecko.com/coins/images/4128/large/sol.png',
  'https://assets.coingecko.com/coins/images/52/large/xrp.png',
  'https://assets.coingecko.com/coins/images/2010/large/ada.png',
  'https://assets.coingecko.com/coins/images/12559/large/avax.png',
  'https://assets.coingecko.com/coins/images/6636/large/dot.png',
  'https://assets.coingecko.com/coins/images/1975/large/link.png',
  'https://assets.coingecko.com/coins/images/1958/large/trx.png',
  'https://assets.coingecko.com/coins/images/3890/large/matic.png',
  'https://assets.coingecko.com/coins/images/2/large/ltc.png',
  'https://assets.coingecko.com/coins/images/1831/large/bch.png',
  'https://assets.coingecko.com/coins/images/7083/large/uni.png',
  'https://assets.coingecko.com/coins/images/3794/large/atom.png',
  'https://assets.coingecko.com/coins/images/6535/large/near.png',
  'https://assets.coingecko.com/coins/images/3513/large/ftm.png',
  'https://assets.coingecko.com/coins/images/4030/large/algo.png',
  'https://assets.coingecko.com/coins/images/3077/large/vet.png',
  'https://assets.coingecko.com/coins/images/8916/large/icp.png',
];

// Install event - pre-cache common icons
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(ICON_CACHE_NAME).then((cache) => {
        console.log('Pre-caching common crypto icons...');
        return cache.addAll(COMMON_CRYPTO_ICONS);
      }),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker cache opened');
        return cache;
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== ICON_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle crypto icon requests with aggressive caching
  if (isCryptoIconRequest(url)) {
    event.respondWith(handleIconRequest(request));
    return;
  }

  // Handle API requests with shorter cache duration
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(handleOtherRequest(request));
});

function isCryptoIconRequest(url) {
  return (
    url.hostname.includes('coingecko.com') ||
    url.hostname.includes('coinmarketcap.com') ||
    url.hostname.includes('cryptoicons.org') ||
    url.hostname.includes('raw.githubusercontent.com')
  ) && (
    url.pathname.includes('/coins/images/') ||
    url.pathname.includes('/static/img/coins/') ||
    url.pathname.includes('/api/icon/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg')
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

async function handleIconRequest(request) {
  const cache = await caches.open(ICON_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
    const isExpired = Date.now() - cacheDate.getTime() > ICON_CACHE_DURATION;
    
    if (!isExpired) {
      console.log('Serving icon from cache:', request.url);
      return cachedResponse;
    }
  }

  try {
    console.log('Fetching icon from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response and add cache timestamp
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      return networkResponse;
    }
    
    // If network fails, return cached version if available
    if (cachedResponse) {
      console.log('Network failed, serving stale icon from cache:', request.url);
      return cachedResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Icon fetch failed, trying cache:', request.url, error);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a placeholder response
    return new Response('', { status: 404 });
  }
}

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
    const isExpired = Date.now() - cacheDate.getTime() > API_CACHE_DURATION;
    
    if (!isExpired) {
      console.log('Serving API response from cache:', request.url);
      return cachedResponse;
    }
  }

  try {
    console.log('Fetching API response from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response and add cache timestamp
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log('API fetch failed, trying cache:', request.url, error);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

async function handleOtherRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}
