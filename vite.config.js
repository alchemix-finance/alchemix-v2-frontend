import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { fileURLToPath } from 'url';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

const MODE = process.env.NODE_ENV;
const development = MODE === 'development';

export default defineConfig({
  plugins: [
    development &&
      nodePolyfills({
        include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')],
      }),
    svelte(),
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@helpers': fileURLToPath(new URL('./src/helpers', import.meta.url)),
      '@locales': fileURLToPath(new URL('./src/locales', import.meta.url)),
      '@middleware': fileURLToPath(new URL('./src/middleware', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  base: '',
});
