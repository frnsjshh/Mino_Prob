import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: http://localhost:3452",
        "connect-src 'self' http://localhost:3452 ws://localhost:5173",
      ].join('; '),
    },
  },
})
