import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    User, LayoutDashboard, Wallet, PlusCircle, LogOut, 
    IdCard, ChevronRight, Info, Headset, ShieldCheck 
} from 'lucide-react';
import Swal from 'sweetalert2'; 

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // --- ฟังก์ชันแสดงคอมโพเนนต์ Avatar พร้อมกรอบ (Frame) ---
    const AvatarDisplay = ({ size = "w-12 h-12", iconSize = 24 }) => {
        // แก้ไข: ดึง Class จาก Database มาใช้โดยตรงเพื่อให้รองรับกรอบที่สร้างใหม่
        const frameClass = user?.avatar_frame || 'border-2 border-indigo-400/50';

        return (
            <div 
                onClick={() => navigate('/profile')} 
                // เพิ่ม transition-all duration-500 เพื่อให้เวลาเปลี่ยนกรอบแล้วมันสมูทแบบหน้า Profile ครับ
                className={`cursor-pointer rounded-2xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 ${size} ${frameClass}`}
            >
                {user?.profile_image ? (
                    <img 
                        /* แก้ไข: เปลี่ยนจากดึงผ่าน localhost/uploads มาใช้ URL จาก Cloudinary โดยตรง[cite: 5] */
                        src={user.profile_image} 
                        className="w-full h-full object-cover" 
                        alt="Profile"
                        /* Fallback กรณีรูปโหลดไม่ได้[cite: 4] */
                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + (user?.full_name || 'User'); }}
                    />
                ) : (
                    <div className="w-full h-full bg-indigo-500 flex items-center justify-center">
                        <User size={iconSize} className="text-white" />
                    </div>
                )}
            </div>
        );
    };

    const showVersionInfo = () => {
        Swal.fire({
            title: '<span className="text-xl font-black uppercase tracking-tight">System Information</span>',
            html: `
                <div className="text-left font-kanit p-2 space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-400 font-bold text-xs uppercase">Application</span>
                        <span className="font-black text-indigo-600">Expense Tracker Pro</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-400 font-bold text-xs uppercase">Version</span>
                        <span className="font-black text-gray-700">2.4.0 (Stable)</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-400 font-bold text-xs uppercase">Last Update</span>
                        <span className="font-bold text-gray-600">06 May 2026</span>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl text-[10px] text-indigo-400 font-medium leading-relaxed">
                        โดยทีมพัฒนา Oattha Dev. <br/>
                        สำหรับปัญหาหรือข้อเสนอแนะ ติดต่อได้ที่ email: <a href="mailto:facup877@gmail.com" target="_blank" className="text-indigo-600 font-bold">facup877@gmail.com</a> ครับ!
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            borderRadius: '25px',
            width: '350px'
        });
    };

    const isActive = (path) => location.pathname === path 
        ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' 
        : 'text-indigo-300/60 hover:bg-indigo-900/40 hover:text-white';
    
    const isActiveMobile = (path) => location.pathname === path 
        ? 'text-indigo-600' 
        : 'text-gray-400';

    const handleLogout = () => {
        /* ปรับปรุง: ล้าง Token และข้อมูลชั่วคราวออกให้หมด */
        localStorage.removeItem('token');
        localStorage.removeItem('default_account_id');
        logout(); // เรียกใช้ logout จาก AuthContext เพื่อล้างสถานะในตัวแปร
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-kanit">
            
            {/* Sidebar (Desktop) */}
            <div className="hidden md:flex w-72 bg-indigo-950 text-white flex-col shadow-2xl z-20">
                <div className="p-8 text-2xl font-black tracking-tighter border-b border-indigo-900/50 uppercase">
                    Expense <span className="text-indigo-400">Tracker</span>
                </div>
                
                {/* User Profile Section - ปรับใช้ AvatarDisplay ใหม่ */}
                <div className="p-6 bg-indigo-900/20 border-b border-indigo-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <AvatarDisplay size="w-14 h-14" iconSize={28} />
                        <div className="overflow-hidden">
                            <p className="font-bold text-lg truncate leading-tight">
                                {user?.full_name || 'อรรถพล'}
                            </p>
                            <p className="text-xs text-indigo-400/80 truncate font-medium mt-0.5">
                                @{user?.username || 'oattha_dev'}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-1.5 bg-indigo-950/40 p-3.5 rounded-[1.25rem] border border-indigo-800/30 text-[11px] text-indigo-300/90">
                        <p className="flex items-center gap-2 font-medium">
                            <IdCard size={13} className="opacity-70"/> 
                            <span className="tracking-wider text-indigo-200">ID: {user?.id || '1'}</span>
                        </p>
                    </div>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 p-5 space-y-2 mt-2">
                    <Link to="/dashboard" className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 font-semibold ${isActive('/dashboard')}`}>
                        <LayoutDashboard size={20} /> <span className="text-sm">ภาพรวมระบบ</span>
                    </Link>
                    <Link to="/account" className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 font-semibold ${isActive('/account')}`}>
                        <Wallet size={20} /> <span className="text-sm">จัดการบัญชี</span>
                    </Link>
                    <Link to="/transaction" className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 font-semibold ${isActive('/transaction')}`}>
                        <PlusCircle size={20} /> <span className="text-sm">เพิ่มรายการใหม่</span>
                    </Link>
                </nav>

                <div className="p-6 space-y-3 border-t border-indigo-900/50">
                    <button 
                        onClick={() => window.open('https://line.me', '_blank')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-900/40 text-indigo-300 hover:text-white transition-all text-[11px] font-bold group"
                    >
                        <Headset size={16} className="group-hover:animate-bounce" /> ติดต่อฝ่ายสนับสนุน
                    </button>
                    
                    <button 
                        onClick={showVersionInfo}
                        className="w-full flex items-center justify-between px-4 py-1 text-[9px] text-indigo-500 font-black uppercase tracking-widest hover:text-indigo-300 transition-colors"
                    >
                        <span>Ver 2.4.0</span>
                        <ShieldCheck size={12} />
                    </button>

                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold border border-red-500/20 shadow-lg shadow-red-950/10 active:scale-95">
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white md:bg-gray-50 relative">
                
                {/* Profile Header (Mobile) - ปรับใช้ AvatarDisplay ใหม่ */}
                <div className="md:hidden bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <AvatarDisplay size="w-10 h-10" iconSize={20} />
                        <div>
                            <p className="text-xs font-black text-gray-800 leading-tight">
                                {user?.full_name || 'อรรถพล'}
                            </p>
                            <button 
                                onClick={showVersionInfo}
                                className="flex items-center gap-1 text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5 active:opacity-50"
                            >
                                <Info size={10} /> App Info
                            </button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-32 md:pb-10">
                    <div className="max-w-5xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Bottom Navigation (Mobile) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] rounded-t-[2rem]">
                    <div className="max-w-md mx-auto flex items-center justify-around">
                        <Link to="/dashboard" className={`flex flex-col items-center gap-1 transition-all ${isActiveMobile('/dashboard')}`}>
                            <LayoutDashboard size={24} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">ภาพรวม</span>
                        </Link>
                        
                        <Link to="/transaction" className="relative -top-6">
                            <div className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 ring-[5px] ring-white active:scale-90 transition-all duration-300 flex items-center justify-center">
                                <PlusCircle size={28} strokeWidth={3} />
                            </div>
                        </Link>
                        
                        <Link to="/account" className={`flex flex-col items-center gap-1 transition-all ${isActiveMobile('/account')}`}>
                            <Wallet size={24} strokeWidth={location.pathname === '/account' ? 2.5 : 2} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">บัญชี</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;