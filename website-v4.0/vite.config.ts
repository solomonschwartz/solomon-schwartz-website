import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // Root-relative paths
  build: {
    outDir: '../',       // Output directly into Website/
    emptyOutDir: false   // Prevents deleting the rest of Website/!
  },
  plugins: [react()]
});
