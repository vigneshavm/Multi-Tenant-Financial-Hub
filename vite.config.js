import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define environment variable prefix compatibility for local development.
  // Although modern Vite prefers VITE_*, we often need to support older patterns.
  // Since the application relies on process.env.REACT_APP_..., Vite handles this 
  // correctly during the build/dev process by default, but we include an alias 
  // for clarity and potentially faster module resolution.
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});