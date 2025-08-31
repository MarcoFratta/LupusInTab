import { onMounted, ref } from 'vue';
import { cacheService } from '../services/CacheService';

export function useCache() {
  const isInitialized = ref(false);
  const lastUpdate = ref<Date | null>(null);
  const cacheInfo = ref<{ version: string; timestamp: number; assetCount: number } | null>(null);
  const isUpdating = ref(false);
  const updateProgress = ref<{ current: number; total: number; status: string } | null>(null);
  const currentVersion = ref<string>('');
  const newVersion = ref<string>('');

  const initialize = async () => {
    if (isInitialized.value) return;
    
    try {
      // Set up progress callback
      cacheService.setProgressCallback((progress) => {
        updateProgress.value = progress;
        if (progress.current === 0) {
          isUpdating.value = true;
          // Update version information when update starts
          updateCacheInfo();
        } else if (progress.current === progress.total) {
          setTimeout(() => {
            isUpdating.value = false;
            updateProgress.value = null;
            // Update cache info after update completes
            updateCacheInfo();
          }, 1000);
        }
      });
      
      await cacheService.initialize();
      isInitialized.value = true;
      await updateCacheInfo();
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  };

  const updateCacheInfo = async () => {
    try {
      cacheInfo.value = await cacheService.getCacheInfo();
      
      // Also get version information
      const versionInfo = await cacheService.getVersionInfo();
      if (versionInfo) {
        currentVersion.value = versionInfo.currentVersion;
        newVersion.value = versionInfo.newVersion;
      }
    } catch (error) {
      console.error('Failed to get cache info:', error);
    }
  };

  const getCachedContent = async (url: string) => {
    return await cacheService.getCachedContent(url);
  };

  const getCachedContentWithFallback = async (url: string) => {
    return await cacheService.getCachedContentWithFallback(url);
  };

  const clearCache = async () => {
    try {
      await cacheService.clearCache();
      await updateCacheInfo();
      isInitialized.value = false;
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const forceUpdate = async () => {
    try {
      isUpdating.value = true;
      await cacheService.forceUpdateNow();
      await updateCacheInfo();
    } catch (error) {
      console.error('Failed to force update:', error);
      throw error;
    } finally {
      isUpdating.value = false;
    }
  };

  const getCurrentVersion = async () => {
    return await cacheService.getCurrentCacheVersion();
  };

  const getServerVersion = async () => {
    return await cacheService.getServerVersion();
  };

  onMounted(() => {
    initialize();
  });

  return {
    isInitialized,
    lastUpdate,
    cacheInfo,
    isUpdating,
    updateProgress,
    currentVersion,
    newVersion,
    initialize,
    getCachedContent,
    getCachedContentWithFallback,
    clearCache,
    updateCacheInfo,
    forceUpdate,
    getCurrentVersion,
    getServerVersion
  };
}
