import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lupus.master',
  appName: 'Lupus Master',
  webDir: 'dist',
  server: {
    url: 'https://lupus-in-tabula.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      backgroundColor: '#081124',
      showSpinner: true,
      spinnerColor: '#3b82f6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false
    }
  }
};

export default config;


