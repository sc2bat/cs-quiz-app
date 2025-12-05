import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      allowedHosts: [
        env.VITE_ALLOW_HOST_01,
        env.VITE_ALLOW_HOST_02
      ]
    }
  }
})