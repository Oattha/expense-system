import axios from 'axios';

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
            window.location.href = '/login'; // เตะไปหน้า Login
        }
        return Promise.reject(error);
    }
);

export default api;