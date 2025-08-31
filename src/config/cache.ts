export const CACHE_CONFIG = {
  WEBSITE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://lupus-in-tabula.vercel.app' 
    : 'http://localhost:3000',
  VERSION_ENDPOINT: '/version.json',
  CACHE_DURATION: Infinity,
  VERSION_CHECK_INTERVAL: 60 * 60 * 1000,
  MAX_CACHE_SIZE: 100 * 1024 * 1024,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;
