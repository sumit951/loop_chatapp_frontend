import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/loop_chatapp/', // ← your subfolder name here
  plugins: [react()],
});