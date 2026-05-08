import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Account from '../pages/Account';
import Transaction from '../pages/Transaction';
import Report from '../pages/Report';
import Profile from '../pages/Profile';
import AdminFrames from '../pages/AdminFrames';
import InstallGuide from '../pages/InstallGuide';


const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/install-guide" element={<InstallGuide />} />

            {/* Protected Routes (ต้อง Login ก่อน) */}
            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="account" element={<Account />} />
                <Route path="transaction" element={<Transaction />} />
                <Route path="account/:id" element={<Account />} /> {/* เส้นทางสำหรับดูรายละเอียดบัญชี */}
                <Route path="report" element={<Report />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin/frames" element={<AdminFrames />} /> {/* เส้นทางสำหรับจัดการกรอบโปรไฟล์ (Admin) */}
            </Route>
            
            {/* Fallback กรณีพิมพ์ URL มั่ว */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
};

export default AppRoutes;