interface VersionInfo {
  version: string;
  timestamp: number;
  assets: string[];
}

interface CachedVersion {
  version: string;
  timestamp: number;
  assets: string[];
}

class UpdateService {
  private readonly VERCEL_URL = 'https://lupus-in-tabula.vercel.app';
  private readonly VERSION_ENDPOINT = '/version.json';
  private readonly CACHE_KEY = 'lupus_app_version';
  private readonly CACHE_PREFIX = 'lupus_asset_';

  async checkForUpdates(): Promise<boolean> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const remoteVersion = await this.fetchRemoteVersion();
      
      if (!remoteVersion) {
        console.log('Could not fetch remote version, using bundled assets');
        return false;
      }

      if (this.isNewerVersion(remoteVersion.version, currentVersion)) {
        console.log(`New version available: ${remoteVersion.version}`);
        await this.downloadAndCacheAssets(remoteVersion);
        await this.updateCachedVersion(remoteVersion);
        return true;
      }

      console.log('App is up to date');
      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  private async getCurrentVersion(): Promise<string> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed: CachedVersion = JSON.parse(cached);
        return parsed.version;
      }
    } catch (error) {
      console.error('Error reading cached version:', error);
    }
    return '0.0.0';
  }

  private async fetchRemoteVersion(): Promise<VersionInfo | null> {
    try {
      const response = await fetch(`${this.VERCEL_URL}${this.VERSION_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const versionInfo: VersionInfo = await response.json();
      return versionInfo;
    } catch (error) {
      console.error('Failed to fetch remote version:', error);
      return null;
    }
  }

  private isNewerVersion(remoteVersion: string, currentVersion: string): boolean {
    const remote = this.parseVersion(remoteVersion);
    const current = this.parseVersion(currentVersion);
    
    for (let i = 0; i < 3; i++) {
      if (remote[i] > current[i]) return true;
      if (remote[i] < current[i]) return false;
    }
    return false;
  }

  private parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v, 10));
  }

  private async downloadAndCacheAssets(versionInfo: VersionInfo): Promise<void> {
    const promises = versionInfo.assets.map(async (assetPath) => {
      try {
        const response = await fetch(`${this.VERCEL_URL}${assetPath}`);
        if (response.ok) {
          const content = await response.text();
          localStorage.setItem(`${this.CACHE_PREFIX}${assetPath}`, content);
          console.log(`Cached asset: ${assetPath}`);
        }
      } catch (error) {
        console.error(`Failed to cache asset ${assetPath}:`, error);
      }
    });

    await Promise.all(promises);
  }

  private async updateCachedVersion(versionInfo: VersionInfo): Promise<void> {
    try {
      const cachedVersion: CachedVersion = {
        version: versionInfo.version,
        timestamp: Date.now(),
        assets: versionInfo.assets
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedVersion));
    } catch (error) {
      console.error('Error updating cached version:', error);
    }
  }

  async getAssetContent(assetPath: string): Promise<string | null> {
    try {
      const cached = localStorage.getItem(`${this.CACHE_PREFIX}${assetPath}`);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.error('Error reading cached asset:', error);
    }
    return null;
  }

  async clearCache(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || key === this.CACHE_KEY
      );
      
      cacheKeys.forEach(key => localStorage.removeItem(key));
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheInfo(): Promise<{ version: string; timestamp: number; assetCount: number }> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed: CachedVersion = JSON.parse(cached);
        const assetCount = parsed.assets.length;
        return {
          version: parsed.version,
          timestamp: parsed.timestamp,
          assetCount
        };
      }
    } catch (error) {
      console.error('Error reading cache info:', error);
    }
    
    return {
      version: '0.0.0',
      timestamp: 0,
      assetCount: 0
    };
  }
}

export const updateService = new UpdateService();
export default UpdateService;

