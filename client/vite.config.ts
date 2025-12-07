import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(env.VITE_PRD_PORT),
      // port: parseInt(env.VITE_DEV_PORT),
      allowedHosts: [
        env.VITE_ALLOW_HOST_01,
        env.VITE_ALLOW_HOST_02
      ]
    }
  }
})
