import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/tab_script.js'),
        'service-worker': resolve(__dirname, 'src/service-worker.js')
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
  },
  publicDir: 'public', // includes manifest.json, icons, etc.
});
