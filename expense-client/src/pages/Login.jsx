import { useState } from 'react';
import api from '../api/axios'; // แก้ไข: เรียกใช้ api instance ที่รองรับ VITE_API_URL[cite: 4, 5]
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            /* แก้ไข: ใช้ api instance ยิงไปที่ /login (พอร์ต 5000 ตาม .env)[cite: 4, 5] */
            const res = await api.post('/login', form);
            login(res.data.token);
            
            // --- ส่วนที่เพิ่มใหม่ ---
            // ดึงข้อมูลโปรไฟล์ทันทีหลัง Login สำเร็จ
            const profile = await api.get('/profile'); 
            if (profile.data.default_account_id) {
                // เซฟค่า ID บัญชีหลักจาก DB ลงในเครื่อง
                localStorage.setItem('default_account_id', profile.data.default_account_id);
            }
            // -----------------------

            navigate('/dashboard');
        } catch (err) {
            /* ปรับปรุง: แสดง Error Message จาก Backend ถ้ามี[cite: 4] */
            const errorMsg = err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ';
            alert(errorMsg);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-indigo-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tighter">EXPENSE TRACKER</h2>
                    <p className="text-gray-400 text-sm font-medium">ยินดีต้อนรับครับพี่ชาย</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                        <input type="text" placeholder="ระบุชื่อผู้ใช้" className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all mt-1 bg-gray-50" 
                            onChange={e => setForm({...form, username: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                        <input type="password" placeholder="ระบุรหัสผ่าน" className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all mt-1 bg-gray-50" 
                            onChange={e => setForm({...form, password: e.target.value})} required />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 mt-2">
                        เข้าสู่ระบบ
                    </button>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        ยังไม่มีบัญชี? <button type="button" onClick={() => navigate('/register')} className="text-indigo-600 font-bold">สมัครสมาชิกที่นี่</button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;