import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { router } from './router';
import { cacheService } from './services/CacheService';
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

cacheService.cacheWebsiteContent().then(() => {
  console.log('Cache service initialized');
}).catch(error => {
  console.error('Failed to initialize cache service:', error);
});


