import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'


function normalizeBasePath(input?: string): string {
  const raw = (input ?? '/').trim()
  if (!raw) {
    return '/'
  }

  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`
  const collapsedSlashes = withLeadingSlash.replace(/\/+/g, '/')
  const withoutTrailingSlashes = collapsedSlashes.replace(/\/+$/, '')

  return withoutTrailingSlashes === '' ? '/' : `${withoutTrailingSlashes}/`
}


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')

  return {
    envDir: '..',
    base: normalizeBasePath(env.VITE_BASE_PATH),
    build: {
      outDir: '../dist/client',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${env.API_SERVER_PORT}`,
          changeOrigin: true,
        },
        '/static': {
          target: `http://127.0.0.1:${env.API_SERVER_PORT}`,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      babel({
        presets: [reactCompilerPreset(), '@babel/preset-typescript'],
        exclude: 'node_modules/**',
      })
    ],
  }
})
