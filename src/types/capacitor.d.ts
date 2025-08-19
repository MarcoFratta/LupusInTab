declare module '@capacitor/core' {
  interface PluginInterface {
    addListener(eventName: string, listenerFunc: Function): void;
    removeAllListeners(eventName: string): void;
  }
}

declare module '@capacitor/app' {
  interface AppPlugin extends PluginInterface {
    addListener(eventName: 'appStateChange', listenerFunc: (state: { isActive: boolean }) => void): void;
    addListener(eventName: 'appUrlOpen', listenerFunc: (data: { url: string }) => void): void;
    addListener(eventName: 'appRestoredResult', listenerFunc: (data: any) => void): void;
    addListener(eventName: 'backButton', listenerFunc: () => void): void;
    exitApp(): Promise<void>;
    canOpenUrl(options: { url: string }): Promise<{ value: boolean }>;
    openUrl(options: { url: string }): Promise<void>;
    getLaunchUrl(): Promise<{ url: string | null }>;
    getState(): Promise<{ isActive: boolean }>;
    minimizeApp(): Promise<void>;
  }
}

declare module '@capacitor/splash-screen' {
  interface SplashScreenPlugin extends PluginInterface {
    show(options?: {
      showDuration?: number;
      autoHide?: boolean;
      fadeInDuration?: number;
      fadeOutDuration?: number;
    }): Promise<void>;
    hide(options?: {
      fadeOutDuration?: number;
    }): Promise<void>;
  }
}

declare module '@capacitor/status-bar' {
  interface StatusBarPlugin extends PluginInterface {
    setStyle(options: { style: 'DARK' | 'LIGHT' }): Promise<void>;
    setBackgroundColor(options: { color: string }): Promise<void>;
    hide(): Promise<void>;
    show(): Promise<void>;
    setOverlaysWebView(options: { overlay: boolean }): Promise<void>;
  }
}

declare module '@capacitor/android' {
  interface AndroidPlugin extends PluginInterface {
    getInfo(): Promise<{
      version: string;
      platform: string;
      model: string;
      manufacturer: string;
      isVirtual: boolean;
      webViewVersion: string;
    }>;
  }
}

declare module '@capacitor/ios' {
  interface IOSPlugin extends PluginInterface {
    getInfo(): Promise<{
      version: string;
      platform: string;
      model: string;
      systemName: string;
      systemVersion: string;
    }>;
  }
}

declare global {
  interface Window {
    Capacitor?: {
      isNative: boolean;
      getPlatform(): string;
      isPluginAvailable(name: string): boolean;
      registerPlugin(name: string, implementations: any): any;
    };
  }
}

export {};


