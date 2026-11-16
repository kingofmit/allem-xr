import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For WebXR, HTTPS is required. Uncomment mkcert after running:
//   mkcert -install
// Or run: ! mkcert -install  (in Claude Code to install the local CA)
//
// import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
})
