import { LiveUpdate } from '@capawesome/capacitor-live-update';
import { App } from '@capacitor/app';

export class LiveUpdateService {
  private static instance: LiveUpdateService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): LiveUpdateService {
    if (!LiveUpdateService.instance) {
      LiveUpdateService.instance = new LiveUpdateService();
    }
    return LiveUpdateService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up app state change listener for updates
      App.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          await this.checkForUpdates();
        }
      });

      // Set up resume listener for updates
      App.addListener('resume', async () => {
        await this.checkForUpdates();
      });

      // Check for updates on app launch
      await this.checkForUpdates();

      this.isInitialized = true;
      console.log('Live Update Service initialized');
    } catch (error) {
      console.error('Failed to initialize Live Update Service:', error);
    }
  }

  async checkForUpdates(): Promise<boolean> {
    try {
      console.log('Checking for live updates...');
      
      const result = await LiveUpdate.sync();
      
      if (result.nextBundleId) {
        console.log('Update available:', result.nextBundleId);
        await this.applyUpdate();
        return true;
      } else {
        console.log('No updates available');
        return false;
      }
    } catch (error) {
      console.error('Update check failed:', error);
      return false;
    }
  }

  private async applyUpdate(): Promise<void> {
    try {
      console.log('Applying live update...');
      await LiveUpdate.reload();
    } catch (error) {
      console.error('Failed to apply update:', error);
    }
  }

  async getCurrentBundleInfo(): Promise<any> {
    try {
      return await LiveUpdate.getCurrentBundle();
    } catch (error) {
      console.error('Failed to get current bundle info:', error);
      return null;
    }
  }

  async getLatestBundleInfo(): Promise<any> {
    try {
      return await LiveUpdate.getLatestBundle();
    } catch (error) {
      console.error('Failed to get latest bundle info:', error);
      return null;
    }
  }

  async setChannel(channel: string): Promise<void> {
    try {
      await LiveUpdate.setChannel(channel);
      console.log('Channel set to:', channel);
    } catch (error) {
      console.error('Failed to set channel:', error);
    }
  }

  async getChannel(): Promise<string> {
    try {
      const info = await LiveUpdate.getLatestBundle();
      return info.channel || 'production';
    } catch (error) {
      console.error('Failed to get channel:', error);
      return 'production';
    }
  }

  async checkUpdateStatus(): Promise<{
    hasUpdate: boolean;
    currentVersion: string;
    latestVersion: string;
    updateSize?: string;
  }> {
    try {
      const current = await this.getCurrentBundleInfo();
      const latest = await this.getLatestBundleInfo();

      if (!current || !latest) {
        return {
          hasUpdate: false,
          currentVersion: 'unknown',
          latestVersion: 'unknown'
        };
      }

      const hasUpdate = current.version !== latest.version;
      
      return {
        hasUpdate,
        currentVersion: current.version || 'unknown',
        latestVersion: latest.version || 'unknown',
        updateSize: latest.size ? `${(latest.size / 1024 / 1024).toFixed(2)} MB` : undefined
      };
    } catch (error) {
      console.error('Failed to check update status:', error);
      return {
        hasUpdate: false,
        currentVersion: 'unknown',
        latestVersion: 'unknown'
      };
    }
  }

  async forceUpdateCheck(): Promise<boolean> {
    try {
      console.log('Forcing update check...');
      return await this.checkForUpdates();
    } catch (error) {
      console.error('Forced update check failed:', error);
      return false;
    }
  }

  cleanup(): void {
    // Remove listeners when service is destroyed
    App.removeAllListeners();
  }
}

export const liveUpdateService = LiveUpdateService.getInstance();
export default LiveUpdateService;
