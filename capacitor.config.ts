import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lupus.master',
  appName: 'Lupus Master',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1f2937',
      showSpinner: true,
      spinnerColor: '#3b82f6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1f2937',
      overlaysWebView: false
    },
    LiveUpdate: {
      appId: 'com.lupus.master',
      channel: 'production',
      autoUpdateMethod: 'background',
      maxVersions: 2,
      serverUrl: 'https://lupus-in-tabula.vercel.app'
    }
  }
};

export default config;


