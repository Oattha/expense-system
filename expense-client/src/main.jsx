import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- 1. เพิ่ม Import สำหรับระบบอัปเดต PWA และ SweetAlert2 ---
import { registerSW } from 'virtual:pwa-register'
import Swal from 'sweetalert2'

// 🚨 [เพิ่มใหม่] 1. นำเข้า Provider ของ FontSize
import { FontSizeProvider } from './contexts/FontSizeContext'
// -------------------------------------------------------

// --- 2. เพิ่มระบบเช็คอัปเดตและเด้งแจ้งเตือน ---
const updateSW = registerSW({
  onNeedRefresh() {
    // เมื่อระบบหลังบ้านพบว่ามีเวอร์ชันใหม่ จะเด้งกล่องนี้ขึ้นมา
    Swal.fire({
      title: 'มีอัปเดตแอปเวอร์ชันใหม่!',
      text: 'เราได้อัปเดตระบบให้ดีขึ้นและเพิ่มฟีเจอร์ใหม่ กรุณากดตกลงเพื่อใช้งานเวอร์ชันล่าสุดครับพี่',
      icon: 'info',
      confirmButtonText: 'อัปเดตทันที',
      confirmButtonColor: '#4f46e5',
      allowOutsideClick: false, // บังคับให้ต้องกดอัปเดต ปิดหนีไม่ได้
    }).then((result) => {
      if (result.isConfirmed) {
        updateSW(true); // สั่งสลับไปใช้เวอร์ชันใหม่และรีเฟรชหน้าแอปอัตโนมัติ
      }
    });
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});
// -----------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 🚨 [แก้ไขจุดนี้] 2. เอา FontSizeProvider มาครอบ App ไว้ เพื่อให้ Context ส่งข้อมูลได้ทั่วทั้งเว็บ */}
    <FontSizeProvider>
      <App />
    </FontSizeProvider>
  </StrictMode>,
)