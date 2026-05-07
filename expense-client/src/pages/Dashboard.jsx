import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, Landmark, Banknote, ChevronDown, ChevronUp, Clock, Plus, Target, BarChart3, CalendarDays, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2'; 

const Dashboard = () => {
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [monthlySummary, setMonthlySummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [showAccounts, setShowAccounts] = useState(false);
    
    // --- ระบบ MJ Overlay & Sound ---[cite: 2]
    const [showMJOverlay, setShowMJOverlay] = useState(false);
    const audioRef = useRef(new Audio('/billie-jean-intro.mp3')); // เรียกไฟล์จาก public[cite: 2]

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const currentMonth = new Date().getMonth() + 1; 
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const months = [
        { val: 1, name: 'มกราคม' }, { val: 2, name: 'กุมภาพันธ์' }, { val: 3, name: 'มีนาคม' },
        { val: 4, name: 'เมษายน' }, { val: 5, name: 'พฤษภาคม' }, { val: 6, name: 'มิถุนายน' },
        { val: 7, name: 'กรกฎาคม' }, { val: 8, name: 'สิงหาคม' }, { val: 9, name: 'กันยายน' },
        { val: 10, name: 'ตุลาคม' }, { val: 11, name: 'พฤศจิกายน' }, { val: 12, name: 'ธันวาคม' }
    ];

    const [budget, setBudget] = useState(0);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState('');
    const [budgetUpdateCount, setBudgetUpdateCount] = useState(0); 
    const [chartData, setChartData] = useState([]); 
    
    const navigate = useNavigate();

    // จัดการการเล่นเพลงเมื่อ Overlay เปิด/ปิด[cite: 2]
    useEffect(() => {
        const audio = audioRef.current;
        if (showMJOverlay) {
            audio.loop = true; // วนลูปท่อนอินโทร[cite: 2]
            audio.currentTime = 0;
            audio.play().catch(err => console.log("Playback interaction required"));
        } else {
            audio.pause();
        }
        return () => audio.pause();
    }, [showMJOverlay]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentActualYear = new Date().getFullYear();
                /* ปรับปรุง: ใช้ api instance ที่ดึง URL จาก .env พอร์ต 5000 อัตโนมัติ[cite: 4, 5] */
                const [summaryRes, accountsRes, transRes, profileRes, statsRes, currentMonthRes] = await Promise.all([
                    api.get(`/summary?year=${selectedYear}`),
                    api.get('/accounts'),
                    api.get(`/transactions?limit=5`), 
                    api.get('/profile'),
                    api.get(`/stats/annual?year=${selectedYear}`),
                    api.get(`/summary?month=${selectedMonth}&year=${selectedYear}&period=month`)
                ]);
                
                setSummary(summaryRes.data);
                setMonthlySummary(currentMonthRes.data); 
                setAccounts(accountsRes.data);
                setTransactions(transRes.data);
                
                if (profileRes.data) {
                    setBudget(Number(profileRes.data.monthly_budget) || 0); 
                    setBudgetUpdateCount(profileRes.data.budget_update_count || 0); // ดึงค่าจริงจาก DB
                }

                if (selectedMonth === currentMonth && budget > 0 && currentMonthRes.data.expense > budget) {
                    Swal.fire({ icon: 'warning', title: 'เกินงบแล้วนะพี่!', confirmButtonColor: '#ef4444' });
                }

                setChartData(statsRes.data || []);
            } catch (err) {
                console.error('Error fetching data', err);
            }
        };
        fetchData();
    }, [selectedYear, selectedMonth, budget]); 

    const totalBalanceAcrossAccounts = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    const overBudget = monthlySummary.expense > budget;
    const remainingInBudget = budget - monthlySummary.expense;
    const budgetUsagePercent = budget > 0 ? Math.min((monthlySummary.expense / budget) * 100, 100) : 0;

    const handleUpdateBudget = async () => {
        // เช็คเงื่อนไขจากค่าจริงที่ได้จาก Backend
        if (budgetUpdateCount >= 2) {
            setShowMJOverlay(true); // เปิดรูป MJ และเพลงทันที[cite: 2]
            setIsEditingBudget(false);
            return;
        }

        try {
            /* ปรับปรุง: ยิงไปที่ Backend พอร์ต 5000 ผ่าน Interceptor[cite: 4, 5] */
            const res = await api.put('/user/budget', { budget: Number(tempBudget) });
            setBudget(Number(tempBudget));
            setBudgetUpdateCount(res.data.count); 
            setIsEditingBudget(false);
            
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: `บันทึกงบประมาณแล้ว (ใช้สิทธิ์ไปแล้ว ${res.data.count}/2 ครั้ง)`,
                showConfirmButton: false,
                timer: 2000,
                borderRadius: '20px'
            });
        } catch (err) {
            const errorMsg = err.response?.data?.error || "บันทึกเป้าหมายไม่สำเร็จ";
            if (err.response?.status === 403) {
                setShowMJOverlay(true); // ท่อนฮุคมาเลยพี่ชาย![cite: 2]
            } else {
                Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: errorMsg });
            }
            setIsEditingBudget(false);
        }
    };

    const cashTotal = accounts.filter(acc => acc.type.toLowerCase() === 'cash').reduce((sum, acc) => sum + Number(acc.balance), 0);
    const bankTotal = accounts.filter(acc => acc.type.toLowerCase() !== 'cash').reduce((sum, acc) => sum + Number(acc.balance), 0);
    const filteredTransactions = transactions.slice(0, 5);

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-24 text-[#444] font-kanit relative">
            
            {/* --- Billie Jean MJ Overlay Zone ---[cite: 2] */}
            {showMJOverlay && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-500">
                    <button onClick={() => setShowMJOverlay(false)} className="absolute top-10 right-6 text-white/30 hover:text-white transition-colors"><X size={32}/></button>
                    
                    <div className="relative mb-4">
                        <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <img 
                            src="/mj-dance.png" 
                            alt="MJ" 
                            className="w-72 h-auto drop-shadow-[0_0_35px_rgba(99,102,241,0.8)] animate-bounce relative z-10" 
                        />
                    </div>

                    <div className="text-center space-y-4 z-10">
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Hee-Hee!</h2>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-white uppercase">ปรับเป้าไม่ได้แล้วพี่!</p>
                            <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest">พี่ใช้สิทธิ์แก้ไขครบ 2 ครั้งของเดือนนี้แล้วครับ อ๊าว!!!</p>
                        </div>
                        <button 
                            onClick={() => setShowMJOverlay(false)} 
                            className="mt-10 bg-white text-black px-14 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-white/20 shadow-2xl active:scale-95 transition-all hover:bg-indigo-50"
                        >
                            โอเคครับกัปตัน
                        </button>
                    </div>
                </div>
            )}

            <header className="bg-white px-6 py-3 flex justify-between items-center sticky top-0 z-20 border-b border-gray-50/50 shadow-sm">
                <div className="text-left">
                    <p className="text-[7px] font-black text-indigo-500/50 uppercase tracking-widest leading-none">ยินดีต้อนรับ</p>
                    <h1 className="text-xs font-black text-gray-700 uppercase">สถิติการเงิน</h1>
                </div>
            </header>

            <div className="p-5 max-w-md mx-auto space-y-4">
                
                <div onClick={() => setShowAccounts(!showAccounts)} className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden border border-indigo-700 cursor-pointer active:scale-[0.98] transition-all">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider">ยอดเงินรวมทุกบัญชี</p>
                            {showAccounts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">฿{totalBalanceAcrossAccounts.toLocaleString()}</h2>
                    </div>
                    <Wallet size={60} className="text-white/10 absolute -right-2 -bottom-2 rotate-12" />
                </div>

                {showAccounts && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm font-kanit animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                            <div><p className="text-[9px] font-black text-gray-400 uppercase">เงินสดรวม</p><p className="text-xs font-black text-gray-700">฿{cashTotal.toLocaleString()}</p></div>
                            <div><p className="text-[9px] font-black text-gray-400 uppercase">เงินฝากรวม</p><p className="text-xs font-black text-gray-700">฿{bankTotal.toLocaleString()}</p></div>
                        </div>
                        <div className="space-y-2">
                            {accounts.map(acc => (
                                <div key={acc.id} className="flex items-center justify-between p-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded-lg ${acc.type.toLowerCase() === 'cash' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {acc.type.toLowerCase() === 'cash' ? <Banknote size={12} /> : <Landmark size={12} />}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-600">{acc.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-700">฿{Number(acc.balance).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">สรุปรายการรายเดือน</h3>
                        <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-[9px] font-black text-indigo-600 outline-none cursor-pointer appearance-none pr-1">
                                {months.map(m => (<option key={m.val} value={m.val}>{m.name}</option>))}
                            </select>
                            <ChevronDown size={8} className="text-indigo-400" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-50 pt-3">
                        <div onClick={() => navigate(`/report?type=income&month=${selectedMonth}`)} className="space-y-1 border-r border-gray-50 cursor-pointer active:bg-gray-50 transition-colors py-1 px-1 rounded-lg">
                            <p className="text-[8px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1">รายรับ <ArrowRight size={7} className="text-gray-300"/></p>
                            <p className="text-xs font-black text-green-500 flex items-center justify-center gap-1"><TrendingUp size={10} /> ฿{monthlySummary.income.toLocaleString()}</p>
                        </div>
                        <div onClick={() => navigate(`/report?type=expense&month=${selectedMonth}`)} className="space-y-1 border-r border-gray-50 cursor-pointer active:bg-gray-50 transition-colors py-1 px-1 rounded-lg">
                            <p className="text-[8px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1">รายจ่าย <ArrowRight size={7} className="text-gray-300"/></p>
                            <p className="text-xs font-black text-red-500 flex items-center justify-center gap-1"><TrendingDown size={10} /> ฿{monthlySummary.expense.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 py-1 px-1">
                            <p className="text-[8px] font-bold text-gray-400 uppercase">คงเหลือ</p>
                            <p className="text-xs font-black text-indigo-600">฿{(monthlySummary.income - monthlySummary.expense).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-indigo-500" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ขีดจำกัดการใช้เงินเดือนนี้(2ครั้ง)</h3>
                        </div>
                        <button onClick={() => { setIsEditingBudget(!isEditingBudget); setTempBudget(budget); }} className="text-[9px] text-indigo-500 font-black uppercase">
                            {isEditingBudget ? 'ยกเลิก' : 'ตั้งค่า'}
                        </button>
                    </div>

                    {isEditingBudget ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input type="number" className="flex-1 border-b-2 border-indigo-100 focus:border-indigo-500 outline-none px-1 py-0.5 font-black text-gray-700 text-sm" value={tempBudget} onChange={(e) => setTempBudget(e.target.value)} autoFocus />
                                <button onClick={handleUpdateBudget} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-md active:scale-95 transition-all">บันทึก</button>
                            </div>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">* แก้ไขได้อีก {2 - budgetUpdateCount} ครั้งในเดือนนี้</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <div><p className="text-lg font-black text-gray-700 leading-none">฿{budget.toLocaleString()}</p></div>
                                <div className="text-right">
                                    <p className={`text-[10px] font-black ${overBudget ? 'text-red-500' : 'text-green-600'}`}>
                                        {overBudget ? `เกินงบ ฿${Math.abs(remainingInBudget).toLocaleString()}` : `ใช้ได้อีก ฿${remainingInBudget.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-700 ease-out ${overBudget ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${budgetUsagePercent}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2"><BarChart3 size={16} className="text-indigo-500" /><h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">แนวโน้มเงินเก็บ</h3></div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            <CalendarDays size={10} className="text-indigo-500" />
                            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent text-[9px] font-black text-gray-600 outline-none cursor-pointer">
                                {years.map(y => (<option key={y} value={y}>พ.ศ. {y + 543}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="w-full" style={{ height: '180px' }}> 
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs><linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontWeight: 'bold' }} padding={{ left: 15, right: 15 }} />
                                <YAxis hide={true} domain={['dataMin - 1000', 'dataMax + 1000']} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '10px', fontFamily: 'Kanit' }} formatter={(value) => [`฿${value.toLocaleString()}`, 'เงินเก็บ']} />
                                <Area type="monotone" dataKey="savings" stroke="#6366f1" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={3} dot={{ r: 3, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => navigate('/transaction')} className="w-full bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group active:bg-gray-50 transition-all shadow-sm">
                        <div className="flex items-center gap-3"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Plus size={18} /></div><span className="text-sm font-black text-gray-600">บันทึกรายรับ-รายจ่าย</span></div>
                        <ArrowRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b border-gray-50">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">รายการล่าสุด</h3>
                            <button onClick={() => navigate('/transaction')} className="text-[9px] font-black text-indigo-500 uppercase">ดูทั้งหมด</button>
                        </div>
                        {transactions.length > 0 ? (
                            transactions.slice(0, 5).map(item => {
                                const account = accounts.find(a => a.id === item.account_id);
                                return (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${item.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}><Clock size={16} /></div>
                                            <div>
                                                <p className="text-sm font-black text-gray-700 leading-tight">{item.category || 'ทั่วไป'}</p>
                                                <div className="flex items-center gap-1 mt-0.5 opacity-60">
                                                    {account?.type.toLowerCase() === 'cash' ? <Wallet size={8} className="text-orange-400" /> : <Landmark size={12} className="text-blue-400" />}
                                                    <span className="text-[8px] font-black text-gray-500 uppercase">{account?.name || '-'}</span>
                                                </div>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">{new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} {new Date(item.date).getFullYear() + 543}</p>
                                            </div>
                                        </div>
                                        <p className={`text-sm font-black ${item.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>{item.type === 'expense' ? '-' : '+'} ฿{Number(item.amount).toLocaleString()}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center"><p className="text-xs text-gray-400 font-medium font-kanit">ไม่มีรายการ</p></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;