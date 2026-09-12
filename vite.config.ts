import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // public/manifest.json is the single manifest, linked from index.html
      manifest: false,
      includeAssets: ['manifest.json', 'icon-*.png', 'brokebot_*_square.png'],
      workbox: {
        // no `png`: the remaining public PNGs are social-preview images, never needed offline
        globPatterns: ['**/*.{html,js,css,svg,woff2}'],
        // ~470 lazy syntax-highlighter language chunks are cached on first use, not precached
        // the two model runtimes (~5.5 MB each) are only needed once a model loads
        globIgnores: ['**/assets/lang/**', '**/assets/web-llm-*.js', '**/assets/worker-*.js'],
        // the entry and worker chunks are ~5.5 MB each and the shell cannot boot without them
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_headers$/, /^\/\.well-known\//, /^\/robots\.txt$/, /^\/sitemap\.xml$/],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(?:web-llm|worker)-[^/]+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'brokebot-model-runtime',
              expiration: { maxEntries: 6 },
            },
          },
          {
            urlPattern: /\/assets\/lang\/[^/]+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'brokebot-lang',
              expiration: { maxEntries: 60 },
            },
          },
          {
            // 21 MB onnxruntime binary: cached on first use instead of precached
            urlPattern: /\/assets\/[^/]+\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'brokebot-wasm',
              expiration: { maxEntries: 4 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) =>
          chunk.moduleIds.some(
            (id) =>
              id.includes('/react-syntax-highlighter/dist/esm/languages/') ||
              id.includes('/refractor/lang/') ||
              id.includes('/highlight.js/lib/languages/')
          )
            ? 'assets/lang/[name]-[hash].js'
            : 'assets/[name]-[hash].js',
        manualChunks: (id) =>
          id.includes('/node_modules/@mlc-ai/web-llm/') ? 'web-llm' : undefined,
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'sonner',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      '@mlc-ai/web-llm'
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/testing/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
    },
  },
})
