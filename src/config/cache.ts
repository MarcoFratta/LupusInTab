export const CACHE_CONFIG = {
  WEBSITE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-website.com' 
    : 'http://localhost:3000',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  VERSION_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
