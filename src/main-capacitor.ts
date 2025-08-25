import { createApp } from 'vue';
import App from './components/App.vue';
import router from './router';
import './style.css';
import { Capacitor } from '@capacitor/core';

const app = createApp(App);

app.use(router);

if (Capacitor.isNativePlatform()) {
  const { App: AppPlugin } = await import('@capacitor/app');
  
  AppPlugin.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      checkForUpdates();
    }
  });
  
  AppPlugin.addListener('appUrlOpen', (data) => {
    // App opened with URL
  });
}

async function checkForUpdates() {
  try {
    const { App: AppPlugin } = await import('@capacitor/app');
    await AppPlugin.exitApp();
  } catch (error) {
    // App update check failed
  }
}

app.mount('#app');


