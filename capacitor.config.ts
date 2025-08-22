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

  }
};

export default config;


