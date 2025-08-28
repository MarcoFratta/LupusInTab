# Smart Caching System for Capacitor App

This document describes the enhanced caching system that automatically checks for updates without deleting existing cache content.

## Features

- **Version-based caching**: Only updates cache when the server version changes
- **Preserves existing cache**: Never deletes cached content, only adds/updates
- **Internet connectivity check**: Automatically detects network status
- **Smart asset management**: Only fetches assets that have changed
- **Fallback support**: Falls back to network requests when cache is unavailable

## How It Works

1. **App Initialization**: When the app starts, it checks for internet connectivity
2. **Version Check**: If connected, fetches `/public/version.json` from your website
3. **Cache Comparison**: Compares server version with cached version
4. **Selective Update**: Only updates assets that have changed or are missing
5. **Preserve Existing**: Keeps all existing cached content intact

## Configuration

Update the website URL in `src/config/cache.ts`:

```typescript
export const CACHE_CONFIG = {
  WEBSITE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-actual-website.com'  // Update this!
    : 'http://localhost:3000',
  // ... other settings
};
```

## Usage

### Basic Integration

```vue
<template>
  <div>
    <!-- Your app content -->
    <CacheStatus />
  </div>
</template>

<script setup>
import { CacheStatus } from '@/components/ui';
</script>
```

### Programmatic Usage

```typescript
import { useCache } from '@/composables/useCache';

const {
  isInitialized,
  isUpdating,
  cacheInfo,
  checkForUpdates,
  getCachedContent,
  clearCache
} = useCache();

// Get cached content
const content = await getCachedContent('/some-asset.html');

// Force update check
await checkForUpdates();

// Clear cache
await clearCache();
```

## API Reference

### CacheService Methods

- `initialize()`: Initialize the cache service
- `getCachedContent(url)`: Get cached content for a URL
- `getCachedContentWithFallback(url)`: Get cached content or fetch from network
- `forceUpdate()`: Force a cache update check
- `clearCache()`: Clear all cached content
- `getCacheInfo()`: Get information about the current cache

### useCache Composable

- `isInitialized`: Whether the cache service is initialized
- `isUpdating`: Whether an update is in progress
- `cacheInfo`: Current cache information (version, timestamp, asset count)
- `lastUpdate`: When the last update check occurred
- `checkForUpdates()`: Manually trigger an update check
- `clearCache()`: Clear the cache

## Cache Structure

The cache stores:
- Asset content (HTML, CSS, JS, images)
- Version information
- Timestamps for cache validation
- ETags for efficient updates

## Benefits

1. **Offline Support**: App works without internet connection
2. **Faster Loading**: Cached assets load instantly
3. **Bandwidth Savings**: Only downloads changed content
4. **User Experience**: No interruption during updates
5. **Reliability**: Fallback to network when needed

## Requirements

- Capacitor Network plugin: `@capacitor/network`
- Your website must serve `/public/version.json`
- Assets must be accessible via HTTP/HTTPS

## Troubleshooting

### Cache Not Updating
- Check internet connectivity
- Verify website URL in configuration
- Ensure `/public/version.json` is accessible
- Check browser console for errors

### Performance Issues
- Monitor cache size in browser dev tools
- Use `clearCache()` if needed
- Check asset count in cache info

## Example version.json

```json
{
  "version": "1.1.1",
  "timestamp": 1755706148000,
  "assets": [
    "/index.html",
    "/assets/index-*.js",
    "/assets/index-*.css"
  ],
  "changelog": "Auto-updated by semantic-release",
  "minVersion": "1.0.0"
}
```
