import { useState } from 'react';
import api from '../api/axios'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2, Coffee } from 'lucide-react'; // เพิ่ม Coffee เข้ามาให้ดูชิลล์

const Login = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false); 
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); 
        try {
            const res = await api.post('/login', form);
            login(res.data.token);
            
            const profile = await api.get('/profile'); 
            if (profile.data.default_account_id) {
                localStorage.setItem('default_account_id', profile.data.default_account_id);
            }

            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ';
            alert(errorMsg);
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 font-kanit">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-indigo-100 relative overflow-hidden">
                
                {/* ตกแต่งแถบ Loading ด้านบนสุดของบัตร (ถ้ากำลังโหลด) */}
                {isLoading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100">
                        <div className="h-full bg-indigo-600 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
                    </div>
                )}

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        {isLoading ? (
                            <Coffee className="text-white animate-bounce" size={32} />
                        ) : (
                            <LogIn className="text-white" size={32} />
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tighter">EXPENSE TRACKER</h2>
                    <p className="text-gray-400 text-sm font-medium">
                        {isLoading ? 'รอแป๊บน้า กำลังวอร์มเครื่อง...' : 'ยินดีต้อนรับครับพี่ชาย'}
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                        <input 
                            type="text" 
                            placeholder="ระบุชื่อผู้ใช้" 
                            className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all mt-1 bg-gray-50 disabled:opacity-50" 
                            onChange={e => setForm({...form, username: e.target.value})} 
                            disabled={isLoading}
                            required 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                        <input 
                            type="password" 
                            placeholder="ระบุรหัสผ่าน" 
                            className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all mt-1 bg-gray-50 disabled:opacity-50" 
                            onChange={e => setForm({...form, password: e.target.value})} 
                            disabled={isLoading}
                            required 
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white p-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-indigo-200 flex flex-col items-center justify-center gap-1`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>ช้าหน่อยนะพี่...</span>
                                    </div>
                                </>
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </button>
                        
                        {/* ข้อความตลกๆ ที่จะโผล่มาตอนโหลด */}
                        {isLoading && (
                            <p className="text-[10px] text-center text-indigo-400 mt-2 font-bold animate-pulse">
                                * เว็บเราราคาประหยัด เซิร์ฟเวอร์เลยรอนานนิดนึงพี่ 😅
                            </p>
                        )}
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-4">
                        ยังไม่มีบัญชี? <button type="button" disabled={isLoading} onClick={() => navigate('/register')} className="text-indigo-600 font-bold disabled:text-indigo-300">สมัครสมาชิกที่นี่</button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;