import { useEffect, useState } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Tag, PlusCircle, Wallet, Landmark, Check, Calendar, MessageSquare, Filter, X, Download, Camera, Image as ImageIcon, Loader2, ArrowRightLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import imageCompression from 'browser-image-compression'; 
import heic2any from 'heic2any'; 
import Swal from 'sweetalert2';

const Transaction = () => {
    const getLocalDatetime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
        return localISOTime;
    };

    const [accounts, setAccounts] = useState([]);
    const [history, setHistory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [transactionDate, setTransactionDate] = useState(getLocalDatetime());

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [filterCategory, setFilterCategory] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const [form, setForm] = useState({ 
        account_id: '', 
        to_account_id: '', // เพิ่มฟิลด์บัญชีปลายทาง
        amount: '', 
        type: 'expense', 
        category: '', 
        note: '',     
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const defaultAccId = localStorage.getItem('default_account_id');
        if (defaultAccId) {
            setForm(prev => ({ ...prev, account_id: Number(defaultAccId) }));
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMonth, filterCategory]);

    const fetchData = async () => {
        try {
            const [accRes, transRes, catRes] = await Promise.all([
                api.get('/accounts'),
                api.get('/transactions'),
                api.get('/categories')
            ]);
            setAccounts(accRes.data);
            setHistory(transRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Data fetching failed");
        }
    };

    const showDetail = (item) => {
        const imageUrl = item.image || null; 
        const account = accounts.find(a => a.id === item.account_id);
        const toAccount = item.to_account_id ? accounts.find(a => a.id === item.to_account_id) : null;
        
        Swal.fire({
            title: `<span class="font-kanit text-lg uppercase font-black">${item.type === 'transfer' ? 'โอนเงินระหว่างบัญชี' : item.category}</span>`,
            html: `
                <div class="font-kanit text-left space-y-2 p-2">
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-400 font-bold text-xs uppercase">ยอดเงิน</span>
                        <span class="font-black ${item.type === 'expense' ? 'text-red-500' : item.type === 'income' ? 'text-green-500' : 'text-indigo-500'}">
                            ${item.type === 'expense' ? '-' : item.type === 'income' ? '+' : ''} ฿${Number(item.amount).toLocaleString()}
                        </span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-400 font-bold text-xs uppercase">${item.type === 'transfer' ? 'จากบัญชี' : 'ใช้บัญชี'}</span>
                        <span class="font-bold text-indigo-600">${account?.name || 'ทั่วไป'}</span>
                    </div>
                    ${item.type === 'transfer' ? `
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-400 font-bold text-xs uppercase">ไปบัญชี</span>
                        <span class="font-bold text-green-600">${toAccount?.name || '-'}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-400 font-bold text-xs uppercase">บันทึก</span>
                        <span class="font-bold text-gray-700">${item.note || '-'}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-400 font-bold text-xs uppercase">วันที่</span>
                        <span class="font-bold text-gray-600">${new Date(item.date).toLocaleString('th-TH')} น.</span>
                    </div>
                    ${imageUrl ? `
                        <div class="mt-4 rounded-xl overflow-hidden border shadow-inner bg-gray-50">
                            <p class="text-[9px] font-black text-gray-300 p-2 uppercase tracking-widest text-center">หลักฐาน</p>
                            <img src="${imageUrl}" class="w-full h-auto max-h-[300px] object-contain cursor-zoom-in" onclick="window.open('${imageUrl}', '_blank')" />
                        </div>
                    ` : ''}
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            borderRadius: '25px',
            width: '350px'
        });
    };

    const handleImageChange = async (e) => {
        let file = e.target.files[0];
        if (file) {
            Swal.fire({
                title: 'กำลังประมวลผลรูปภาพ...',
                text: 'รอสักครู่ครับพี่อรรถพล กำลังเตรียมรูปให้พร้อม',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.8
                    });
                    file = new File([convertedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });
                }

                const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1024, useWebWorker: true };
                const compressedFile = await imageCompression(file, options);
                setSelectedImage(compressedFile);
                setPreviewUrl(URL.createObjectURL(compressedFile));
                Swal.close(); 
            } catch (error) {
                console.error("Image processing error:", error);
                Swal.fire('ผิดพลาด', 'ไม่สามารถอ่านไฟล์ภาพนี้ได้ครับพี่ ลองใหม่อีกครั้งนะ', 'error');
            }
        }
    };

    const getSortedCategories = (cats) => {
        const counts = history.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {});
        return [...cats].sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0));
    };

    const filteredHistory = history.filter(item => {
        const itemMonth = new Date(item.date).toISOString().slice(0, 7);
        const matchMonth = itemMonth === selectedMonth;
        const matchCategory = filterCategory === '' || item.category === filterCategory;
        return matchMonth && matchCategory;
    });

    const sortedFilteredHistory = [...filteredHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalPages = Math.ceil(sortedFilteredHistory.length / itemsPerPage);
    const currentItems = sortedFilteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.account_id) {
            Swal.fire({ icon: 'warning', title: 'กรุณาเลือกบัญชี', text: 'พี่ต้องเลือกบัญชีต้นทางก่อนนะครับ', confirmButtonColor: '#6366f1', fontFamily: 'Kanit' });
            return;
        }

        if (form.type === 'transfer' && !form.to_account_id) {
            Swal.fire({ icon: 'warning', title: 'เลือกบัญชีปลายทาง', text: 'พี่จะโอนไปบัญชีไหนครับ เลือกหน่อยนะ', confirmButtonColor: '#6366f1', fontFamily: 'Kanit' });
            return;
        }

        if (form.type === 'transfer' && form.account_id === form.to_account_id) {
            Swal.fire({ icon: 'warning', title: 'บัญชีซ้ำกัน', text: 'โอนเข้าบัญชีเดิมไม่ได้นะครับพี่โอ๊ต', confirmButtonColor: '#6366f1', fontFamily: 'Kanit' });
            return;
        }

        const selectedAcc = accounts.find(a => a.id === Number(form.account_id));
        const amount = Number(form.amount);

        if ((form.type === 'expense' || form.type === 'transfer') && selectedAcc && selectedAcc.balance < amount) {
            const confirmResult = await Swal.fire({
                title: 'เฮ้ย! ยอดเงินจะติดลบนะ',
                text: `บัญชี "${selectedAcc.name}" มีเงินแค่ ฿${selectedAcc.balance.toLocaleString()} ยืนยันจะทำรายการต่อไหมครับ?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#6366f1',
                cancelButtonColor: '#9ca3af',
                confirmButtonText: 'ยืนยัน บันทึกต่อไป',
                cancelButtonText: 'เช็คอีกรอบ',
                borderRadius: '20px',
                fontFamily: 'Kanit'
            });
            if (!confirmResult.isConfirmed) return;
        }

        setIsUploading(true);
        Swal.fire({
            title: 'กำลังบันทึกข้อมูล...',
            text: 'รอสักครู่ครับพี่อรรถพล กำลังจัดการธุรกรรมให้',
            allowOutsideClick: false,
            borderRadius: '20px',
            didOpen: () => { Swal.showLoading(); }
        });

        const formData = new FormData();
        formData.append('account_id', form.account_id);
        if (form.type === 'transfer') formData.append('to_account_id', form.to_account_id);
        formData.append('amount', form.amount);
        formData.append('type', form.type);
        formData.append('category', form.type === 'transfer' ? 'โอนเงิน' : (form.category || "ทั่วไป"));
        formData.append('note', form.note || "");
        formData.append('date', new Date(transactionDate).toISOString());
        
        if (selectedImage) {
            formData.append('image', selectedImage); 
        }

        try {
            await api.post('/transactions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            
            Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ!',
                text: 'รายการถูกบันทึกลงระบบแล้วครับพี่',
                showConfirmButton: false,
                timer: 1500,
                borderRadius: '20px',
                fontFamily: 'Kanit'
            });

            localStorage.setItem('default_account_id', form.account_id);
            fetchData(); 
            setForm(prev => ({ ...prev, amount: '', category: '', note: '', to_account_id: '' })); 
            setTransactionDate(getLocalDatetime());
            setSelectedImage(null);
            setPreviewUrl(null);
            setCurrentPage(1); 

        } catch (err) { 
            Swal.fire({
                icon: 'error',
                title: 'บันทึกไม่สำเร็จ',
                text: 'เกิดข้อผิดพลาดจากระบบหลังบ้านครับพี่ชาย',
                confirmButtonColor: '#6366f1',
                fontFamily: 'Kanit'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCatName) return;
        try {
            const res = await api.post('/categories', { name: newCatName, type: form.type });
            setCategories([...categories, res.data]);
            setNewCatName('');
        } catch (err) {
            alert("เพิ่มหมวดหมู่ไม่สำเร็จ");
        }
    };

    const toggleCategory = (catName) => {
        setForm(prev => ({ ...prev, category: prev.category === catName ? '' : catName }));
    };

    const handleExport = () => {
        if (filteredHistory.length === 0) {
            alert("ไม่มีข้อมูลที่จะ Export ครับพี่ชาย");
            return;
        }
        const sortedForCalc = [...filteredHistory].sort((a, b) => new Date(a.date) - new Date(a.date));
        let runningBalance = 0;
        const exportData = sortedForCalc.map(item => {
            const isIncome = item.type === 'income';
            const isTransfer = item.type === 'transfer';
            const incomeAmount = isIncome ? item.amount : 0;
            const expenseAmount = (item.type === 'expense') ? item.amount : 0;
            
            if (!isTransfer) runningBalance += (incomeAmount - expenseAmount);
            
            const account = accounts.find(a => a.id === item.account_id);
            const toAcc = item.to_account_id ? accounts.find(a => a.id === item.to_account_id) : null;

            return {
                "วันที่": new Date(item.date).toLocaleDateString('th-TH'),
                "ประเภท": item.type === 'transfer' ? 'โอนเงิน' : (item.type === 'income' ? 'รายรับ' : 'รายจ่าย'),
                "รายการ": isTransfer ? `โอนจาก ${account?.name} ไป ${toAcc?.name}` : `${item.category}${item.note ? ' (' + item.note + ')' : ''}`,
                "บัญชี": account?.name || '-',
                "รายรับ": incomeAmount || "",
                "รายจ่าย": expenseAmount || "",
                "โอนย้าย": isTransfer ? item.amount : ""
            };
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ตารางบัญชี");
        XLSX.writeFile(wb, `ตารางบัญชี_${selectedMonth}.xlsx`);
    };

    const popularFilterCats = [...new Set(history.map(h => h.category))]
        .filter(Boolean)
        .sort((a, b) => {
            const countA = history.filter(h => h.category === a).length;
            const countB = history.filter(h => h.category === b).length;
            return countB - countA;
        });

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#444] overflow-hidden flex flex-col relative font-kanit">
            <div className="bg-white px-6 py-2.5 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 transition-colors">
                    <ChevronLeft size={22} />
                </button>
                <h2 className="text-sm font-bold tracking-tight text-gray-700 uppercase">บันทึกรายการ</h2>
                <div className="w-6"></div>
            </div>

            {accounts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-2 shadow-inner">
                        <Wallet size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">ยังไม่มีบัญชีเลยพี่!</h2>
                        <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">
                            ระบบไม่รู้จะเอาเงินไปเก็บไว้หรือหักออกจากกระเป๋าไหนครับ<br/>
                            รบกวนพี่ไปสร้างบัญชีกระเป๋าตังค์ใบแรกก่อนนะ
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/account')} 
                        className="mt-4 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <PlusCircle size={16} /> 
                        ไปสร้างบัญชีกันเลย
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-3 overflow-y-auto pb-24 font-kanit">
                    
                    <div className="flex bg-gray-100 p-0.5 rounded-lg gap-0.5">
                        <button type="button" onClick={() => setForm({...form, type: 'expense', category: '', note: ''})}
                            className={`flex-1 py-2 rounded-md text-[11px] font-bold transition-all ${form.type === 'expense' ? 'bg-red-500 text-white shadow-sm border-2 border-red-600 scale-[1.01]' : 'text-gray-400'}`}>
                            รายจ่าย
                        </button>
                        <button 
                            type="button" 
                                onClick={() => setForm({...form, type: 'transfer', category: 'โอนเงิน', note: ''})}
                                className={`flex-1 py-2 rounded-md text-[11px] font-bold transition-all ${form.type === 'transfer' ? 'bg-indigo-600 text-white shadow-sm border-2 border-indigo-700 scale-[1.01]' : 'text-gray-400'}`}
                            >
                            โอนเงิน <span className="text-[9px] font-normal">(ย้ายบัญชี)</span>
                        </button>
                        <button type="button" onClick={() => setForm({...form, type: 'income', category: '', note: ''})}
                            className={`flex-1 py-2 rounded-md text-[11px] font-bold transition-all ${form.type === 'income' ? 'bg-green-600 text-white shadow-sm border-2 border-green-700 scale-[1.01]' : 'text-gray-400'}`}>
                            รายรับ
                        </button>
                    </div>

                    <div className="bg-white px-4 py-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">จำนวนเงิน</p>
                        <div className={`flex items-center justify-center border-b pb-1 transition-colors ${form.type === 'expense' ? 'border-red-100 focus-within:border-red-500' : form.type === 'transfer' ? 'border-indigo-100 focus-within:border-indigo-500' : 'border-green-100 focus-within:border-green-500'}`}>
                            <span className={`text-xl font-black mr-2 ${form.type === 'expense' ? 'text-red-500' : form.type === 'transfer' ? 'text-indigo-600' : 'text-green-600'}`}>฿</span>
                            <input type="number" placeholder="0.00" className={`text-3xl font-black w-full max-w-[160px] text-center bg-transparent outline-none ${form.type === 'expense' ? 'text-red-500' : form.type === 'transfer' ? 'text-indigo-600' : 'text-green-600'}`} onChange={e => setForm({...form, amount: e.target.value})} value={form.amount} required />
                        </div>
                    </div>

                    {form.type !== 'transfer' && (
                        <div className="space-y-1">
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <div className="flex-shrink-0 flex items-center gap-1.5 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-2.5 py-1.5">
                                    <input type="text" placeholder="เพิ่ม..." className="bg-transparent text-[10px] outline-none w-10 font-bold" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                                    <button type="button" onClick={handleAddCategory} className="text-indigo-600"><PlusCircle size={12} /></button>
                                </div>
                                {getSortedCategories(categories.filter(c => c.type === (form.type === 'transfer' ? 'expense' : form.type))).map(cat => (
                                    <button key={cat.id} type="button" onClick={() => toggleCategory(cat.name)} 
                                        className={`flex-shrink-0 px-4 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${form.category === cat.name ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-100 bg-white text-gray-500'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm">
                            <MessageSquare size={14} className="text-gray-300" />
                            <input type="text" placeholder="บันทึก..." className="flex-1 bg-transparent border-none text-[11px] font-medium outline-none text-gray-600" onChange={e => setForm({...form, note: e.target.value})} value={form.note} />
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm">
                            <Calendar size={14} className="text-gray-300" />
                            <input type="datetime-local" className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none text-gray-600" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-gray-300 p-2 rounded-lg hover:bg-indigo-50 cursor-pointer text-gray-400 transition-all">
                            <Camera size={14} />
                            <span className="text-[10px] font-bold">ถ่ายรูป หรือ เลือกสลิป</span>
                            <input 
                                type="file" 
                                accept="image/*,.heic" 
                                className="hidden" 
                                onChange={handleImageChange} 
                            />
                        </label>
                        {previewUrl && (
                            <div className="relative w-10 h-10 shrink-0">
                                <img src={previewUrl} className="w-full h-full object-cover rounded-lg border border-indigo-100 shadow-sm" />
                                <button type="button" onClick={() => {setPreviewUrl(null); setSelectedImage(null);}} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                                    <X size={8}/>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                            {form.type === 'transfer' ? 'จากบัญชีต้นทาง' : 'ใช้บัญชี'}
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {accounts
                                .filter(acc => acc.is_active) 
                                .sort((a, b) => (a.id === Number(form.account_id) ? -1 : 1))
                                .map(acc => (
                                    <button key={acc.id} type="button" onClick={() => setForm({...form, account_id: acc.id})}
                                        className={`flex-shrink-0 min-w-[100px] p-2 rounded-lg border text-center transition-all relative ${form.account_id === acc.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-100 bg-white'}`}>
                                        <div className="flex items-center justify-center gap-2">
                                            {acc.type.toLowerCase() === 'cash' ? <Wallet size={14} className="text-orange-400"/> : <Landmark size={14} className="text-blue-400"/>}
                                            <span className="text-[10px] font-bold truncate">{acc.name}</span>
                                        </div>
                                        {form.account_id === acc.id && (<div className="absolute top-1 right-1"><Check size={10} className="text-indigo-600 font-bold" /></div>)}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {form.type === 'transfer' && (
                        <div className="space-y-2 animate-in slide-in-from-left duration-300">
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest pl-1">โอนไปยังบัญชี</p>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {accounts
                                    .filter(acc => acc.is_active && acc.id !== Number(form.account_id)) 
                                    .map(acc => (
                                        <button key={acc.id} type="button" onClick={() => setForm({...form, to_account_id: acc.id})}
                                            className={`flex-shrink-0 min-w-[100px] p-2 rounded-lg border text-center transition-all relative ${form.to_account_id === acc.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-100 bg-white'}`}>
                                            <div className="flex items-center justify-center gap-2">
                                                {acc.type.toLowerCase() === 'cash' ? <Wallet size={14} className="text-orange-400"/> : <Landmark size={14} className="text-blue-400"/>}
                                                <span className="text-[10px] font-bold truncate">{acc.name}</span>
                                            </div>
                                            {form.to_account_id === acc.id && (<div className="absolute top-1 right-1"><Check size={10} className="text-green-600 font-bold" /></div>)}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className={`w-full ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 active:scale-95'} text-white py-3.5 rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider`}
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                        {isUploading ? 'กำลังส่งข้อมูล...' : 'บันทึกรายการลงระบบ'}
                    </button>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <input type="month" className="text-[10px] font-bold text-gray-700 bg-gray-100 p-1.5 rounded-md outline-none border-none shadow-inner" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                            <div className="flex gap-2">
                                <button onClick={handleExport} type="button" className="p-2 rounded-md border border-green-100 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                    <Download size={14} />
                                </button>
                                <button onClick={() => setIsFilterOpen(true)} type="button" className={`p-2 rounded-md border transition-all flex items-center gap-1.5 shadow-sm ${filterCategory ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <Filter size={14} />
                                    {filterCategory && <span className="text-[10px] font-bold uppercase">{filterCategory}</span>}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden shadow-sm">
                            {currentItems.length > 0 ? currentItems.map((item) => {
                                const account = accounts.find(a => a.id === item.account_id);
                                const toAcc = item.to_account_id ? accounts.find(a => a.id === item.to_account_id) : null;
                                return (
                                    <div key={item.id} onClick={() => showDetail(item)} className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer active:bg-indigo-50/30">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1 h-1 rounded-full ${item.type === 'expense' ? 'bg-red-500' : item.type === 'income' ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-bold text-gray-800 text-xs leading-none uppercase">
                                                        {item.type === 'transfer' ? `โอนไปยัง ${toAcc?.name || '...'}` : (item.category || 'ทั่วไป')}
                                                    </p>
                                                    {item.image && <ImageIcon size={10} className="text-indigo-400 animate-pulse" />}
                                                    {item.type === 'transfer' && <ArrowRightLeft size={10} className="text-indigo-400" />}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5 opacity-70">
                                                    {account?.type.toLowerCase() === 'cash' ? <Wallet size={8} className="text-orange-400" /> : <Landmark size={8} className="text-blue-400" />}
                                                    <span className="text-[8px] font-black text-gray-500 uppercase">{account?.name || '-'}</span>
                                                </div>
                                                {item.note && <p className="text-[9px] text-gray-500 font-medium truncate max-w-[150px] mt-0.5">{item.note}</p>}
                                                <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">{new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} น.</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-xs ${item.type === 'expense' ? 'text-red-500' : item.type === 'income' ? 'text-green-600' : 'text-indigo-600'}`}>
                                            {item.type === 'expense' ? '-' : item.type === 'income' ? '+' : ''} ฿{Number(item.amount).toLocaleString()}
                                        </span>
                                    </div>
                                );
                            }) : ( <div className="p-8 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">ไม่มีข้อมูล</div> )}

                            {totalPages > 1 && (
                                <div className="flex justify-between items-center p-3 border-t border-gray-100 bg-gray-50/50">
                                    <button 
                                        type="button" 
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${currentPage === 1 ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 shadow-sm'}`}
                                    >
                                        <ChevronLeft size={14} /> ก่อนหน้า
                                    </button>
                                    
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        หน้า {currentPage} / {totalPages}
                                    </span>

                                    <button 
                                        type="button" 
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${currentPage === totalPages ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 shadow-sm'}`}
                                    >
                                        ถัดไป <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            )}

            {isFilterOpen && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm animate-in fade-in" onClick={() => setIsFilterOpen(false)} />
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-[70] p-5 shadow-2xl animate-in slide-in-from-bottom font-kanit">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">กรองหมวดหมู่</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="bg-gray-50 p-1.5 rounded-full text-gray-400 hover:text-gray-600"><X size={18}/></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => { setFilterCategory(''); setIsFilterOpen(false); }}
                                className={`py-3 rounded-md text-[10px] font-bold uppercase transition-all ${filterCategory === '' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}>
                                ทั้งหมด
                            </button>
                            {popularFilterCats.map(cat => (
                                <button key={cat} onClick={() => { setFilterCategory(cat); setIsFilterOpen(false); }}
                                    className={`py-3 rounded-md text-[10px] font-bold uppercase truncate px-2 transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsFilterOpen(false)} className="w-full mt-6 py-4 bg-gray-900 text-white rounded-md font-bold text-xs uppercase tracking-widest shadow-lg">ปิดหน้าต่างกรอง</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Transaction;