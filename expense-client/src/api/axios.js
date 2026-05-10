import axios from 'axios';
import Swal from 'sweetalert2'; // เพิ่ม Import SweetAlert2

const api = axios.create({
    // ดึง URL จากไฟล์ .env (Vite จะใช้ import.meta.env)
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

// Interceptor สำหรับขาไป (Request): ใส่ Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor สำหรับขากลับ (Response): จัดการ Error กลาง
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ถ้าหลังบ้านตอบกลับมาว่า 401 (Token เน่าหรือไม่มีสิทธิ์)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token'); // ล้างเครื่อง
            localStorage.removeItem('default_account_id'); // เคลียร์ไอดีบัญชีที่จำไว้ด้วยให้สะอาดหมดจด
            
            // --- เพิ่มการแจ้งเตือนสวยๆ ก่อนเตะไปหน้า Login ---
            Swal.fire({
                icon: 'warning',
                title: 'เซสชันหมดอายุ',
                text: 'ไม่ได้เข้าใช้งานนาน กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัยครับพี่',
                confirmButtonText: 'รับทราบ',
                confirmButtonColor: '#4f46e5',
                allowOutsideClick: false, // บังคับให้กดปุ่มเท่านั้น ปิดหนีไม่ได้
                borderRadius: '20px'
            }).then(() => {
                window.location.href = '/login'; // เตะไปหน้า Login หลังจากยูสเซอร์กดตกลง
            });
            // ---------------------------------------------
        }
        return Promise.reject(error);
    }
);

export default api;