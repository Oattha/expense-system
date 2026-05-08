import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share, PlusSquare, MoreVertical, MonitorSmartphone, Apple, Smartphone } from "lucide-react";

const InstallGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-kanit relative">
      
      {/* --- Top Navigation --- */}
      <div className="p-4 flex items-center relative z-50 bg-white border-b border-gray-100 shadow-sm sticky top-0">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="text-gray-400 p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all active:scale-90 flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-bold tracking-tight text-gray-700 uppercase ml-2">วิธีติดตั้งแอปพลิเคชัน</h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto pb-12">
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="text-center mt-4">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <MonitorSmartphone size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">ทำเว็บให้เป็นแอป!</h2>
            <p className="text-gray-500 text-xs mt-2 font-medium px-4">
              ติดตั้ง Expense Tracker ไว้บนหน้าจอมือถือของคุณ เพื่อการเข้าใช้งานที่รวดเร็ว ไม่ต้องพิมพ์เว็บใหม่ทุกครั้ง แถมลื่นไหลเหมือนแอปจริง!
            </p>
          </div>

          {/* iOS Guide */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100/50 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Apple className="text-gray-800" size={20} />
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">สำหรับ iPhone / iPad</h3>
            </div>
            
            <ol className="space-y-4 text-sm font-medium text-gray-600">
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <p>เปิดเว็บไซต์นี้ด้วยเบราว์เซอร์ <span className="font-bold text-blue-500">Safari</span> เท่านั้น</p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <p>
                  กดปุ่มแชร์ <Share size={16} className="inline text-blue-500 mx-1 mb-1" /> ที่แถบเมนูด้านล่างของหน้าจอ
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <p>
                  เลื่อนลงมาแล้วเลือกคำว่า <br/>
                  <span className="font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded-md mt-1 inline-flex items-center gap-1 border border-gray-200">
                    <PlusSquare size={14} className="text-gray-600"/> เพิ่มไปยังหน้าจอโฮม
                  </span>
                  <br/> <span className="text-[10px] text-gray-400">(Add to Home Screen)</span>
                </p>
              </li>
            </ol>
          </div>

          {/* Android Guide */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100/50 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Smartphone className="text-green-600" size={20} />
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">สำหรับ Android</h3>
            </div>
            
            <ol className="space-y-4 text-sm font-medium text-gray-600">
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <p>เปิดเว็บไซต์นี้ด้วยเบราว์เซอร์ <span className="font-bold text-red-500">Google Chrome</span></p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <p>
                  กดปุ่มเมนู <MoreVertical size={16} className="inline text-gray-800 mx-1 mb-1" /> (จุด 3 จุด) ที่มุมขวาบนของหน้าจอ
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <p>
                  เลือกคำว่า <br/>
                  <span className="font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded-md mt-1 inline-flex items-center gap-1 border border-gray-200">
                    <MonitorSmartphone size={14} className="text-gray-600"/> เพิ่มลงในหน้าจอหลัก
                  </span>
                  <br/> <span className="text-[10px] text-gray-400">(Add to Home Screen)</span>
                </p>
              </li>
            </ol>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-[0.1em] hover:bg-indigo-700 active:scale-[0.96] transition-all shadow-lg shadow-indigo-100 mt-6"
          >
            เข้าใจแล้ว กลับไปใช้งานแอป
          </button>

        </div>
      </div>
    </div>
  );
};

export default InstallGuide;