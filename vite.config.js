import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  base: "",
  server: {
    https: true
  },
  plugins: [mkcert()]
})

