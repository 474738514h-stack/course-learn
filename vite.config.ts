import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { tingwuApiPlugin } from './vite-plugin-tingwu-api'

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
) as { version: string }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [react(), tingwuApiPlugin()],
    server: {
      host: '127.0.0.1',
      port: 5174,
      proxy: {
        '/api/bilibili': {
          target: 'https://api.bilibili.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/bilibili/, ''),
        },
      },
    },
  }
})
