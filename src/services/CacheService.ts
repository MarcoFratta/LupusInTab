import { Capacitor } from '@capacitor/core';

export class CacheService {
  private static instance: CacheService;
  private readonly CACHE_KEY = 'website_cache';
  private readonly CACHE_TIMESTAMP_KEY = 'cache_timestamp';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async cacheWebsiteContent(): Promise<void> {
    // Only cache on mobile devices
    if (!Capacitor.isNativePlatform()) {
      console.log('Skipping cache - running in browser');
      return;
    }

    try {
      console.log('Caching website content for mobile...');
      
      // Cache the main HTML and critical assets
      const assetsToCache = [
        '/',
        '/index.html',
        '/assets/index.css',
        '/assets/index.js'
      ];

      const cacheData: Record<string, string> = {};
      
      for (const asset of assetsToCache) {
        try {
          const response = await fetch(`https://lupus-in-tabula.vercel.app${asset}`);
          if (response.ok) {
            const content = await response.text();
            cacheData[asset] = content;
            console.log(`Cached: ${asset}`);
          }
        } catch (error) {
          console.error(`Failed to cache ${asset}:`, error);
        }
      }

      // Use Capacitor Filesystem for mobile only
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      
      await Filesystem.writeFile({
        path: this.CACHE_KEY,
        data: JSON.stringify(cacheData),
        directory: Directory.Data
      });

      await Filesystem.writeFile({
        path: this.CACHE_TIMESTAMP_KEY,
        data: Date.now().toString(),
        directory: Directory.Data
      });

      console.log('Website content cached successfully on mobile');
    } catch (error) {
      console.error('Failed to cache website content:', error);
    }
  }

  async getCachedContent(path: string): Promise<string | null> {
    // Only work on mobile devices
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      // Check if cache is still valid
      if (!(await this.isCacheValid())) {
        console.log('Cache expired, refreshing...');
        await this.cacheWebsiteContent();
      }

      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      
      const result = await Filesystem.readFile({
        path: this.CACHE_KEY,
        directory: Directory.Data
      });
      
      const cachedData = JSON.parse(result.data);
      return cachedData[path] || null;
    } catch (error) {
      console.error('Failed to get cached content:', error);
      return null;
    }
  }

  private async isCacheValid(): Promise<boolean> {
    // Only work on mobile devices
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      
      const result = await Filesystem.readFile({
        path: this.CACHE_TIMESTAMP_KEY,
        directory: Directory.Data
      });
      
      const timestamp = parseInt(result.data, 10);
      const now = Date.now();
      
      return (now - timestamp) < this.CACHE_DURATION;
    } catch (error) {
      return false;
    }
  }

  async clearCache(): Promise<void> {
    // Only work on mobile devices
    if (!Capacitor.isNativePlatform()) {
      console.log('No cache to clear - running in browser');
      return;
    }

    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      
      await Filesystem.deleteFile({
        path: this.CACHE_KEY,
        directory: Directory.Data
      });
      
      await Filesystem.deleteFile({
        path: this.CACHE_TIMESTAMP_KEY,
        directory: Directory.Data
      });
      
      console.log('Cache cleared successfully on mobile');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheInfo(): Promise<{ size: number; timestamp: number } | null> {
    // Only work on mobile devices
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      
      const result = await Filesystem.readFile({
        path: this.CACHE_KEY,
        directory: Directory.Data
      });
      
      const timestampResult = await Filesystem.readFile({
        path: this.CACHE_TIMESTAMP_KEY,
        directory: Directory.Data
      });
      
      return {
        size: result.data.length,
        timestamp: parseInt(timestampResult.data, 10)
      };
    } catch (error) {
      return null;
    }
  }
}

export const cacheService = CacheService.getInstance();
export default CacheService;
