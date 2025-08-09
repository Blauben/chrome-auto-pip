import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'content': resolve(__dirname, 'src/tab_script.js'),
        'service-worker': resolve(__dirname, 'src/service-worker.js'),
      },
      output: {
        entryFileNames: '[name].js', // Disable all code splitting
        manualChunks: undefined, // Disable dynamic imports splitting
        inlineDynamicImports: false,
        format: 'es'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public', // includes manifest.json, icons, etc.
});
