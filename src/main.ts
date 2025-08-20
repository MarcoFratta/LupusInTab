import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { router } from './router';
import { updateService } from './services/UpdateService';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

// Check for app updates after mounting
updateService.checkForUpdates().then(hasUpdates => {
  if (hasUpdates) {
    console.log('App updated successfully, reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}).catch(error => {
  console.error('Error checking for updates:', error);
});


