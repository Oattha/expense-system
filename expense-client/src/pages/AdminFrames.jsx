import { useState, useEffect, useRef } from 'react'; 
import api from '../api/axios'; // แก้ไข: เรียกใช้ api instance ที่รองรับ VITE_API_URL
// เพิ่ม ChevronLeft สำหรับปุ่มย้อนกลับ
import { 
    Plus, Trash2, Crown, Ghost, Sparkles, Save, 
    Heart, Star, Zap, Flame, Rocket, Trophy, Gem,
    Circle, Palette, Wand2, Info, AlertTriangle, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // นำเข้า useNavigate
import Swal from 'sweetalert2';

const IconDisplay = ({ type, size = 14 }) => {
    const icons = {
        'Ghost': <Ghost size={size} />,
        'Crown': <Crown size={size} />,
        'Sparkles': <Sparkles size={size} />,
        'Heart': <Heart size={size} />,
        'Star': <Star size={size} />,
        'Zap': <Zap size={size} />,
        'Flame': <Flame size={size} />,
        'Rocket': <Rocket size={size} />,
        'Trophy': <Trophy size={size} />,
        'Gem': <Gem size={size} />,
    };
    return icons[type] || <Circle size={size} />;
};

const AdminFrames = () => {
    const navigate = useNavigate(); // ประกาศใช้งาน navigate[cite: 4]
    const [frames, setFrames] = useState([]);
    const [newFrame, setNewFrame] = useState({
        name: '',
        price: 0,
        css_class: '',
        icon_type: 'Ghost',
        is_premium: false
    });

    const [isGlow, setIsGlow] = useState(false);
    const formRef = useRef(null);

    const presets = [
        { name: 'นีออนกะพริบ', class: 'border-4 border-pink-400 animate-neon-pulse' },
        { name: 'ออร่าฟุ้งทอง', class: 'ring-4 ring-yellow-400 border-transparent shadow-xl shadow-yellow-500/50 animate-pulse' },
        { name: 'ไซเบอร์บลู', class: 'border-4 border-cyan-400 shadow-xl shadow-cyan-500/50 animate-pulse' },
        { name: 'สายรุ้งหมุน', class: 'border-4 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' },
        { name: 'กระจกโปร่งแสง', class: 'border-2 border-white/50 backdrop-blur-md bg-white/20 shadow-lg' },
        { name: 'ลอยวิบวับ', class: 'border-4 border-indigo-500 animate-float shadow-lg shadow-indigo-400/30' },
        { name: 'วงแหวน 2 ชั้น', class: 'ring-4 ring-purple-500 border-4 border-white shadow-md' },
        { name: 'นวลนุ่มนิ่ม', class: 'border-2 border-rose-400 shadow-sm animate-soft-glow' },
        { name: 'มินิมอลดำ', class: 'border-2 border-gray-900 bg-gray-50' },
        { name: 'ทองหรูหรา', class: 'border-4 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]' },
        { name: 'ออร่าเทพเจ้า', class: 'ring-4 ring-yellow-400 border-4 border-white shadow-[0_0_30px_rgba(250,204,21,1)] animate-pulse' },
        { name: 'คลื่นพลังงาน', class: 'border-4 border-cyan-400 animate-border-wave shadow-xl shadow-cyan-500/50' },
        { name: 'กระจก Shimmer', class: 'border-2 border-white/40 bg-gradient-to-r from-transparent via-white/50 to-transparent bg-[length:200%_100%] animate-shimmer backdrop-blur-md shadow-lg' },
        { name: 'พัลส์คลื่นความถี่', class: 'border-4 border-rose-500 animate-hit-pulse shadow-lg' },
        { name: 'ไฟไซเรนแดง', class: 'border-4 border-red-500 animate-emergency' },
        { name: 'ดุ๊กดิ๊ก Indigo', class: 'border-4 border-indigo-600 animate-wiggle shadow-md' },
        { name: 'นีออนม่วงเข้ม', class: 'border-4 border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.8)] animate-pulse' },
        { name: 'ขอบขาวฟุ้ง', class: 'border-4 border-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-soft-glow' }
    ];

    const handlePresetClick = (cssClass) => {
        setNewFrame(prev => ({ ...prev, css_class: cssClass }));
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                setIsGlow(true);
                setTimeout(() => setIsGlow(false), 1000);
            }
        }, 100); 
    };

    const iconOptions = ['Ghost', 'Crown', 'Sparkles', 'Heart', 'Star', 'Zap', 'Flame', 'Rocket', 'Trophy', 'Gem'];

    const fetchFrames = async () => {
        try {
            /* แก้ไข: ใช้ api instance เพื่อรองรับพอร์ต 5000 จาก .env */
            const res = await api.get('/frames');
            setFrames(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchFrames(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            /* แก้ไข: ใช้ api instance ในการส่งข้อมูล[cite: 4] */
            await api.post('/admin/frames', newFrame); 
            Swal.fire({ icon: 'success', title: 'เพิ่มสำเร็จ!', text: 'สร้างกรอบใหม่เรียบร้อยครับพี่', timer: 1500 });
            setNewFrame({ name: '', price: 0, css_class: '', icon_type: 'Ghost', is_premium: false });
            fetchFrames();
        } catch (err) {
            Swal.fire('อดเลยพี่!', err.response?.data?.error || "เกิดข้อผิดพลาด", 'warning');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 font-kanit pb-24">
            {/* Header ส่วนบนพร้อมปุ่มย้อนกลับ */}
            <div className="flex items-center gap-2 mb-6 px-1">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-gray-800">
                    <Palette className="text-indigo-600" /> Admin: Manage Frames
                </h2>
            </div>

            <div className="mb-6 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-2xl text-left text-gray-800">
                <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <Info size={18} />
                    <p className="text-sm font-black uppercase">System Developer Note</p>
                </div>
                <p className="text-[11px] text-indigo-600/80 leading-relaxed font-bold">
                    อันนี้ยังอยู่ในโหมดเดโมนะครับพี่ชาย ระบบจะช่วยสไลด์ลงไปที่ฟอร์มให้อัตโนมัติเมื่อกดเลือก Presets เพื่อให้พี่เห็น Preview ทันทีครับ
                </p>
            </div>

            <div className="mb-6 space-y-2 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                    <Wand2 size={12} /> คลิกเพื่อใช้คลาสพิเศษ (Presets)
                </p>
                <div className="flex flex-wrap gap-2 text-gray-800">
                    {presets.map((p) => (
                        <button
                            key={p.name}
                            type="button"
                            onClick={() => handlePresetClick(p.class)}
                            className="text-[10px] font-black px-3 py-2 bg-white border border-gray-100 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm active:scale-95 active:bg-indigo-50"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            <form 
                ref={formRef} 
                onSubmit={handleCreate} 
                className={`bg-white p-6 rounded-3xl border transition-all duration-700 mb-8 space-y-4 scroll-mt-24 
                ${isGlow ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-gray-100 shadow-sm'}`}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left text-gray-800">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tighter">ชื่อกรอบ</label>
                        <input type="text" placeholder="เช่น สายเปย์ Gold" required className="w-full p-3 border rounded-xl font-kanit outline-none focus:border-indigo-500 transition-colors"
                            value={newFrame.name} onChange={e => setNewFrame({...newFrame, name: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1 text-left text-gray-800">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tighter">ราคา (Point)</label>
                        <input type="number" placeholder="ราคา" className="w-full p-3 border rounded-xl font-kanit outline-none focus:border-indigo-500 transition-colors"
                            value={newFrame.price} onChange={e => setNewFrame({...newFrame, price: parseInt(e.target.value)})} />
                    </div>
                    
                    <div className="md:col-span-2 space-y-1 text-left text-gray-800">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tighter">Tailwind Class (แก้ไขชื่อสีที่นี่)</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="ระบุคลาส เช่น border-4 border-yellow-400" required className="w-full p-3 border rounded-xl font-mono text-xs bg-gray-50 text-indigo-600 shadow-inner outline-none focus:border-indigo-500 transition-colors"
                                value={newFrame.css_class} onChange={e => setNewFrame({...newFrame, css_class: e.target.value})} />
                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 bg-white ${newFrame.css_class}`}>
                                <IconDisplay type={newFrame.icon_type} size={20} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-1 md:col-span-2 text-left text-gray-800">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tighter">เลือกไอคอน</label>
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                            {iconOptions.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setNewFrame({ ...newFrame, icon_type: icon })}
                                    className={`p-3 border rounded-xl flex items-center justify-center transition-all ${newFrame.icon_type === icon ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-inner scale-95' : 'bg-white hover:border-gray-300'}`}
                                >
                                    <IconDisplay type={icon} size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer p-1">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        checked={newFrame.is_premium} onChange={e => setNewFrame({...newFrame, is_premium: e.target.checked})} />
                    <span className="text-sm font-bold text-gray-600 font-kanit text-left">เป็นกรอบ Premium (ต้องซื้อ)</span>
                </label>

                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest active:scale-95">
                    <Plus size={20} /> เพิ่มกรอบโปรไฟล์ใหม่ลงระบบ
                </button>
            </form>

            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">คลังกรอบโปรไฟล์ปัจจุบัน</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {frames.map(f => (
                        <div key={f.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-all text-gray-800">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white transition-all ${f.css_class}`}>
                                    <IconDisplay type={f.icon_type} size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-gray-800 leading-none font-kanit">{f.name}</p>
                                    <p className="text-[9px] font-bold text-indigo-500 mt-1 uppercase tracking-tighter font-kanit">By {f.creator?.full_name || 'System'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminFrames;