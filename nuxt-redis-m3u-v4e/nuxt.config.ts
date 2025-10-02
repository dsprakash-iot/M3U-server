export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  nitro: { preset: 'node-server' },
  runtimeConfig: {
    redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
    sessionIdleSeconds: Number(process.env.SESSION_IDLE_SECONDS || 1800),
    sessionSliding: (process.env.SESSION_SLIDING || 'true') === 'true',
    mediaRoot: process.env.MEDIA_ROOT || '/data',
    schedulerIntervalSec: Number(process.env.SCHEDULER_INTERVAL_SEC || 60),
    public: {}
  },
  app: { head: { title: 'M3U Server', link: [{ rel: 'stylesheet', href: '/app.css' }] } }
})
