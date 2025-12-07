import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(env.VITE_PORT),
      allowedHosts: [
        env.VITE_ALLOW_HOST_WWW,
        env.VITE_ALLOW_HOST
      ]
    }
  }
})
