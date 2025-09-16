# PWA Caching System for Capacitor App

This document describes the PWA caching system using VitePWA that provides automatic updates and offline support for both web and mobile builds.

## Features

- **Automatic updates**: Service worker automatically detects and applies updates
- **Immediate activation**: Updates take effect immediately without requiring app restart
- **Offline support**: App works without internet connection using cached assets
- **Smart caching**: Only caches necessary assets and uses efficient strategies
- **Cross-platform**: Works consistently on both web and mobile (Capacitor) builds

## How It Works

1. **Service Worker Registration**: VitePWA automatically registers a service worker
2. **Asset Precaching**: Critical assets are precached during build time
3. **Runtime Caching**: API calls and dynamic content are cached at runtime
4. **Update Detection**: Service worker checks for updates on each app load
5. **Immediate Activation**: New service worker takes control immediately (`skipWaiting: true`)

## Configuration

### VitePWA Configuration

The app uses VitePWA plugin with different configurations for web and mobile:

**Web Build** (`vite.config.js`):
```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    skipWaiting: true,        // Immediate activation
    clientsClaim: true,       // Take control immediately
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/lupus-in-tabula\.vercel\.app\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'lupus-in-tabula-api',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60
          }
        }
      }
    ]
  }
})
```

**Mobile Build** (`vite.config.mobile.ts`):
```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    skipWaiting: true,        // Immediate activation
    clientsClaim: true,       // Take control immediately
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/lupus-in-tabula\.vercel\.app\/.*/i,
        handler: 'CacheFirst',  // More aggressive caching for mobile
        options: {
          cacheName: 'lupus-in-tabula-api',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60
          }
        }
      }
    ]
  }
})
```

## Usage

### Update Detection and Handling

The app automatically detects updates and shows a notification to users:

```vue
<template>
  <div>
    <!-- Your app content -->
    
    <!-- Update notification (automatically shown when update is available) -->
    <div v-if="showUpdateNotification" class="update-banner">
      <p>New version available!</p>
      <button @click="refreshApp">Update Now</button>
    </div>
  </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue';

// Service worker registration and update handling
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r) {
    console.log('SW Registered: ' + r);
  },
  onRegisterError(error) {
    console.log('SW registration error', error);
  },
});

// Show update notification when needed
const showUpdateNotification = ref(false);
watch(needRefresh, (newValue) => {
  if (newValue) {
    showUpdateNotification.value = true;
  }
});

// Update the app
const refreshApp = () => {
  updateServiceWorker();
};
</script>
```

### Manual Update Check

```typescript
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW();

// Check if update is available
if (needRefresh.value) {
  console.log('Update available');
  // Show update notification to user
}

// Apply update
await updateServiceWorker();
```

## API Reference

### VitePWA useRegisterSW Hook

- `needRefresh`: Reactive boolean indicating if an update is available
- `offlineReady`: Reactive boolean indicating if the app is ready for offline use
- `updateServiceWorker(reloadPage?)`: Function to apply the update
- `onRegistered`: Callback when service worker is registered
- `onRegisterError`: Callback when service worker registration fails
- `onNeedRefresh`: Callback when an update is available
- `onOfflineReady`: Callback when app is ready for offline use

### Workbox Configuration

- `skipWaiting: true`: New service worker takes control immediately
- `clientsClaim: true`: Service worker claims all clients immediately
- `globPatterns`: Patterns for assets to precache
- `runtimeCaching`: Rules for runtime caching strategies

## Cache Structure

The service worker cache stores:
- **Precached assets**: Static files (JS, CSS, HTML, images) cached at build time
- **Runtime cache**: API responses and dynamic content cached at runtime
- **Service worker**: The service worker script itself
- **Workbox files**: Workbox library files for cache management

## Caching Strategies

- **Precache**: Critical app assets cached during build
- **StaleWhileRevalidate**: For API calls (web build) - serves cache, updates in background
- **CacheFirst**: For API calls (mobile build) - serves cache first, falls back to network

## Benefits

1. **Immediate Updates**: Updates take effect immediately without app restart
2. **Offline Support**: App works without internet connection
3. **Faster Loading**: Cached assets load instantly
4. **Bandwidth Savings**: Only downloads changed content
5. **Cross-Platform**: Consistent behavior on web and mobile
6. **User Experience**: Seamless updates with optional user notification

## Requirements

- **VitePWA Plugin**: `vite-plugin-pwa` for service worker management
- **Workbox**: Automatic service worker generation and management
- **Capacitor**: For mobile app functionality
- **HTTPS**: Required for service worker functionality in production

## Troubleshooting

### Updates Not Working
- **Check service worker registration**: Look for "SW Registered" in console
- **Verify skipWaiting/clientsClaim**: Ensure both are set to `true`
- **Check build configuration**: Make sure mobile config matches web config
- **Clear browser cache**: Sometimes old service workers interfere

### Service Worker Issues
- **Check console errors**: Look for service worker registration errors
- **Verify HTTPS**: Service workers require HTTPS in production
- **Check network connectivity**: Updates require internet connection
- **Inspect service worker**: Use browser dev tools to check service worker status

### Performance Issues
- **Monitor cache size**: Use browser dev tools to check cache usage
- **Check asset patterns**: Ensure `globPatterns` includes all necessary files
- **Review runtime caching**: Adjust caching strategies if needed

## Build Commands

```bash
# Web build (uses vite.config.js)
npm run build

# Mobile build (uses vite.config.mobile.ts)
npm run mobile:build:android
npm run mobile:build:ios
```

## Key Files

- `vite.config.js`: Web build configuration with VitePWA
- `vite.config.mobile.ts`: Mobile build configuration with VitePWA
- `src/App.vue`: Update notification and service worker handling
- `src/env.d.ts`: TypeScript declarations for VitePWA
- `public/manifest.webmanifest`: PWA manifest file

## Recent Fixes

### Fixed PWA Update Issue (v1.14.3+)
- **Problem**: Mobile app required "open once, close, reopen" for updates
- **Root Cause**: Missing `skipWaiting: true` and `clientsClaim: true` in mobile config
- **Solution**: Added consistent PWA settings across web and mobile builds
- **Result**: Updates now work immediately on both web and mobile platforms
