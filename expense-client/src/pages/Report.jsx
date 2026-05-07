import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // แก้ไข: เรียกใช้ api instance ที่รองรับ VITE_API_URL
import { ChevronLeft, Inbox, CalendarDays, CalendarRange } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const Report = () => {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'expense';
    const [period, setPeriod] = useState('month');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- State สำหรับตัวกรอง ปี และ เดือน ---
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { val: '', name: 'ทั้งปี' }, 
        { val: 1, name: 'มกราคม' }, { val: 2, name: 'กุมภาพันธ์' }, { val: 3, name: 'มีนาคม' },
        { val: 4, name: 'เมษายน' }, { val: 5, name: 'พฤษภาคม' }, { val: 6, name: 'มิถุนายน' },
        { val: 7, name: 'กรกฎาคม' }, { val: 8, name: 'สิงหาคม' }, { val: 9, name: 'กันยายน' },
        { val: 10, name: 'ตุลาคม' }, { val: 11, name: 'พฤศจิกายน' }, { val: 12, name: 'ธันวาคม' }
    ];

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                // ปรับปรุง: ใช้ api instance ยิงไปที่พอร์ต 5000 ตาม .env อัตโนมัติ
                let url = `/report/categories?type=${type}&period=${period}&year=${selectedYear}`;
                
                if (period === 'month' && selectedMonth !== '') {
                    url += `&month=${selectedMonth}`;
                } else if (period === 'month' && selectedMonth === '') {
                    url = `/report/categories?type=${type}&period=year&year=${selectedYear}`;
                }
                
                const res = await api.get(url);
                setData(res.data || []);
            } catch (err) {
                console.error("Fetch report error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [type, period, selectedYear, selectedMonth]); 

    const total = data.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-10 text-[#444] font-kanit">
            <header className="bg-white px-6 py-4 border-b flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 transition-colors">
                        <ChevronLeft size={22}/>
                    </button>
                    <h1 className="font-bold text-gray-700 tracking-tight">
                        สรุป{type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">ยอดรวม</p>
                    <p className={`text-sm font-black ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>฿{total.toLocaleString()}</p>
                </div>
            </header>

            <div className="p-5 space-y-6">
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                    {['day', 'month', 'year'].map((p) => (
                        <button 
                            key={p}
                            onClick={() => {
                                setPeriod(p);
                                if (p === 'year') setSelectedMonth(''); 
                            }}
                            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all duration-300 ${period === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            {p === 'day' ? 'วันนี้' : p === 'month' ? 'รายเดือน' : 'รายปี'}
                        </button>
                    ))}
                </div>

                {period !== 'day' && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex-1 flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                            <CalendarDays size={14} className="text-indigo-500" />
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="w-full bg-transparent text-xs font-bold text-gray-600 outline-none cursor-pointer"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>พ.ศ. {y + 543}</option>
                                ))}
                            </select>
                        </div>

                        {period === 'month' && (
                            <div className="flex-1 flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                                <CalendarRange size={14} className="text-indigo-500" />
                                <select 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full bg-transparent text-xs font-bold text-gray-600 outline-none cursor-pointer"
                                >
                                    {months.map(m => (
                                        <option key={m.val} value={m.val}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {!loading && data.length > 0 ? (
                    <>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm h-[300px] relative transition-all animate-in fade-in zoom-in duration-500">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data} 
                                        dataKey="amount" 
                                        nameKey="category" 
                                        innerRadius={65} 
                                        outerRadius={85} 
                                        paddingAngle={8}
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontFamily: 'Kanit' }}
                                        formatter={(value) => [`฿${value.toLocaleString()}`, 'ยอดรวม']} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-tight">
                                    {period === 'month' ? (selectedMonth === '' ? `ปี ${selectedYear + 543}` : months.find(m => m.val === selectedMonth)?.name) : period === 'year' ? `ปี ${selectedYear + 543}` : 'วันนี้'}
                                </p>
                                <p className="text-2xl font-black text-gray-700">฿{total.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-2">แยกตามหมวดหมู่</h3>
                            {data.map((item, index) => (
                                <div key={item.category} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">{item.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-700 tracking-tight">฿{item.amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">
                                            {total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : !loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">
                        <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 shadow-inner">
                            <Inbox size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">ไม่พบข้อมูล</h3>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">กำลังรวบรวมข้อมูล...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;