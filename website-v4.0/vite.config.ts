import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Use relative paths (index.html expects CSS/JS in same folder)
  build: {
    outDir: '../',       // Output directly into Website/
    emptyOutDir: false   // Prevent deletion of parent folder
  },
  plugins: [react()]
});
