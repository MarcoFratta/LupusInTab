import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './components/App.vue';
import router from './router';
import { updateService } from './services/UpdateService';
import './style.css';

async function initializeApp() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);

  app.mount('#app');

  try {
    console.log('Checking for app updates...');
    const hasUpdates = await updateService.checkForUpdates();
    
    if (hasUpdates) {
      console.log('App updated successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}

initializeApp();

