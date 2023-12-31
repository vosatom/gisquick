import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, mergeConfig, splitVendorChunkPlugin, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'
import { createSvgPlugin } from 'vite-plugin-vue2-svg'
import createSvgSpritePlugin from 'vite-plugin-svg-sprite'

const env = loadEnv('', process.cwd(), '')

const buildExtensions = env.VITE_BUILD_EXTENSIONS

export default defineConfig(() => {
  const config = {
    plugins: [
      splitVendorChunkPlugin(),
      vue2(),
      vue2Jsx(),
      !buildExtensions && legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),
      createSvgPlugin(),
      createSvgSpritePlugin({
        symbolId: '[name]',
      }),
      !buildExtensions && VitePWA({
        disable: env.VITE_VUE_APP_MODE !== 'pwa',
        manifest: {
          name: 'Gisquick',
          start_url: '/',
          description: 'Gisquick web map application',
          background_color: '#242424',
          theme_color: '#242424',
          icons: [
            {
              src: './map/icons/android-chrome-144x144.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: './map/icons/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: './map/icons/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png',
            },
            {
              src: './map/icons/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: './map/icons/mstile-150x150.png',
              sizes: '150x150',
              type: 'image/png',
            },
          ],
        },
      }),
    ].filter(f => f) as Plugin[],
    build: {
      assetsDir: 'map',
    },
    server: {
      port: 3000,
      proxy: {
        "/ws": {
          ws: true,
          target: 'ws://127.0.0.1:8002',
          secure: false,
          changeOrigin: true,
        },
        "/api": {
          target: 'http://127.0.0.1:8002',
          changeOrigin: true,
          secure: false,
        }
      },
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        path: 'path-browserify',
        '@/icons': fileURLToPath(new URL('./icons', import.meta.url)),
        '@/': fileURLToPath(new URL('./src/', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
    }
  }

  if (buildExtensions) {
    return mergeConfig(config, {
      publicDir: false,
      build: {
        outDir: "dist",
        lib: {
          entry: "./src/extensions/index.js",
          name: "infopanel",
          fileName: "infopanel",
          formats: ["umd"],
        },
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            exports: "named",
          },
        },
      },
    })
  }

  return config
})
