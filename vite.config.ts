
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 允许代码中使用 process.env.API_KEY 而不崩溃
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});
