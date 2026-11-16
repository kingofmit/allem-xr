import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    // mkcert plugin handles HTTPS (required for WebXR API access).
    // Expose on LAN so XR headsets on the same network can connect.
    // Only enable on trusted networks.
    host: true,
  },
})
