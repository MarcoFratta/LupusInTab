import { register } from 'register-service-worker';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}sw.js`, {
    ready() {
      console.log('App is being served from cache by a service worker.');
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
      // Dispatch event to notify the app
      document.dispatchEvent(new CustomEvent('swUpdateFound'));
    },
    updated(registration) {
      console.log('New content is available; please refresh.');
      // Dispatch event to notify the app
      document.dispatchEvent(new CustomEvent('swUpdated'));
      
      // Automatically activate the new service worker
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
      document.dispatchEvent(new CustomEvent('swOffline'));
    },
    error(error) {
      console.error('Error during service worker registration:', error);
      document.dispatchEvent(new CustomEvent('swError', { detail: error }));
    },
  });
}
