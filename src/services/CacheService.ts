import { Capacitor } from '@capacitor/core';

interface CachedAsset {
  url: string;
  content: string;
  timestamp: number;
}

interface CacheData {
  assets: Record<string, CachedAsset>;
  timestamp: number;
}

const CACHE_KEY = 'website_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class CacheService {
  private isMobile = Capacitor.isNativePlatform();

  async cacheWebsiteContent(): Promise<void> {
    if (!this.isMobile) {
      return;
    }

    try {
      const response = await fetch('/');
      const html = await response.text();
      
      const assets = this.extractAssets(html);
      await this.cacheAssets(assets);
      
      const cacheData: CacheData = {
        assets,
        timestamp: Date.now()
      };
      
      await this.saveCache(cacheData);
    } catch (error) {
      console.error('Failed to cache website content:', error);
    }
  }

  private extractAssets(html: string): Record<string, CachedAsset> {
    const assets: Record<string, CachedAsset> = {};
    const assetRegex = /(href|src)=["']([^"']+)["']/g;
    let match;
    
    while ((match = assetRegex.exec(html)) !== null) {
      const [, , url] = match;
      if (url.startsWith('/') && !url.startsWith('//')) {
        assets[url] = {
          url,
          content: '',
          timestamp: Date.now()
        };
      }
    }
    
    return assets;
  }

  private async cacheAssets(assets: Record<string, CachedAsset>): Promise<void> {
    for (const [url, asset] of Object.entries(assets)) {
      try {
        const response = await fetch(url);
        const content = await response.text();
        asset.content = content;
      } catch (error) {
        console.error(`Failed to cache asset ${url}:`, error);
      }
    }
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

      if (Date.now() - asset.timestamp > CACHE_DURATION) {
        return null;
      }

      return asset.content;
    } catch (error) {
      console.error('Failed to get cached content:', error);
      return null;
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
      
      if (Date.now() - cacheData.timestamp > CACHE_DURATION) {
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
      return cacheData !== null && (Date.now() - cacheData.timestamp <= CACHE_DURATION);
    } catch (error) {
      return false;
    }
  }
}

export const cacheService = new CacheService();
