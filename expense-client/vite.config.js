import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // เปลี่ยนเป็น prompt เพื่อให้ระบบเด้งถาม User ก่อนอัปเดต
      // --- ส่วนที่เพิ่มเข้ามาเพื่อแก้ปัญหาไฟล์เกิน 2MB และจัดการแคชเก่า ---
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // ขยายลิมิตเป็น 5MB
        cleanupOutdatedCaches: true, // บังคับล้างแคชเวอร์ชันเก่าทิ้งเสมอ
      },
      // ----------------------------------------
      manifest: {
        name: 'Expense Tracker',
        short_name: 'ExpenseApp',
        description: 'แอปจัดการรายรับรายจ่ายของคุณ',
        theme_color: '#4f46e5',
        background_color: '#FDFDFD',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})