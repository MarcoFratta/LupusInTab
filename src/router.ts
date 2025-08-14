import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    { path: '/', redirect: '/setup/home' },
    // We render everything in App.vue; this route only carries the page param for tabs
    { path: '/setup/:page(home|roles|players|settings)?', name: 'setup', component: { template: '<div />' } },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});


