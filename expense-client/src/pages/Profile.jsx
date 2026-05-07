import { useState, useEffect } from "react";
import api from "../api/axios"; 
import { useAuth } from "../contexts/AuthContext";
import {
  Camera,
  Crown,
  Ghost,
  Sparkles,
  Circle,
  Plus,
  Heart,
  Star,
  Zap,
  Flame,
  Rocket,
  Trophy,
  Gem,
  User,
  ChevronLeft,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any"; 
import Swal from "sweetalert2";

// Helper สำหรับเลือกไอคอนตาม IconType
const IconPicker = ({ type, size = 14 }) => {
  const icons = {
    Ghost: <Ghost size={size} />,
    Crown: <Crown size={size} />,
    Sparkles: <Sparkles size={size} />,
    Heart: <Heart size={size} />,
    Star: <Star size={size} />,
    Zap: <Zap size={size} />,
    Flame: <Flame size={size} />,
    Rocket: <Rocket size={size} />,
    Trophy: <Trophy size={size} />,
    Gem: <Gem size={size} />,
  };
  return icons[type] || <Circle size={size} />;
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [selectedFrame, setSelectedFrame] = useState(user?.avatar_frame || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const res = await api.get("/frames");
        setFrames(res.data);
      } catch (err) {
        console.error("Fetch frames failed:", err);
      }
    };
    fetchFrames();
  }, []);

  const handleImageChange = async (e) => {
    let file = e.target.files[0];
    if (file) {
      Swal.fire({
        title: "กำลังเตรียมรูปภาพ...",
        text: "รอสักครู่ครับพี่อรรถพล ระบบกำลังประมวลผล",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        if (file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic") {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });
          file = new File([convertedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: "image/jpeg",
          });
        }

        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 512,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setSelectedImage(compressedFile);
        setPreviewUrl(URL.createObjectURL(compressedFile));
        Swal.close();
      } catch (error) {
        console.error("Image processing error:", error);
        Swal.fire("ผิดพลาด", "ไม่สามารถอ่านไฟล์ภาพนี้ได้ครับพี่ ลองใหม่อีกครั้งนะ", "error");
      }
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    if (selectedImage) formData.append("profile_image", selectedImage);
    formData.append("avatar_frame", selectedFrame);
    formData.append("full_name", fullName);

    try {
      const res = await api.put("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && typeof setUser === "function") {
        setUser((prevUser) => ({
          ...prevUser,
          full_name: res.data.full_name || fullName,
          profile_image: res.data.profile_image || prevUser.profile_image,
          avatar_frame: res.data.avatar_frame || selectedFrame,
          // อัปเดตตัวนับจากหลังบ้านเพื่อให้ UI แสดงค่าล่าสุด
          avatar_update_count: res.data.avatar_update_count ?? prevUser.avatar_update_count,
        }));

        Swal.fire({
          icon: "success",
          title: "เรียบร้อยครับพี่!",
          text: "อัปเดตข้อมูลโปรไฟล์แล้ว",
          timer: 1500,
          showConfirmButton: false,
          borderRadius: "20px",
        });

        setSelectedImage(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อหลังบ้านครับ";
      Swal.fire({ 
        icon: "error", 
        title: "อัปเดตไม่สำเร็จ", 
        text: msg,
        confirmButtonColor: "#6366f1"
      });
    }
  };

  // แบ่งกรอบออกเป็น 2 แถว
  const midIndex = Math.ceil(frames.length / 2);
  const row1 = frames.slice(0, midIndex);
  const row2 = frames.slice(midIndex);

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 font-kanit pb-24">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-black uppercase text-gray-800 tracking-tighter">
            Profile Settings
          </h2>
        </div>
        <button
          onClick={() => navigate("/admin/frames")}
          className="flex items-center gap-1 text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-200 transition-all shadow-sm"
        >
          <Plus size={12} /> เพิ่มกรอบใหม่
        </button>
      </div>

      {/* Profile Image Zone */}
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="relative group">
          <div
            className={`w-32 h-32 rounded-[2.5rem] overflow-hidden transition-all duration-500 bg-white ${selectedFrame}`}
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : user?.profile_image ? (
              <img src={user.profile_image} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-4xl bg-indigo-50 text-indigo-200">
                {fullName?.charAt(0) || user?.full_name?.charAt(0)}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg border-4 border-white cursor-pointer active:scale-90 transition-all hover:bg-indigo-700 z-10">
            <Camera size={18} />
            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*,.heic" />
          </label>
        </div>
        
        {/* โควตาเปลี่ยนรูป */}
        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
          <Info size={14} className="shrink-0" />
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-tight">
              สิทธิ์เปลี่ยนรูป: 3 ครั้ง / เดือน
            </p>
            <p className="text-[9px] font-medium opacity-80">
              เดือนนี้ใช้ไปแล้ว: {user?.avatar_update_count || 0} / 3 ครั้ง
            </p>
          </div>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-3 px-1 text-left">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
          ข้อมูลส่วนตัว
        </p>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <User size={18} />
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ชื่อ-นามสกุล (เปลี่ยนได้เดือนละครั้ง)"
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
          />
        </div>
        <p className="text-[9px] font-bold text-rose-400 px-2 uppercase tracking-tighter">
          * ชื่อเปลี่ยนได้เดือนละ 1 ครั้ง | รูปเปลี่ยนได้เดือนละ 3 ครั้ง
        </p>
      </div>

      {/* Frame Selection - Horizontal Scroll (2 Rows) */}
      <div className="space-y-3 text-left">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
          เลือกกรอบโปรไฟล์
        </p>
        
        <div className="space-y-3 overflow-hidden">
          {frames.length > 0 ? (
            <>
              {/* แถวที่ 1 */}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide px-1 pb-1">
                {row1.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.css_class)}
                    className={`flex-shrink-0 flex items-center gap-3 p-3 min-w-[200px] rounded-2xl border transition-all duration-300 ${selectedFrame === f.css_class ? "border-indigo-600 bg-indigo-50 shadow-md scale-[0.98]" : "border-gray-100 bg-white hover:bg-gray-50 shadow-sm"}`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-500 ${f.css_class} ${selectedFrame === f.css_class ? "bg-indigo-600 text-white" : "text-gray-400"}`}>
                      <IconPicker type={f.icon_type} size={16} />
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className={`text-[11px] font-black truncate ${selectedFrame === f.css_class ? "text-indigo-600" : "text-gray-600"}`}>
                        {f.name}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                        By {f.creator?.full_name || "System"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* แถวที่ 2 */}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide px-1 pb-1">
                {row2.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.css_class)}
                    className={`flex-shrink-0 flex items-center gap-3 p-3 min-w-[200px] rounded-2xl border transition-all duration-300 ${selectedFrame === f.css_class ? "border-indigo-600 bg-indigo-50 shadow-md scale-[0.98]" : "border-gray-100 bg-white hover:bg-gray-50 shadow-sm"}`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-500 ${f.css_class} ${selectedFrame === f.css_class ? "bg-indigo-600 text-white" : "text-gray-400"}`}>
                      <IconPicker type={f.icon_type} size={16} />
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className={`text-[11px] font-black truncate ${selectedFrame === f.css_class ? "text-indigo-600" : "text-gray-600"}`}>
                        {f.name}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                        By {f.creator?.full_name || "System"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                ยังไม่มีรายการกรอบ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleUpdateProfile}
        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-200 active:scale-[0.98] transition-all"
      >
        บันทึกการเปลี่ยนแปลง
      </button>
    </div>
  );
};

export default Profile;