import { onMounted, ref } from 'vue';
import { cacheService } from '../services/CacheService';

export function useCache() {
  const isInitialized = ref(false);
  const lastUpdate = ref<Date | null>(null);
  const cacheInfo = ref<{ version: string; timestamp: number; assetCount: number } | null>(null);

  const initialize = async () => {
    if (isInitialized.value) return;
    
    try {
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

  onMounted(() => {
    initialize();
  });

  return {
    isInitialized,
    lastUpdate,
    cacheInfo,
    initialize,
    getCachedContent,
    getCachedContentWithFallback,
    clearCache,
    updateCacheInfo
  };
}
