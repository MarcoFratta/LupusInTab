import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { CACHE_CONFIG } from '../config/cache';

interface CachedAsset {
  url: string;
  content: string;
  timestamp: number;
  version: string;
  etag?: string;
  hash: string;
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

interface UpdateProgress {
  current: number;
  total: number;
  status: string;
}

type UpdateProgressCallback = (progress: UpdateProgress) => void;
type LogCallback = (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;

const CACHE_KEY = 'website_cache';

class CacheService {
  private isMobile = Capacitor.isNativePlatform();
  private currentVersion: string | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private progressCallback: UpdateProgressCallback | null = null;
  private logCallback: LogCallback | null = null;

  setProgressCallback(callback: UpdateProgressCallback): void {
    this.progressCallback = callback;
  }

  setLogCallback(callback: LogCallback): void {
    this.logCallback = callback;
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    console.log(`Cache service [${type}]:`, message);
    if (this.logCallback) {
      this.logCallback(message, type);
    }
  }

  private updateProgress(current: number, total: number, status: string): void {
    if (this.progressCallback) {
      this.progressCallback({ current, total, status });
    }
  }

  async initialize(): Promise<void> {
    this.log('Initialize called', 'info');
    this.log(`Capacitor.isNativePlatform() = ${Capacitor.isNativePlatform()}`, 'info');
    this.log(`this.isMobile = ${this.isMobile}`, 'info');
    
    if (!this.isMobile) {
      this.log('Not on mobile platform, skipping initialization', 'info');
      return;
    }

    this.log('Initializing on mobile platform...', 'info');

    try {
      this.log('Checking internet connection...', 'info');
      const isConnected = await this.checkInternetConnection();
      this.log(`Internet connection status: ${isConnected}`, isConnected ? 'success' : 'warning');
      
      if (!isConnected) {
        this.log('No internet connection, using existing cache', 'warning');
        return;
      }

      this.log('Internet connection available, checking for updates...', 'info');
      await this.checkForUpdates();
      
      // Start automatic periodic updates
      this.log('Starting automatic updates...', 'info');
      this.startAutomaticUpdates();
    } catch (error) {
      this.log(`Failed to initialize: ${error}`, 'error');
    }
  }

  private async checkInternetConnection(): Promise<boolean> {
    try {
      this.log('Checking network status...', 'info');
      const status = await Network.getStatus();
      this.log(`Network status: ${JSON.stringify(status)}`, 'info');
      return status.connected;
    } catch (error) {
      this.log(`Failed to check network status: ${error}`, 'error');
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
      const versionUrl = `${CACHE_CONFIG.WEBSITE_URL}${CACHE_CONFIG.VERSION_ENDPOINT}`;
      this.log(`Fetching version info from: ${versionUrl}`, 'info');
      
      this.log('Making fetch request...', 'info');
      const response = await fetch(versionUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      this.log(`Response status: ${response.status} ${response.statusText}`, 'info');
      this.log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`, 'info');
      
      if (!response.ok) {
        this.log(`Failed to fetch version.json: HTTP ${response.status} ${response.statusText}`, 'error');
        return null;
      }
      
      const contentType = response.headers.get('content-type');
      this.log(`Content-Type header: ${contentType}`, 'info');
      
      if (!contentType || !contentType.includes('application/json')) {
        this.log(`Invalid content type for version.json: ${contentType}`, 'error');
        this.log('This suggests Vercel is not serving the file correctly', 'error');
        return null;
      }
      
      const responseText = await response.text();
      this.log(`Response body length: ${responseText.length} characters`, 'info');
      this.log(`Response body preview: ${responseText.substring(0, 200)}...`, 'info');
      
      try {
        const versionInfo = JSON.parse(responseText);
        this.log(`Successfully parsed version info: ${JSON.stringify(versionInfo)}`, 'success');
        return versionInfo;
      } catch (parseError) {
        this.log(`Failed to parse JSON response: ${parseError}`, 'error');
        this.log(`Raw response: ${responseText}`, 'error');
        return null;
      }
    } catch (error) {
      this.log(`Network error fetching version info: ${error}`, 'error');
      return null;
    }
  }

  private async performFullCache(versionInfo: VersionInfo): Promise<void> {
    try {
      this.updateProgress(0, 100, 'Preparazione cache completa...');
      
      // Start with core PWA assets
      const coreAssets = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/favicon.svg',
        '/style.css'
      ];
      
      // Expand wildcard patterns for comprehensive Vite asset coverage
      this.updateProgress(10, 100, 'Espansione pattern asset...');
      const expandedAssets = await this.expandAssetPatterns(versionInfo.assets);
      
      // Combine core assets with expanded assets
      const allAssets = [...coreAssets, ...expandedAssets];
      console.log(`Caching ${allAssets.length} assets (${coreAssets.length} core + ${expandedAssets.length} expanded)`);
      
      this.updateProgress(20, 100, `Download di ${allAssets.length} asset...`);
      const assets = await this.cacheAssets(versionInfo.version, allAssets);
      
      this.updateProgress(90, 100, 'Salvataggio cache...');
      const cacheData: CacheData = {
        assets,
        timestamp: Date.now(),
        version: versionInfo.version,
        lastCheck: Date.now()
      };
      
      await this.saveCache(cacheData);
      this.updateProgress(100, 100, 'Cache completata!');
      console.log('Full website cache completed');
    } catch (error) {
      console.error('Failed to perform full cache:', error);
      this.updateProgress(0, 100, 'Errore durante il cache');
    }
  }

  private async updateCache(newVersionInfo: VersionInfo, existingCache: CacheData): Promise<void> {
    try {
      console.log(`Version mismatch: cached ${existingCache.version}, server ${newVersionInfo.version}`);
      console.log('Checking for incremental updates...');
      
      this.updateProgress(0, 100, 'Controllo aggiornamenti incrementali...');
      
      // Expand wildcard patterns for comprehensive Vite asset coverage
      this.updateProgress(10, 100, 'Espansione pattern asset...');
      const expandedAssets = await this.expandAssetPatterns(newVersionInfo.assets);
      console.log(`Expanded ${newVersionInfo.assets.length} patterns to ${expandedAssets.length} actual assets`);
      
      this.updateProgress(20, 100, `Analisi di ${expandedAssets.length} asset...`);
      
      const updatedAssets = { ...existingCache.assets };
      let newAssetsCount = 0;
      let updatedAssetsCount = 0;
      let unchangedAssetsCount = 0;
      
      for (let i = 0; i < expandedAssets.length; i++) {
        const assetPath = expandedAssets[i];
        const progress = 20 + Math.floor((i / expandedAssets.length) * 60);
        
        try {
          const assetUrl = `${CACHE_CONFIG.WEBSITE_URL}${assetPath}`;
          const existingAsset = existingCache.assets[assetPath];
          
          // Get current hash from server
          const currentHash = await this.getAssetHash(assetUrl);
          if (!currentHash) {
            console.log(`Skipping ${assetPath}: Could not get hash`);
            continue;
          }
          
          if (!existingAsset) {
            // New asset - download it
            this.updateProgress(progress, 100, `Download nuovo asset: ${assetPath.split('/').pop()}`);
            console.log(`New asset detected: ${assetPath}`);
            const response = await fetch(assetUrl);
            if (response.ok) {
              const content = await response.text();
              updatedAssets[assetPath] = {
                url: assetPath,
                content,
                timestamp: Date.now(),
                version: newVersionInfo.version,
                etag: response.headers.get('etag') || undefined,
                hash: currentHash
              };
              newAssetsCount++;
            }
          } else if (existingAsset.hash !== currentHash) {
            // Asset changed - download new version
            this.updateProgress(progress, 100, `Aggiornamento asset: ${assetPath.split('/').pop()}`);
            console.log(`Asset changed: ${assetPath}`);
            const response = await fetch(assetUrl);
            if (response.ok) {
              const content = await response.text();
              updatedAssets[assetPath] = {
                url: assetPath,
                content,
                timestamp: Date.now(),
                version: newVersionInfo.version,
                etag: response.headers.get('etag') || undefined,
                hash: currentHash
              };
              updatedAssetsCount++;
            }
          } else {
            // Asset unchanged - keep existing
            this.updateProgress(progress, 100, `Asset invariato: ${assetPath.split('/').pop()}`);
            console.log(`Asset unchanged: ${assetPath}`);
            unchangedAssetsCount++;
          }
        } catch (error) {
          console.error(`Failed to process asset ${assetPath}:`, error);
        }
      }
      
      this.updateProgress(85, 100, 'Salvataggio cache...');
      
      // Update cache with new data
      const updatedCacheData: CacheData = {
        assets: updatedAssets,
        timestamp: Date.now(),
        version: newVersionInfo.version,
        lastCheck: Date.now()
      };
      
      await this.saveCache(updatedCacheData);
      
      this.updateProgress(90, 100, 'Pulizia asset obsoleti...');
      
      // Clean up old assets that are no longer needed
      await this.cleanupOldAssets(updatedAssets, expandedAssets);
      
      this.updateProgress(100, 100, 'Aggiornamento completato!');
      
      console.log(`Incremental update completed:`);
      console.log(`  - New assets: ${newAssetsCount}`);
      console.log(`  - Updated assets: ${updatedAssetsCount}`);
      console.log(`  - Unchanged assets: ${unchangedAssetsCount}`);
      console.log(`  - Total cached assets: ${Object.keys(updatedAssets).length}`);
      
    } catch (error) {
      console.error('Failed to perform incremental update:', error);
      this.updateProgress(0, 100, 'Errore durante aggiornamento incrementale');
      // Fallback to full cache if incremental fails
      console.log('Falling back to full cache...');
      await this.performFullCache(newVersionInfo);
    }
  }

  private async cleanupOldAssets(currentAssets: Record<string, CachedAsset>, neededAssets: string[]): Promise<void> {
    const neededAssetSet = new Set(neededAssets);
    let removedCount = 0;
    
    for (const [assetPath, asset] of Object.entries(currentAssets)) {
      if (!neededAssetSet.has(assetPath)) {
        delete currentAssets[assetPath];
        removedCount++;
        console.log(`Removed old asset: ${assetPath}`);
      }
    }
    
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old assets`);
    }
  }

  private async cacheAssets(version: string, assetPaths: string[]): Promise<Record<string, CachedAsset>> {
    const assets: Record<string, CachedAsset> = {};
    
    for (const assetPath of assetPaths) {
      try {
        // Skip wildcard patterns and non-accessible files
        if (assetPath.includes('**') || assetPath.includes('*.ts') || assetPath.includes('*.js') || assetPath.includes('*.vue')) {
          continue;
        }
        
        const assetUrl = `${CACHE_CONFIG.WEBSITE_URL}${assetPath}`;
        console.log(`Caching asset: ${assetUrl}`);
        
        const response = await fetch(assetUrl);
        
        if (response.ok) {
          const content = await response.text();
          const etag = response.headers.get('etag') || undefined;
          const hash = await this.getAssetHash(assetUrl);
          
          assets[assetPath] = {
            url: assetPath,
            content,
            timestamp: Date.now(),
            version: version,
            etag,
            hash
          };
          console.log(`Successfully cached: ${assetPath} (hash: ${hash})`);
        } else {
          console.log(`Failed to cache ${assetPath}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`Failed to cache asset ${assetPath}:`, error);
      }
    }
    
    console.log(`Cached ${Object.keys(assets).length} assets successfully`);
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

      return asset.content;
    } catch (error) {
      this.log(`Failed to get cached content: ${error}`, 'error');
      return null;
    }
  }

  async getCachedContentWithFallback(url: string): Promise<string | null> {
    if (!this.isMobile) {
      // On browser, always fetch from network
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.text();
        }
      } catch (error) {
        this.log(`Failed to fetch ${url}: ${error}`, 'error');
      }
      return null;
    }

    // On mobile, use cache with fallback
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
      this.log(`Failed to fetch ${url}: ${error}`, 'error');
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
      
      // Cache never expires - removed expiration check
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

  private stopAutomaticUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Cache service: Automatic updates stopped');
    }
    
    // Remove event listeners
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    if (typeof window !== 'undefined' && 'navigator' in window && 'onLine' in navigator) {
      window.removeEventListener('online', this.handleNetworkRestore.bind(this));
    }
  }

  private handleNetworkRestore = async (): Promise<void> => {
    console.log('Cache service: Internet connection restored, checking for updates...');
    try {
      await this.checkForUpdates();
    } catch (error) {
      console.error('Cache service: Network restore update failed:', error);
    }
  };

  async isCacheValid(): Promise<boolean> {
    if (!this.isMobile) {
      return false;
    }

    try {
      const cacheData = await this.loadCache();
      // Cache never expires - always valid if it exists
      return cacheData !== null;
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

  async getDetailedCacheInfo(): Promise<{
    version: string;
    timestamp: number;
    assetCount: number;
    totalSize: number;
    newAssets: number;
    updatedAssets: number;
    unchangedAssets: number;
  } | null> {
    if (!this.isMobile) {
      return null;
    }

    try {
      const cacheData = await this.loadCache();
      if (!cacheData) return null;

      const totalSize = JSON.stringify(cacheData).length;
      
      return {
        version: cacheData.version,
        timestamp: cacheData.timestamp,
        assetCount: Object.keys(cacheData.assets).length,
        totalSize,
        newAssets: 0, // Will be updated during incremental updates
        updatedAssets: 0, // Will be updated during incremental updates
        unchangedAssets: 0 // Will be updated during incremental updates
      };
    } catch (error) {
      console.error('Failed to get detailed cache info:', error);
      return null;
    }
  }

  async getVersionInfo(): Promise<{ currentVersion: string; newVersion: string } | null> {
    if (!this.isMobile) {
      return null;
    }

    try {
      const cacheData = await this.loadCache();
      const currentVersion = cacheData?.version || 'N/A';
      
      const versionInfo = await this.fetchVersionInfo();
      const newVersion = versionInfo?.version || 'N/A';
      
      return { currentVersion, newVersion };
    } catch (error) {
      console.error('Failed to get version info:', error);
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

  async forceIncrementalUpdate(): Promise<void> {
    if (!this.isMobile) {
      return;
    }

    try {
      const isConnected = await this.checkInternetConnection();
      if (!isConnected) {
        throw new Error('No internet connection available');
      }

      console.log('Forcing incremental update check...');
      const versionInfo = await this.fetchVersionInfo();
      if (!versionInfo) {
        throw new Error('Failed to fetch version info');
      }

      const existingCache = await this.loadCache();
      if (!existingCache) {
        console.log('No existing cache, performing full cache');
        await this.performFullCache(versionInfo);
        return;
      }

      await this.updateCache(versionInfo, existingCache);
    } catch (error) {
      console.error('Failed to force incremental update:', error);
      throw error;
    }
  }

  private startAutomaticUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Check for updates every hour (configurable)
    this.updateInterval = setInterval(async () => {
      try {
        console.log('Cache service: Automatic update check...');
        const isConnected = await this.checkInternetConnection();
        if (isConnected) {
          await this.checkForUpdates();
        }
      } catch (error) {
        console.error('Cache service: Automatic update failed:', error);
      }
    }, CACHE_CONFIG.VERSION_CHECK_INTERVAL);
    
    // Also check when app becomes visible/active
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    // Monitor network status changes
    this.startNetworkMonitoring();
    
    console.log(`Cache service: Automatic updates started (every ${CACHE_CONFIG.VERSION_CHECK_INTERVAL / (60 * 1000)} minutes)`);
  }

  private handleVisibilityChange(): void {
    if (!document.hidden) {
      // App became visible, check for updates
      setTimeout(async () => {
        try {
          console.log('Cache service: App became visible, checking for updates...');
          const isConnected = await this.checkInternetConnection();
          if (isConnected) {
            await this.checkForUpdates();
          }
        } catch (error) {
          console.error('Cache service: Visibility change update failed:', error);
        }
      }, 1000); // Wait 1 second for app to fully load
    }
  }

  private startNetworkMonitoring(): void {
    if (typeof window !== 'undefined' && 'navigator' in window && 'onLine' in navigator) {
      window.addEventListener('online', this.handleNetworkRestore);
    }
  }

  private async getAssetHash(url: string): Promise<string> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) return '';
      
      // Try ETag first (most reliable), then Last-Modified, then Content-Length as fallback
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');
      const contentLength = response.headers.get('content-length');
      
      if (etag) return etag;
      if (lastModified) return lastModified;
      if (contentLength) return `length-${contentLength}`;
      
      return '';
    } catch (error) {
      console.error(`Failed to get hash for ${url}:`, error);
      return '';
    }
  }

  private async expandAssetPatterns(patterns: string[]): Promise<string[]> {
    const expandedAssets: string[] = [];
    
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Handle wildcard patterns
        const expanded = await this.expandWildcardPattern(pattern);
        expandedAssets.push(...expanded);
      } else {
        // Direct file path
        expandedAssets.push(pattern);
      }
    }
    
    return expandedAssets;
  }

  private async expandWildcardPattern(pattern: string): Promise<string[]> {
    const assets: string[] = [];
    
    try {
      // Handle Vite build patterns
      if (pattern === '/assets/index-*.js') {
        // Try to find the actual index JS file
        const possibleFiles = [
          '/assets/index.js',
          '/assets/index-[hash].js'
        ];
        
        for (const file of possibleFiles) {
          const url = `${CACHE_CONFIG.WEBSITE_URL}${file}`;
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              assets.push(file);
            }
          } catch (error) {
            // File doesn't exist, skip
          }
        }
        
        // Also try to discover the actual hash-based filename
        const discoveredFiles = await this.discoverViteAssets('index', 'js');
        assets.push(...discoveredFiles);
        
      } else if (pattern === '/assets/index-*.css') {
        // Try to find the actual index CSS file
        const possibleFiles = [
          '/assets/index.css',
          '/assets/index-[hash].css'
        ];
        
        for (const file of possibleFiles) {
          const url = `${CACHE_CONFIG.WEBSITE_URL}${file}`;
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              assets.push(file);
            }
          } catch (error) {
            // File doesn't exist, skip
          }
        }
        
        // Also try to discover the actual hash-based filename
        const discoveredFiles = await this.discoverViteAssets('index', 'css');
        assets.push(...discoveredFiles);
        
      } else if (pattern === '/assets/vendor-*.js') {
        // Try to find vendor bundle
        const possibleFiles = [
          '/assets/vendor.js',
          '/assets/vendor-[hash].js'
        ];
        
        for (const file of possibleFiles) {
          const url = `${CACHE_CONFIG.WEBSITE_URL}${file}`;
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              assets.push(file);
            }
          } catch (error) {
            // File doesn't exist, skip
          }
        }
        
        // Also try to discover the actual hash-based filename
        const discoveredFiles = await this.discoverViteAssets('vendor', 'js');
        assets.push(...discoveredFiles);
        
      } else if (pattern === '/assets/*.js') {
        // Discover all JS files (component chunks)
        const discoveredFiles = await this.discoverViteAssets('*', 'js');
        assets.push(...discoveredFiles);
        
      } else if (pattern === '/assets/*.css') {
        // Discover all CSS files
        const discoveredFiles = await this.discoverViteAssets('*', 'css');
        assets.push(...discoveredFiles);
        
      } else if (pattern === '/workbox-*.js') {
        // Try to find workbox files
        const possibleFiles = [
          '/workbox.js',
          '/workbox-[hash].js'
        ];
        
        for (const file of possibleFiles) {
          const url = `${CACHE_CONFIG.WEBSITE_URL}${file}`;
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              assets.push(file);
            }
          } catch (error) {
            // File doesn't exist, skip
          }
        }
        
      } else if (pattern.startsWith('/assets/*.')) {
        const extension = pattern.split('.').pop();
        // Add common asset extensions
        if (extension === 'woff2') assets.push('/assets/fonts.woff2');
        if (extension === 'woff') assets.push('/assets/fonts.woff');
        if (extension === 'png') assets.push('/assets/icon.png');
        if (extension === 'svg') assets.push('/assets/logo.svg');
        if (extension === 'ico') assets.push('/assets/favicon.ico');
      }
      
      console.log(`Expanded pattern ${pattern} to ${assets.length} assets`);
    } catch (error) {
      console.error(`Failed to expand pattern ${pattern}:`, error);
    }
    
    return assets;
  }

  private async discoverBuiltAssets(): Promise<string[]> {
    const discoveredAssets: string[] = [];
    
    try {
      // Get the main HTML file to discover built assets
      const htmlUrl = `${CACHE_CONFIG.WEBSITE_URL}/index.html`;
      const htmlResponse = await fetch(htmlUrl);
      
      if (htmlResponse.ok) {
        const htmlContent = await htmlResponse.text();
        
        // Find all script tags
        const scriptMatches = htmlContent.match(/<script[^>]+src="([^"]+)"/g);
        if (scriptMatches) {
          scriptMatches.forEach(match => {
            const src = match.match(/src="([^"]+)"/)?.[1];
            if (src && src.startsWith('/')) {
              discoveredAssets.push(src);
            }
          });
        }
        
        // Find all link tags (CSS, fonts, etc.)
        const linkMatches = htmlContent.match(/<link[^>]+href="([^"]+)"/g);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const href = match.match(/href="([^"]+)"/)?.[1];
            if (href && href.startsWith('/')) {
              discoveredAssets.push(href);
            }
          });
        }
        
        // Find all img tags
        const imgMatches = htmlContent.match(/<img[^>]+src="([^"]+)"/g);
        if (imgMatches) {
          imgMatches.forEach(match => {
            const src = match.match(/src="([^"]+)"/)?.[1];
            if (src && src.startsWith('/')) {
              discoveredAssets.push(src);
            }
          });
        }
      }
      
      // Also check the manifest for additional assets
      const manifestUrl = `${CACHE_CONFIG.WEBSITE_URL}/manifest.webmanifest`;
      const manifestResponse = await fetch(manifestUrl);
      
      if (manifestResponse.ok) {
        const manifestContent = await manifestResponse.json();
        
        // Add icons from manifest
        if (manifestContent.icons) {
          manifestContent.icons.forEach((icon: any) => {
            if (icon.src && icon.src.startsWith('/')) {
              discoveredAssets.push(icon.src);
            }
          });
        }
      }
      
      // Remove duplicates and filter out non-asset URLs
      const uniqueAssets = [...new Set(discoveredAssets)].filter(asset => 
        !asset.includes('?') && 
        !asset.includes('#') && 
        !asset.endsWith('/') &&
        asset !== '/'
      );
      
      console.log(`Discovered ${uniqueAssets.length} built assets automatically`);
      return uniqueAssets;
      
    } catch (error) {
      console.error('Failed to discover built assets:', error);
      return [];
    }
  }

  private async discoverViteAssets(name: string, extension: string): Promise<string[]> {
    const assets: string[] = [];
    
    try {
      // Read the HTML file to find Vite-generated assets
      const htmlUrl = `${CACHE_CONFIG.WEBSITE_URL}/index.html`;
      const htmlResponse = await fetch(htmlUrl);
      
      if (htmlResponse.ok) {
        const htmlContent = await htmlResponse.text();
        
        if (name === '*') {
          // Find all files with this extension
          const regex = new RegExp(`/assets/[^"']*\\.${extension}`, 'g');
          const matches = htmlContent.match(regex);
          if (matches) {
            assets.push(...matches);
          }
        } else {
          // Find specific named files
          const regex = new RegExp(`/assets/${name}-[^"']*\\.${extension}`, 'g');
          const matches = htmlContent.match(regex);
          if (matches) {
            assets.push(...matches);
          }
        }
        
        // Also check for any other assets that might be referenced
        if (extension === 'js') {
          // Look for script tags
          const scriptMatches = htmlContent.match(/<script[^>]+src="([^"]+)"/g);
          if (scriptMatches) {
            scriptMatches.forEach(match => {
              const src = match.match(/src="([^"]+)"/)?.[1];
              if (src && src.startsWith('/assets/') && src.endsWith('.js')) {
                assets.push(src);
              }
            });
          }
        } else if (extension === 'css') {
          // Look for link tags
          const linkMatches = htmlContent.match(/<link[^>]+href="([^"]+)"/g);
          if (linkMatches) {
            linkMatches.forEach(match => {
              const href = match.match(/href="([^"]+)"/)?.[1];
              if (href && href.startsWith('/assets/') && href.endsWith('.css')) {
                assets.push(href);
              }
            });
          }
        }
      }
      
      // Remove duplicates
      const uniqueAssets = [...new Set(assets)];
      console.log(`Discovered ${uniqueAssets.length} ${extension} assets for pattern ${name}`);
      
      return uniqueAssets;
      
    } catch (error) {
      console.error(`Failed to discover Vite assets for ${name}.${extension}:`, error);
      return [];
    }
  }

  async forceUpdateNow(): Promise<void> {
    if (!this.isMobile) {
      console.log('Cache service: Not on mobile platform, skipping force update');
      return;
    }

    try {
      console.log('Cache service: Force update requested...');
      const isConnected = await this.checkInternetConnection();
      if (!isConnected) {
        throw new Error('No internet connection available');
      }

      console.log('Cache service: Clearing existing cache...');
      await this.clearCache();
      
      console.log('Cache service: Performing fresh cache...');
      await this.checkForUpdates();
      console.log('Cache service: Force update completed');
    } catch (error) {
      console.error('Cache service: Force update failed:', error);
      throw error;
    }
  }

  async getCurrentCacheVersion(): Promise<string | null> {
    try {
      const cacheData = await this.loadCache();
      return cacheData?.version || null;
    } catch (error) {
      console.error('Failed to get current cache version:', error);
      return null;
    }
  }

  async getServerVersion(): Promise<string | null> {
    try {
      const versionInfo = await this.fetchVersionInfo();
      return versionInfo?.version || null;
    } catch (error) {
      console.error('Failed to get server version:', error);
      return null;
    }
  }
}

export const cacheService = new CacheService();
