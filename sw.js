self.addEventListener('install', e => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', e => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', e => {
  // You can cache requests here for offline use
});

const cacheAssets = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/192x192.png',
  './assets/512x512.png'
];