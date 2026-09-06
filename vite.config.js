import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/camp-portal/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        certificate: resolve(rootDir, 'certificate.html')
      }
    }
  }
});
