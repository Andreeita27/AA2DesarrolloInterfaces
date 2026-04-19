import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    //jsdom simula nagegador: window, localstorage, location...
    environment: 'jsdom',
    globals: true, // esto permite usar describe, it, expect.. sin importarlos
  },
});
