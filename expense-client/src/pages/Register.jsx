import { useState } from "react";
import api from "../api/axios"; // แก้ไข: เรียกใช้ api instance ที่รองรับ VITE_API_URL[cite: 4, 5]
import { useNavigate } from "react-router-dom";
import { UserPlus, User, Lock, Mail, BadgeCheck, ChevronLeft } from "lucide-react";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "", // ส่งค่าให้ตรงกับ json:"full_name" ใน Go
    email: "",    // ส่งค่าให้ตรงกับ json:"email" ใน Go
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      /* แก้ไข: ใช้ api instance ยิงไปที่ /register (พอร์ต 5000 ตาม .env)[cite: 4, 5] */
      await api.post("/register", form); 
      alert("สร้างบัญชีผู้ใช้งานสำเร็จ!");
      navigate("/login");
    } catch (err) {
      /* ปรับปรุง: แสดง Error Message จริงจากฝั่ง Go Controller */
      alert("สมัครสมาชิกไม่สำเร็จ: " + (err.response?.data?.error || "กรุณลองใหม่อีกครั้ง"));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-kanit relative">
      
      {/* --- Top Navigation: ปุ่มย้อนกลับ --- */}
      <div className="p-4 flex items-center relative z-50">
        <button 
          type="button"
          onClick={() => navigate("/login")} 
          className="text-gray-400 p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all active:scale-90 flex items-center justify-center"
          title="Back to Login"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 -mt-12">
        <div className="w-full max-sm:max-w-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100 animate-in zoom-in duration-500">
              <UserPlus className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase">สร้างบัญชีใหม่</h2>
            <p className="text-gray-400 text-[11px] mt-1 font-bold uppercase tracking-widest">เริ่มต้นจัดการการเงินของคุณวันนี้</p>
          </div>

          {/* Registration Card */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-50/50 relative overflow-hidden">
            {/* ตกแต่งพื้นหลัง Card */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="space-y-4">
                
                {/* Username */}
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">ชื่อผู้ใช้</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full bg-gray-50 border-2 border-transparent p-3.5 pl-12 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-700"
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">รหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full bg-gray-50 border-2 border-transparent p-3.5 pl-12 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-700"
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">ชื่อ-นามสกุล</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-3.5 text-gray-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full bg-gray-50 border-2 border-transparent p-3.5 pl-12 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-700"
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">อีเมล</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full bg-gray-50 border-2 border-transparent p-3.5 pl-12 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-700"
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 active:scale-[0.96] transition-all shadow-lg shadow-indigo-100 mt-6"
              >
                ยืนยันการสมัคร
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
            >
              มีบัญชีอยู่แล้ว? <span className="font-black text-indigo-600 ml-1 border-b-2 border-indigo-100 pb-0.5">เข้าสู่ระบบ</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;