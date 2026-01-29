import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // AWS SDK gibi bazı kütüphaneler tarayıcıda 'global' nesnesine ihtiyaç duyar.
    // Bunu 'window' objesine eşitleyerek çözüyoruz.
    global: 'window',
  },
})