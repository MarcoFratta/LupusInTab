import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { CACHE_CONFIG } from '../config/cache';

interface CachedAsset {
  url: string;
  content: string;
  timestamp: number;
  version: string;
  etag?: string;
}

interface CacheData {
  assets: Record<string, CachedAsset>;
  timestamp: number;
  version: string;
  lastCheck: number;
}

interface VersionInfo {
  version: string;
  timestamp: number;
  assets: string[];
  changelog: string;
  minVersion: string;
}

const CACHE_KEY = 'website_cache';

class CacheService {
  private isMobile = Capacitor.isNativePlatform();
  private currentVersion: string | null = null;

  async initialize(): Promise<void> {
    if (!this.isMobile) {
      return;
    }

    try {
      const isConnected = await this.checkInternetConnection();
      if (!isConnected) {
        console.log('No internet connection, using existing cache');
        return;
      }

      await this.checkForUpdates();
    } catch (error) {
      console.error('Failed to initialize cache service:', error);
    }
  }

  private async checkInternetConnection(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch (error) {
      console.error('Failed to check network status:', error);
      return false;
    }
  }

  private async checkForUpdates(): Promise<void> {
    try {
      const versionInfo = await this.fetchVersionInfo();
      if (!versionInfo) {
        console.log('Failed to fetch version info');
        return;
      }

      const existingCache = await this.loadCache();
      
      if (!existingCache) {
        console.log('No existing cache, performing initial cache');
        await this.performFullCache(versionInfo);
        return;
      }

      if (existingCache.version === versionInfo.version) {
        console.log('Cache is up to date');
        await this.updateLastCheck();
        return;
      }

      console.log(`Version mismatch: cached ${existingCache.version}, server ${versionInfo.version}`);
      await this.updateCache(versionInfo, existingCache);
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  private async fetchVersionInfo(): Promise<VersionInfo | null> {
    try {
      const response = await fetch(`${CACHE_CONFIG.WEBSITE_URL}/public/version.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch version info:', error);
      return null;
    }
  }

  private async performFullCache(versionInfo: VersionInfo): Promise<void> {
    try {
      const assets = await this.cacheAssets(versionInfo.assets);
      const cacheData: CacheData = {
        assets,
        timestamp: Date.now(),
        version: versionInfo.version,
        lastCheck: Date.now()
      };
      
      await this.saveCache(cacheData);
      console.log('Initial cache completed');
    } catch (error) {
      console.error('Failed to perform full cache:', error);
    }
  }

  private async updateCache(newVersionInfo: VersionInfo, existingCache: CacheData): Promise<void> {
    try {
      const updatedAssets = { ...existingCache.assets };
      let hasChanges = false;

      for (const assetPath of newVersionInfo.assets) {
        const assetUrl = `${CACHE_CONFIG.WEBSITE_URL}${assetPath}`;
        const existingAsset = existingCache.assets[assetPath];

        if (!existingAsset || existingAsset.version !== newVersionInfo.version) {
          try {
            const response = await fetch(assetUrl);
            if (response.ok) {
              const content = await response.text();
              const etag = response.headers.get('etag') || undefined;
              
              updatedAssets[assetPath] = {
                url: assetPath,
                content,
                timestamp: Date.now(),
                version: newVersionInfo.version,
                etag
              };
              hasChanges = true;
            }
          } catch (error) {
            console.error(`Failed to update asset ${assetPath}:`, error);
          }
        }
      }

      if (hasChanges) {
        const updatedCacheData: CacheData = {
          assets: updatedAssets,
          timestamp: Date.now(),
          version: newVersionInfo.version,
          lastCheck: Date.now()
        };
        
        await this.saveCache(updatedCacheData);
        console.log('Cache updated successfully');
      } else {
        console.log('No assets needed updating');
        await this.updateLastCheck();
      }
    } catch (error) {
      console.error('Failed to update cache:', error);
    }
  }

  private async cacheAssets(assetPaths: string[]): Promise<Record<string, CachedAsset>> {
    const assets: Record<string, CachedAsset> = {};
    
    for (const assetPath of assetPaths) {
      try {
        const assetUrl = `${CACHE_CONFIG.WEBSITE_URL}${assetPath}`;
        const response = await fetch(assetUrl);
        
        if (response.ok) {
          const content = await response.text();
          const etag = response.headers.get('etag') || undefined;
          
          assets[assetPath] = {
            url: assetPath,
            content,
            timestamp: Date.now(),
            version: this.currentVersion || 'unknown',
            etag
          };
        }
      } catch (error) {
        console.error(`Failed to cache asset ${assetPath}:`, error);
      }
    }
    
    return assets;
  }

  async getCachedContent(url: string): Promise<string | null> {
    if (!this.isMobile) {
      return null;
    }

    try {
      const cacheData = await this.loadCache();
      if (!cacheData) return null;

      const asset = cacheData.assets[url];
      if (!asset) return null;

      if (Date.now() - asset.timestamp > CACHE_CONFIG.CACHE_DURATION) {
        return null;
      }

      return asset.content;
    } catch (error) {
      console.error('Failed to get cached content:', error);
      return null;
    }
  }

  async getCachedContentWithFallback(url: string): Promise<string | null> {
    const cached = await this.getCachedContent(url);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
    }

    return null;
  }

  private async updateLastCheck(): Promise<void> {
    try {
      const cacheData = await this.loadCache();
      if (cacheData) {
        cacheData.lastCheck = Date.now();
        await this.saveCache(cacheData);
      }
    } catch (error) {
      console.error('Failed to update last check:', error);
    }
  }

  private async saveCache(cacheData: CacheData): Promise<void> {
    if (!this.isMobile) {
      return;
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private async loadCache(): Promise<CacheData | null> {
    if (!this.isMobile) {
      return null;
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      
      if (Date.now() - cacheData.timestamp > CACHE_CONFIG.CACHE_DURATION) {
        return null;
      }

      return cacheData;
    } catch (error) {
      console.error('Failed to load cache:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    if (!this.isMobile) {
      return;
    }

    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async isCacheValid(): Promise<boolean> {
    if (!this.isMobile) {
      return false;
    }

    try {
      const cacheData = await this.loadCache();
      return cacheData !== null && (Date.now() - cacheData.timestamp <= CACHE_CONFIG.CACHE_DURATION);
    } catch (error) {
      return false;
    }
  }

  async getCacheInfo(): Promise<{ version: string; timestamp: number; assetCount: number } | null> {
    if (!this.isMobile) {
      return null;
    }

    try {
      const cacheData = await this.loadCache();
      if (!cacheData) return null;

      return {
        version: cacheData.version,
        timestamp: cacheData.timestamp,
        assetCount: Object.keys(cacheData.assets).length
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return null;
    }
  }

  async forceUpdate(): Promise<void> {
    if (!this.isMobile) {
      return;
    }

    try {
      const isConnected = await this.checkInternetConnection();
      if (!isConnected) {
        throw new Error('No internet connection available');
      }

      await this.checkForUpdates();
    } catch (error) {
      console.error('Failed to force update:', error);
      throw error;
    }
  }
}

export const cacheService = new CacheService();
