import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
  Landmark,
  Banknote,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Target,
  BarChart3,
  CalendarDays,
  X,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Swal from "sweetalert2";

// 🚨 นำเข้า useFontSize จาก Context
import { useFontSize } from "../contexts/FontSizeContext";

const Dashboard = () => {
  // 🚨 [เพิ่มใหม่] ฟังก์ชันคำนวณเดือนและปีให้ตรงกับรอบบิลจริง
  const getInitialCycleDate = () => {
    const date = new Date();
    let m = date.getMonth() + 1;
    let y = date.getFullYear();
    const d = date.getDate();

    // ดึงรอบบิลจากเครื่อง (ถ้าไม่มีให้เป็นวันที่ 1)
    const cycle = Number(localStorage.getItem("user_cycle_date")) || 1;

    // ถ้าวันนี้เลยวันตัดรอบมาแล้ว ให้ขยับเดือนไปข้างหน้า 1 เดือน (เพื่อแสดงรอบบิลใหม่)
    if (cycle !== 1 && cycle !== 31 && d >= cycle) {
      if (m === 12) {
        m = 1;
        y += 1;
      } else {
        m += 1;
      }
    }
    return { month: m, year: y };
  };

  const initDate = getInitialCycleDate();

  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [monthlySummary, setMonthlySummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAccounts, setShowAccounts] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showMJOverlay, setShowMJOverlay] = useState(false);
  const audioRef = useRef(new Audio());

  const currentYear = new Date().getFullYear();
  // 🚨 ตั้งค่าเริ่มต้น ปี ให้สัมพันธ์กับรอบบิล
  const [selectedYear, setSelectedYear] = useState(initDate.year);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // 🚨 ตั้งค่าเริ่มต้น เดือน ให้สัมพันธ์กับรอบบิล
  const [selectedMonth, setSelectedMonth] = useState(initDate.month);
  const months = [
    { val: 1, name: "มกราคม" },
    { val: 2, name: "กุมภาพันธ์" },
    { val: 3, name: "มีนาคม" },
    { val: 4, name: "เมษายน" },
    { val: 5, name: "พฤษภาคม" },
    { val: 6, name: "มิถุนายน" },
    { val: 7, name: "กรกฎาคม" },
    { val: 8, name: "สิงหาคม" },
    { val: 9, name: "กันยายน" },
    { val: 10, name: "ตุลาคม" },
    { val: 11, name: "พฤศจิกายน" },
    { val: 12, name: "ธันวาคม" },
  ];

  const [budget, setBudget] = useState(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("");
  const [budgetUpdateCount, setBudgetUpdateCount] = useState(0);

  const [cycleDate, setCycleDate] = useState(1);
  const [cycleUpdateCount, setCycleUpdateCount] = useState(0);
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [tempCycleDate, setTempCycleDate] = useState(1);

  const [chartData, setChartData] = useState([]);

  const navigate = useNavigate();

  // 🚨 เรียกใช้งานฟังก์ชันแปลงคลาสขนาดตัวอักษร
  const { getCls } = useFontSize();

  useEffect(() => {
    const audio = audioRef.current;
    if (showMJOverlay) {
      audio.src = "/billie-jean-intro.mp3";
      audio.loop = true;
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Playback interaction required"));
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    return () => {
      audio.pause();
      audio.removeAttribute("src");
    };
  }, [showMJOverlay]);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [
        summaryRes,
        accountsRes,
        transRes,
        profileRes,
        statsRes,
        currentMonthRes,
      ] = await Promise.all([
        api.get(`/summary?year=${selectedYear}`),
        api.get("/accounts"),
        api.get(`/transactions?limit=5`),
        api.get("/profile"),
        api.get(`/stats/annual?year=${selectedYear}`),
        api.get(
          `/summary?month=${selectedMonth}&year=${selectedYear}&period=month`,
        ),
      ]);

      setSummary(summaryRes.data);
      setMonthlySummary(currentMonthRes.data);
      setAccounts(accountsRes.data);
      setTransactions(transRes.data);

      if (profileRes.data) {
        setBudget(Number(profileRes.data.monthly_budget) || 0);
        setBudgetUpdateCount(profileRes.data.budget_update_count || 0);

        const fetchedCycleDate = profileRes.data.cycle_date || 1;
        setCycleDate(fetchedCycleDate);
        setCycleUpdateCount(profileRes.data.cycle_update_count || 0);

        // 🚨 [เพิ่มใหม่] บันทึกวันตัดรอบลงเครื่อง เพื่อให้คำนวณเดือนถูกเป๊ะตั้งแต่โหลดหน้าเว็บครั้งแรก
        localStorage.setItem("user_cycle_date", fetchedCycleDate);
      }

      const currentRealMonth = new Date().getMonth() + 1;
      if (
        selectedMonth === currentRealMonth &&
        budget > 0 &&
        currentMonthRes.data.expense > budget
      ) {
        Swal.fire({
          icon: "warning",
          title: "เกินงบแล้วนะพี่!",
          confirmButtonColor: "#ef4444",
        });
      }

      setChartData(statsRes.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedMonth, budget, cycleDate]);

  const totalBalanceAcrossAccounts = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0,
  );
  const overBudget = monthlySummary.expense > budget;
  const remainingInBudget = budget - monthlySummary.expense;
  const budgetUsagePercent =
    budget > 0 ? Math.min((monthlySummary.expense / budget) * 100, 100) : 0;

  const handleUpdateBudget = async () => {
    if (budgetUpdateCount >= 2) {
      setShowMJOverlay(true);
      setIsEditingBudget(false);
      return;
    }

    try {
      const res = await api.put("/user/budget", { budget: Number(tempBudget) });
      setBudget(Number(tempBudget));
      setBudgetUpdateCount(res.data.count);
      setIsEditingBudget(false);

      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: `บันทึกงบประมาณแล้ว (ใช้สิทธิ์ไปแล้ว ${res.data.count}/2 ครั้ง)`,
        showConfirmButton: false,
        timer: 2000,
        borderRadius: "20px",
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "บันทึกเป้าหมายไม่สำเร็จ";
      if (err.response?.status === 403) {
        setShowMJOverlay(true);
      } else {
        Swal.fire({ icon: "error", title: "ผิดพลาด", text: errorMsg });
      }
      setIsEditingBudget(false);
    }
  };

  const handleUpdateCycle = async () => {
    if (cycleUpdateCount >= 2) {
      setShowMJOverlay(true);
      setIsEditingCycle(false);
      return;
    }
    try {
      const res = await api.put("/user/cycle", {
        cycle_date: Number(tempCycleDate),
      });
      setCycleDate(Number(tempCycleDate));
      setCycleUpdateCount(res.data.count);
      setIsEditingCycle(false);

      // 🚨 [เพิ่มใหม่] อัปเดตค่ารอบบิลในเครื่องทันที
      localStorage.setItem("user_cycle_date", Number(tempCycleDate));

      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: `ตั้งวันตัดรอบสำเร็จ (ใช้สิทธิ์ไปแล้ว ${res.data.count}/2 ครั้ง)`,
        showConfirmButton: false,
        timer: 2000,
        borderRadius: "20px",
      });
      fetchDashboardData();
    } catch (err) {
      if (err.response?.status === 403) {
        setShowMJOverlay(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "ผิดพลาด",
          text: err.response?.data?.error || "ตั้งค่ารอบบิลไม่สำเร็จ",
        });
      }
      setIsEditingCycle(false);
    }
  };

  const cashTotal = accounts
    .filter((acc) => acc.type.toLowerCase() === "cash")
    .reduce((sum, acc) => sum + Number(acc.balance), 0);
  const bankTotal = accounts
    .filter((acc) => acc.type.toLowerCase() !== "cash")
    .reduce((sum, acc) => sum + Number(acc.balance), 0);
  const investTotal = accounts
    .filter((acc) => acc.type.toLowerCase() === "investment")
    .reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 text-[#444] font-kanit relative">
      {showMJOverlay && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-500">
          <button
            onClick={() => setShowMJOverlay(false)}
            className="absolute top-10 right-6 text-white/30 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>

          <div className="relative mb-4">
            <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
            <img
              src="/mj-dance.png"
              alt="MJ"
              className="w-72 h-auto drop-shadow-[0_0_35px_rgba(99,102,241,0.8)] animate-bounce relative z-10"
            />
          </div>

          <div className="text-center space-y-4 z-10">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Hee-Hee!
            </h2>
            <div className="space-y-1">
              <p className="text-2xl font-black text-white uppercase">
                ปรับเป้าไม่ได้แล้วพี่!
              </p>
              <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest">
                พี่ใช้สิทธิ์แก้ไขครบ 2 ครั้งของเดือนนี้แล้วครับ อ๊าว!!!
              </p>
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
          <p
            className={`font-black text-indigo-500/50 uppercase tracking-widest leading-none ${getCls("sub")}`}
          >
            ยินดีต้อนรับ
          </p>
          <h1
            className={`font-black text-gray-700 uppercase ${getCls("normal")}`}
          >
            สถิติการเงิน
          </h1>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className={`p-2 bg-indigo-50 text-indigo-600 rounded-full active:scale-90 transition-all ${isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-100"}`}
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="p-5 max-w-md mx-auto space-y-4">
        <div
          onClick={() => setShowAccounts(!showAccounts)}
          className="bg-indigo-600 p-4 rounded-2xl shadow-lg text-white relative overflow-hidden border border-indigo-700 cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 opacity-80 mb-1">
              <p
                className={`font-bold uppercase tracking-wider ${getCls("sub")}`}
              >
                ยอดเงินรวมทุกบัญชี
              </p>
              {showAccounts ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </div>
            <h2 className={`font-black tracking-tight ${getCls("title")}`}>
              ฿{totalBalanceAcrossAccounts.toLocaleString()}
            </h2>
          </div>
          <Wallet
            size={48}
            className="text-white/10 absolute -right-2 -bottom-2 rotate-12"
          />
        </div>

        {showAccounts && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm font-kanit animate-in slide-in-from-top-2 duration-300">
            {/* 🚨 แก้ไขจาก grid-cols-2 เป็น grid-cols-3 เพื่อให้เรียง 3 อย่างบรรทัดเดียวกัน */}
            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-100">
              <div className="text-center">
                <p
                  className={`font-black text-gray-400 uppercase ${getCls("sub")}`}
                >
                  เงินสด
                </p>
                <p className={`font-black text-gray-700 ${getCls("normal")}`}>
                  ฿{cashTotal.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p
                  className={`font-black text-gray-400 uppercase ${getCls("sub")}`}
                >
                  ธนาคาร
                </p>
                <p className={`font-black text-gray-700 ${getCls("normal")}`}>
                  ฿{bankTotal.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p
                  className={`font-black text-gray-400 uppercase ${getCls("sub")}`}
                >
                  ลงทุน
                </p>
                <p className={`font-black text-gray-700 ${getCls("normal")}`}>
                  ฿{investTotal.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-1"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1 rounded-lg ${acc.type.toLowerCase() === "cash" ? "bg-orange-50 text-orange-500" : acc.type.toLowerCase() === "investment" ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500"}`}
                    >
                      {acc.type.toLowerCase() === "cash" ? (
                        <Banknote size={12} />
                      ) : acc.type.toLowerCase() === "investment" ? (
                        <TrendingUp size={12} />
                      ) : (
                        <Landmark size={12} />
                      )}
                    </div>
                    <span
                      className={`font-bold text-gray-600 ${getCls("sub")}`}
                    >
                      {acc.name}
                    </span>
                  </div>
                  <span
                    className={`font-black text-gray-700 ${getCls("normal")}`}
                  >
                    ฿{Number(acc.balance).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3
              className={`font-black text-gray-400 uppercase tracking-widest leading-none ${getCls("sub")}`}
            >
              สรุปรายการตามรอบบิล
            </h3>
            <div className="flex items-center gap-0.5 bg-indigo-50/50 px-1.5 py-0.5 rounded-md border border-indigo-50">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className={`bg-transparent font-black text-indigo-600 outline-none cursor-pointer appearance-none pr-1 ${getCls("sub")}`}
              >
                {months.map((m) => (
                  <option key={m.val} value={m.val}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={8} className="text-indigo-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center border-t border-gray-50 pt-2">
            <div
              onClick={() =>
                navigate(`/report?type=income&month=${selectedMonth}`)
              }
              className="space-y-0.5 border-r border-gray-50 cursor-pointer active:bg-gray-50 transition-colors py-0.5 px-0.5 rounded-lg"
            >
              <p
                className={`font-bold text-gray-400 uppercase flex items-center justify-center gap-0.5 ${getCls("sub")}`}
              >
                รายรับ <ArrowRight size={6} className="text-gray-300" />
              </p>
              <p
                className={`font-black text-green-500 flex items-center justify-center gap-0.5 ${getCls("normal")}`}
              >
                <TrendingUp size={8} /> ฿
                {monthlySummary.income.toLocaleString()}
              </p>
            </div>
            <div
              onClick={() =>
                navigate(`/report?type=expense&month=${selectedMonth}`)
              }
              className="space-y-0.5 border-r border-gray-50 cursor-pointer active:bg-gray-50 transition-colors py-0.5 px-0.5 rounded-lg"
            >
              <p
                className={`font-bold text-gray-400 uppercase flex items-center justify-center gap-0.5 ${getCls("sub")}`}
              >
                รายจ่าย <ArrowRight size={6} className="text-gray-300" />
              </p>
              <p
                className={`font-black text-red-500 flex items-center justify-center gap-0.5 ${getCls("normal")}`}
              >
                <TrendingDown size={8} /> ฿
                {monthlySummary.expense.toLocaleString()}
              </p>
            </div>
            <div className="space-y-0.5 py-0.5 px-0.5">
              <p
                className={`font-bold text-gray-400 uppercase ${getCls("sub")}`}
              >
                คงเหลือ
              </p>
              <p className={`font-black text-indigo-600 ${getCls("normal")}`}>
                ฿
                {(
                  monthlySummary.income - monthlySummary.expense
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} className="text-indigo-500" />
              <h3
                className={`font-black text-gray-400 uppercase tracking-widest ${getCls("sub")}`}
              >
                รอบตัดบัญชี (แก้ได้ 2 ครั้ง)
              </h3>
            </div>
            <button
              onClick={() => {
                setIsEditingCycle(!isEditingCycle);
                setTempCycleDate(cycleDate);
              }}
              className={`text-indigo-500 font-black uppercase bg-indigo-50 px-2 py-0.5 rounded-md ${getCls("sub")}`}
            >
              {isEditingCycle ? "ยกเลิก" : "ตั้งค่า"}
            </button>
          </div>

          {isEditingCycle ? (
            <div className="space-y-1 mb-3 border-b border-gray-50 pb-3">
              <div className="flex gap-2 items-center">
                <select
                  className={`flex-1 border-b border-indigo-100 focus:border-indigo-500 outline-none px-1 py-0.5 font-black text-gray-700 bg-transparent cursor-pointer ${getCls("normal")}`}
                  value={tempCycleDate}
                  onChange={(e) => setTempCycleDate(Number(e.target.value))}
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      วันที่ {i + 1}
                    </option>
                  ))}
                  <option value={31}>วันสิ้นเดือน</option>
                </select>
                <button
                  onClick={handleUpdateCycle}
                  className={`bg-indigo-600 text-white px-3 py-1 rounded font-black uppercase shadow-md active:scale-95 transition-all ${getCls("sub")}`}
                >
                  บันทึก
                </button>
              </div>
              <p
                className={`text-gray-400 font-bold uppercase tracking-tighter ${getCls("sub")}`}
              >
                * แก้ไขได้อีก {2 - cycleUpdateCount} ครั้ง
              </p>
            </div>
          ) : (
            <div className="mb-3 border-b border-gray-50 pb-3 flex items-end justify-between">
              <p
                className={`font-black text-gray-700 leading-none ${getCls("normal")}`}
              >
                วันที่{" "}
                <span
                  className={`text-indigo-600 leading-none ${getCls("title")}`}
                >
                  {cycleDate === 31 ? "สิ้นเดือน" : cycleDate}
                </span>
              </p>
              <p
                className={`font-bold text-gray-400 uppercase leading-none mb-0.5 ${getCls("sub")}`}
              >
                ของทุกเดือน
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <Target size={12} className="text-indigo-500" />
              <h3
                className={`font-black text-gray-400 uppercase tracking-widest ${getCls("sub")}`}
              >
                จำกัดการใช้เงิน (แก้ได้ 2 ครั้ง)
              </h3>
            </div>
            <button
              onClick={() => {
                setIsEditingBudget(!isEditingBudget);
                setTempBudget(budget);
              }}
              className={`text-indigo-500 font-black uppercase bg-indigo-50 px-2 py-0.5 rounded-md ${getCls("sub")}`}
            >
              {isEditingBudget ? "ยกเลิก" : "ตั้งค่า"}
            </button>
          </div>

          {isEditingBudget ? (
            <div className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="number"
                  className={`flex-1 border-b border-indigo-100 focus:border-indigo-500 outline-none px-1 py-0.5 font-black text-gray-700 ${getCls("normal")}`}
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleUpdateBudget}
                  className={`bg-indigo-600 text-white px-3 py-1 rounded font-black uppercase shadow-md active:scale-95 transition-all ${getCls("sub")}`}
                >
                  บันทึก
                </button>
              </div>
              <p
                className={`text-gray-400 font-bold uppercase tracking-tighter ${getCls("sub")}`}
              >
                * แก้ไขได้อีก {2 - budgetUpdateCount} ครั้ง
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <p
                    className={`font-black text-gray-700 leading-none ${getCls("title")}`}
                  >
                    ฿{budget.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-black ${overBudget ? "text-red-500" : "text-green-600"} ${getCls("sub")}`}
                  >
                    {overBudget
                      ? `เกินงบ ฿${Math.abs(remainingInBudget).toLocaleString()}`
                      : `ใช้ได้อีก ฿${remainingInBudget.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-out ${overBudget ? "bg-red-500" : "bg-indigo-500"}`}
                  style={{ width: `${budgetUsagePercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-500" />
              <h3
                className={`font-black text-gray-400 uppercase tracking-widest ${getCls("sub")}`}
              >
                แนวโน้มเงินเก็บ
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              <CalendarDays size={10} className="text-indigo-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={`bg-transparent font-black text-gray-600 outline-none cursor-pointer ${getCls("sub")}`}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {y + 543}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full" style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontWeight: "bold" }}
                  padding={{ left: 15, right: 15 }}
                />
                <YAxis
                  hide={true}
                  domain={["dataMin - 1000", "dataMax + 1000"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "10px",
                    fontFamily: "Kanit",
                  }}
                  formatter={(value) => [
                    `฿${value.toLocaleString()}`,
                    "เงินเก็บ",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorSavings)"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                    fill: "#6366f1",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/transaction")}
            className="w-full bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group active:bg-gray-50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Plus size={18} />
              </div>
              <span className={`font-black text-gray-600 ${getCls("normal")}`}>
                บันทึกรายรับ-รายจ่าย
              </span>
            </div>
            <ArrowRight
              size={16}
              className="text-gray-300 group-hover:translate-x-1 transition-transform"
            />
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <h3
                className={`font-black text-gray-400 uppercase tracking-widest ${getCls("sub")}`}
              >
                รายการล่าสุด
              </h3>
              <button
                onClick={() => navigate("/transaction")}
                className={`font-black text-indigo-500 uppercase ${getCls("sub")}`}
              >
                ดูทั้งหมด
              </button>
            </div>
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((item) => {
                const account = accounts.find((a) => a.id === item.account_id);
                const toAccount = item.to_account_id
                  ? accounts.find((a) => a.id === item.to_account_id)
                  : null;
                const isTransfer = item.type === "transfer";

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate("/transaction")}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${isTransfer ? "bg-indigo-50 text-indigo-500" : item.type === "expense" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
                      >
                        {isTransfer ? (
                          <ArrowRightLeft size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`font-black text-gray-700 leading-tight ${getCls("normal")}`}
                          >
                            {isTransfer
                              ? `โอนไปยัง ${toAccount?.name || "..."}`
                              : item.category || "ทั่วไป"}
                          </p>
                          {isTransfer && (
                            <ArrowRightLeft
                              size={10}
                              className="text-indigo-400"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 opacity-60">
                          {account?.type.toLowerCase() === "cash" ? (
                            <Wallet size={8} className="text-orange-400" />
                          ) : (
                            <Landmark size={12} className="text-blue-400" />
                          )}
                          <span
                            className={`font-black text-gray-500 uppercase ${getCls("sub")}`}
                          >
                            {account?.name || "-"}
                          </span>
                        </div>
                        <p
                          className={`text-gray-400 font-bold uppercase mt-1 ${getCls("sub")}`}
                        >
                          {new Date(item.date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          {new Date(item.date).getFullYear() + 543}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-black ${isTransfer ? "text-indigo-600" : item.type === "expense" ? "text-red-500" : "text-green-600"} ${getCls("normal")}`}
                    >
                      {isTransfer ? "" : item.type === "expense" ? "-" : "+"} ฿
                      {Number(item.amount).toLocaleString()}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <p
                  className={`text-gray-400 font-medium font-kanit ${getCls("normal")}`}
                >
                  ไม่มีรายการ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
