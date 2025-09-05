import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { router } from './router';
import './registerSW';
import { initializeRoleAPI } from './utils/roleAPI';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize RoleAPI after Pinia is set up
initializeRoleAPI();

app.mount('#app');


