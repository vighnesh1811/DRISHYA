import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';
import EquipmentPage from './pages/public/EquipmentPage';
import EquipmentDetailPage from './pages/public/EquipmentDetailPage';
import AuthPage from './pages/auth/AuthPage';
import AdminEquipmentPage from './pages/admin/AdminEquipmentPage';
import { AuthProvider } from './context/AuthContext';
import RequireRole from './components/RequireRole';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import BookingHistoryPage from './pages/customer/BookingHistoryPage';
import AdminOperationsPage from './pages/admin/AdminOperationsPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import ProfilePage from './pages/customer/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CustomersPage from './pages/admin/CustomersPage';
import ReportsPage from './pages/admin/ReportsPage';
import EnquiriesPage from './pages/admin/EnquiriesPage';
import PoliciesPage from './pages/public/PoliciesPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/catalog" element={<EquipmentPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/equipment/:slug" element={<EquipmentDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<RequireRole role="customer"><CheckoutPage /></RequireRole>} />
        <Route path="/dashboard/bookings" element={<RequireRole role="customer"><BookingHistoryPage /></RequireRole>} />
        <Route path="/dashboard" element={<RequireRole role="customer"><CustomerDashboardPage /></RequireRole>} />
        <Route path="/dashboard/profile" element={<RequireRole role="customer"><ProfilePage /></RequireRole>} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/admin/login" element={<AuthPage admin />} />
        <Route path="/admin/dashboard" element={<RequireRole role="admin"><AdminDashboardPage /></RequireRole>} />
        <Route path="/admin/equipment" element={<RequireRole role="admin"><AdminEquipmentPage /></RequireRole>} />
        <Route path="/admin/operations" element={<RequireRole role="admin"><AdminOperationsPage /></RequireRole>} />
        <Route path="/admin/customers" element={<RequireRole role="admin"><CustomersPage /></RequireRole>} />
        <Route path="/admin/reports" element={<RequireRole role="admin"><ReportsPage /></RequireRole>} />
        <Route path="/admin/enquiries" element={<RequireRole role="admin"><EnquiriesPage /></RequireRole>} />
        <Route path="/rental-policy" element={<PoliciesPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
      </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
