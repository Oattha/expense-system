import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ChevronLeft, Plus, Landmark, Banknote, Star, MoreVertical, Edit2, Power, X, Archive, RotateCcw, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// 🚨 นำเข้า useFontSize เพื่อใช้อ่านค่าขนาดอักษรจากส่วนกลางของเว็บ
import { useFontSize } from '../contexts/FontSizeContext';

const Account = () => {
    const [accounts, setAccounts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAcc, setEditingAcc] = useState(null); 
    const [newAcc, setNewAcc] = useState({ name: '', type: '', balance: '' });
    const [defaultId, setDefaultId] = useState(localStorage.getItem('default_account_id'));
    const navigate = useNavigate();

    // 🚨 เรียกใช้งานฟังก์ชันดึงคลาสขนาดฟอนต์ส่วนกลาง
    const { fontSize, getCls } = useFontSize();

    // รายชื่อธนาคารในไทยสำหรับการเลือกด่วน
    const thaiBanks = [
        { id: 'kbank', name: 'กสิกรไทย (KBANK)', color: 'bg-green-600' },
        { id: 'scb', name: 'ไทยพาณิชย์ (SCB)', color: 'bg-purple-600' },
        { id: 'bbl', name: 'กรุงเทพ (BBL)', color: 'bg-blue-800' },
        { id: 'ktb', name: 'กรุงไทย (KTB)', color: 'bg-blue-400' },
        { id: 'gsb', name: 'ออมสิน (GSB)', color: 'bg-pink-500' },
        { id: 'bay', name: 'กรุงศรี (BAY)', color: 'bg-yellow-500' },
        { id: 'ttb', name: 'ทีทีบี (TTB)', color: 'bg-blue-600' },
        { id: 'tmani', name: 'ทรูมันนี่ (TrueMoney)', color: 'bg-orange-500' },
    ];

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/accounts');
            setAccounts(res.data);
        } catch (err) {
            console.error('Error fetching accounts', err);
        }
    };

    useEffect(() => { fetchAccounts(); }, []);

    const handleSetDefault = async (id) => {
        try {
            await api.put('/accounts/default', { account_id: id });
            localStorage.setItem('default_account_id', id);
            setDefaultId(id.toString());
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            Toast.fire({ icon: 'success', title: 'ตั้งเป็นบัญชีหลักแล้ว' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'ไม่สามารถตั้งค่าเริ่มต้นได้' });
        }
    };

    const handleToggleActive = async (acc) => {
        const result = await Swal.fire({
            title: acc.is_active ? 'ปิดใช้งานบัญชี?' : 'เปิดใช้งานบัญชี?',
            text: acc.is_active 
                ? "บัญชีนี้จะไม่โชว์ให้เลือกตอนบันทึกรายการใหม่" 
                : "ต้องการกลับมาใช้งานบัญชีนี้อีกครั้งใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: acc.is_active ? '#ef4444' : '#6366f1',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            borderRadius: '20px',
            fontFamily: 'Kanit'
        });

        if (result.isConfirmed) {
            try {
                await api.put(`/accounts/${acc.id}`, {
                    name: acc.name,
                    is_active: !acc.is_active
                });
                fetchAccounts();
                Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินการเรียบร้อย',
                    showConfirmButton: false,
                    timer: 1500,
                    borderRadius: '20px'
                });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถดำเนินการได้' });
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/accounts/${editingAcc.id}`, {
                name: editingAcc.name,
                balance: Number(editingAcc.balance)
            });
            setEditingAcc(null);
            fetchAccounts();
            Swal.fire({ icon: 'success', title: 'แก้ไขสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'แก้ไขข้อมูลไม่สำเร็จ' });
        }
    };

    const renderAccountList = (typeLabel, filterFn, isArchived = false) => {
        const filtered = accounts.filter(filterFn);
        if (filtered.length === 0) return null;

        return (
            <div className={`space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-kanit ${isArchived ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className="flex items-center gap-2 px-1 mb-2">
                    <div className={`w-1 h-3 rounded-full ${isArchived ? 'bg-gray-400' : 'bg-indigo-500'}`}></div>
                    {/* เปลี่ยนมาใช้ getCls('sub') เพื่อปรับสเกลหัวข้อย่อย */}
                    <h3 className={`${getCls('sub')} font-black text-gray-400 uppercase tracking-widest`}>{typeLabel}</h3>
                </div>
                {filtered.map(acc => {
                    const isDefault = defaultId === acc.id.toString();
                    return (
                        <div key={acc.id} className={`bg-white p-4 rounded-xl flex items-center justify-between border transition-all ${isDefault ? 'border-indigo-500 ring-1 ring-indigo-100 shadow-md' : 'border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${acc.type === 'Cash' ? 'bg-orange-500' : ThaiBankColor(acc.name)}`}>
                                    {acc.type === 'Cash' ? <Banknote size={18} /> : <Landmark size={18} />}
                                </div>
                                <div onClick={() => !isArchived && handleSetDefault(acc.id)} className={isArchived ? 'cursor-default' : 'cursor-pointer'}>
                                    {/* ปรับสเกลชื่อกระเป๋าเงินตามขนาดที่กดเลือกส่วนกลาง */}
                                    <p className={`font-black text-gray-700 leading-tight flex items-center gap-1 uppercase ${getCls('normal')}`}>
                                        {acc.name}
                                        {isDefault && <Star size={10} className="fill-yellow-400 text-yellow-400" />}
                                    </p>
                                    <p className={`font-bold text-gray-400 uppercase mt-0.5 ${getCls('sub')}`}>
                                        {acc.type === 'Savings' ? 'บัญชีธนาคาร' : 'เงินสด'} {isDefault && <span className="text-indigo-500 font-black ml-1">• หลัก</span>}
                                        {isArchived && <span className="text-red-400 font-black ml-1">• ปิดใช้งานแล้ว</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* ปรับสเกลยอดเงินตามขนาดส่วนกลาง */}
                                <p className={`font-black text-gray-500 mr-1 tracking-tight ${getCls('normal')}`}>฿{acc.balance.toLocaleString()}</p>
                                {isArchived ? (
                                    <button onClick={() => handleToggleActive(acc)} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-green-50 hover:text-green-600 transition-all shadow-sm">
                                        <RotateCcw size={16} />
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => handleSetDefault(acc.id)} className={`p-1.5 rounded-full transition-all ${isDefault ? 'text-yellow-400 bg-yellow-50' : 'text-gray-200 hover:text-yellow-400 hover:bg-gray-50'}`}>
                                            <Star size={16} className={isDefault ? 'fill-current' : ''} />
                                        </button>
                                        <button onClick={() => setEditingAcc(acc)} className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all">
                                            <MoreVertical size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const ThaiBankColor = (name) => {
        const bank = thaiBanks.find(b => name.includes(b.name.split(' ')[0]));
        return bank ? bank.color : 'bg-gray-400';
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-24 text-[#444] font-kanit">
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                {/* ส่วนหัวหน้าจอปรับขนาดตามภาพรวมหลัก */}
                <h2 className={`font-black tracking-tight text-gray-700 uppercase ${getCls('sub')}`}>จัดการกระเป๋าเงิน</h2>
                <button 
                    onClick={() => { setShowAddForm(!showAddForm); setEditingAcc(null); }}
                    className={`bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-black uppercase hover:bg-indigo-700 active:scale-90 transition-all ${getCls('sub')}`}
                >
                    {showAddForm ? 'ปิด' : 'เพิ่มใหม่'}
                </button>
            </div>

            <div className="p-5 max-w-md mx-auto">
                {showAddForm && (
                    <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50/50 mb-8 animate-in zoom-in-95 duration-300">
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await api.post('/accounts', { ...newAcc, balance: Number(newAcc.balance) });
                                setNewAcc({ name: '', type: '', balance: '' });
                                setShowAddForm(false);
                                fetchAccounts();
                                Swal.fire({ icon: 'success', title: 'เพิ่มบัญชีเรียบร้อย', timer: 1500, showConfirmButton: false });
                            } catch (err) { Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'เพิ่มไม่สำเร็จ' }); }
                        }} className="space-y-4">
                            
                            <div className="grid grid-cols-2 gap-3">
                                <select 
                                    className={`w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none font-bold text-gray-600 focus:ring-2 ring-indigo-50 transition-all ${getCls('sub')}`} 
                                    value={newAcc.type} 
                                    onChange={e => setNewAcc({ ...newAcc, type: e.target.value, name: '' })} 
                                    required
                                >
                                    <option value="">ประเภท...</option>
                                    <option value="Savings">บัญชีธนาคาร</option>
                                    <option value="Cash">เงินสด / กระเป๋าตัง</option>
                                </select>
                                <input type="number" placeholder="ยอดเงินเริ่มต้น" className={`w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none font-bold focus:ring-2 ring-indigo-50 transition-all ${getCls('sub')}`} value={newAcc.balance} onChange={e => setNewAcc({...newAcc, balance: e.target.value})} required />
                            </div>

                            {newAcc.type === 'Savings' && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                                    <p className={`font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 ${getCls('sub')}`}>เลือกธนาคารของคุณ</p>
                                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                                        {thaiBanks.map(bank => (
                                            <button 
                                                key={bank.id}
                                                type="button"
                                                onClick={() => setNewAcc({ ...newAcc, name: bank.name })}
                                                className={`flex-shrink-0 px-4 py-2 rounded-xl border font-black transition-all flex items-center gap-2 ${getCls('sub')} ${newAcc.name === bank.name ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${bank.color}`}></div>
                                                {bank.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder={newAcc.type === 'Cash' ? "เช่น กระเป๋าตังหลัก, เงินซ่อนเมีย..." : "หรือระบุชื่อบัญชีเอง..."}
                                    className={`w-full border border-gray-100 p-4 rounded-2xl font-black text-gray-700 focus:ring-2 ring-indigo-50 transition-all ${getCls('sub')}`} 
                                    value={newAcc.name} 
                                    onChange={e => setNewAcc({...newAcc, name: e.target.value})} 
                                    required 
                                />
                                {newAcc.name && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500"><Check size={16} /></div>}
                            </div>
                            
                            <button type="submit" className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 uppercase tracking-widest active:scale-95 transition-all ${getCls('normal')}`}>
                                ยืนยันการเพิ่มบัญชี
                            </button>
                        </form>
                    </div>
                )}

                {editingAcc && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
                        <form onSubmit={handleUpdate} className="bg-white w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`font-black text-gray-800 uppercase tracking-widest ${getCls('normal')}`}>แก้ไขข้อมูลบัญชี</h3>
                                <button type="button" onClick={() => setEditingAcc(null)} className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className={`font-black text-gray-400 uppercase tracking-[0.2em] ml-1 ${getCls('sub')}`}>ชื่อบัญชี</label>
                                    <input type="text" className={`w-full border border-gray-100 p-4 rounded-2xl font-black text-gray-700 outline-none focus:ring-2 ring-indigo-100 transition-all ${getCls('normal')}`} value={editingAcc.name} onChange={e => setEditingAcc({...editingAcc, name: e.target.value})} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`font-black text-gray-400 uppercase tracking-[0.2em] ml-1 ${getCls('sub')}`}>ยอดเงินคงเหลือ (ล็อค)</label>
                                    <input type="text" className={`w-full border border-gray-50 p-4 rounded-2xl font-black text-gray-300 bg-gray-50 cursor-not-allowed outline-none ${getCls('normal')}`} value={Number(editingAcc.balance).toLocaleString()} readOnly />
                                    <p className={`text-orange-400 font-bold px-1 leading-relaxed uppercase tracking-tighter ${getCls('sub')}`}>* โปรดบันทึกรายรับ/รายจ่ายเพื่อปรับยอดเงินให้ถูกต้อง</p>
                                </div>
                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    <button type="submit" className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all ${getCls('normal')}`}>บันทึกการเปลี่ยนชื่อบัญชี</button>
                                    <button type="button" onClick={() => { handleToggleActive(editingAcc); setEditingAcc(null); }} className={`w-full bg-red-50 text-red-600 py-3 rounded-2xl font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all ${getCls('sub')}`}>
                                        ปิดใช้งานบัญชีนี้
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {accounts.length > 0 ? (
                    <>
                        {renderAccountList("กระเป๋าเงินสด / เป๋าตัง", (acc) => acc.type === 'Cash' && acc.is_active)}
                        {renderAccountList("บัญชีธนาคาร / บัตร", (acc) => acc.type === 'Savings' && acc.is_active)}
                        {accounts.some(acc => !acc.is_active) && (
                            <div className="mt-10 pt-10 border-t border-dashed border-gray-200">
                                {renderAccountList("บัญชีที่ปิดใช้งานแล้ว (Archive)", (acc) => !acc.is_active, true)}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                        <div className="bg-gray-50 p-8 rounded-[3rem] mb-6 shadow-inner"><Landmark size={48} className="text-gray-200" /></div>
                        <h3 className={`font-black text-gray-400 uppercase tracking-[0.2em] ${getCls('normal')}`}>ยังไม่มีกระเป๋าเงิน</h3>
                        <p className={`text-gray-400 mt-2 font-bold uppercase tracking-widest leading-loose ${getCls('sub')}`}>กดปุ่ม <span className="text-indigo-500">"เพิ่มใหม่"</span> ด้านบน<br/>เพื่อเริ่มจัดการเงินครับ</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Account;