import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { router } from './router';
import { liveUpdateService } from './services/LiveUpdateService';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

// Initialize Live Update Service
liveUpdateService.initialize().then(() => {
  console.log('Live Update Service initialized successfully');
}).catch(error => {
  console.error('Failed to initialize Live Update Service:', error);
});


