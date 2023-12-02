import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sslPlugin from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  server: { https: true },
  plugins: [react(), sslPlugin()],
});
