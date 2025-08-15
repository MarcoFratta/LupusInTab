import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    { path: '/', redirect: '/setup/home' },
    // We render everything in App.vue; this route only carries the page param for tabs
    { path: '/setup/:page(home|roles|players|settings)?', name: 'setup', component: { template: '<div />' } },
    { path: '/role-details', name: 'role-details', component: { template: '<div />' } },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
    // Add scroll behavior to automatically scroll to top on route changes
    scrollBehavior(to: any, from: any, savedPosition: any) {
        // If there's a saved position (browser back/forward), use it
        if (savedPosition) {
            return savedPosition;
        }
        // Otherwise scroll to top
        return { top: 0, behavior: 'smooth' };
    },
});


