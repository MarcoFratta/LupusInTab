import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { router } from './router';
import { cacheService } from './services/CacheService';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');

cacheService.cacheWebsiteContent().catch(error => {
  // Cache service failed to initialize
});


