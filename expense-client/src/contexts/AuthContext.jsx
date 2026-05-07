import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null); // เพิ่ม state สำหรับเก็บข้อมูลโปรไฟล์

    // ฟังก์ชันดึงข้อมูลโปรไฟล์จาก Backend
    const fetchProfile = async () => {
        if (token) {
            try {
                // เช็คให้ชัวร์ว่าใน Go ของพี่ใช้เส้น /profile หรือ /me แล้วแก้ให้ตรงกันครับ
                const res = await api.get('/profile'); 
                setUser(res.data); // เก็บข้อมูล ID, FullName, Email ลงใน state
            } catch (err) {
                console.error("Fetch profile failed:", err);
                logout(); // ถ้า Token หมดอายุหรือมีปัญหา ให้ Logout ออกเลย
            }
        }
    };

    // ให้ดึงข้อมูลโปรไฟล์ทุกครั้งที่ Token เปลี่ยน (เช่น ตอน Login สำเร็จ)
    useEffect(() => {
        fetchProfile();
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        // ส่ง user ออกไปให้หน้าอื่น (เช่น MainLayout) ใช้ด้วย
        <AuthContext.Provider value={{ token, user, setUser, login, logout }}>
        {children}
    </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);