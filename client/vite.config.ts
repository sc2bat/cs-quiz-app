import { readFileSync } from 'fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
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
