import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // เพิ่มบรรทัดนี้: เรียกใช้ Plugin PWA

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // เพิ่มตั้งค่า VitePWA ต่อท้าย react()
    VitePWA({
      registerType: 'autoUpdate', // อัปเดตแอปอัตโนมัติเมื่อมีเวอร์ชันใหม่
      manifest: {
        name: 'Expense Tracker', // ชื่อเต็มตอนติดตั้ง
        short_name: 'ExpenseApp', // ชื่อสั้นใต้ไอคอน
        description: 'แอปจัดการรายรับรายจ่ายของคุณ',
        theme_color: '#4f46e5', // สีธีม (Indigo-600)
        background_color: '#FDFDFD', // สีพื้นหลัง
        display: 'standalone', // ทำให้ซ่อนแถบเบราว์เซอร์ ดูเป็นแอปจริง
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