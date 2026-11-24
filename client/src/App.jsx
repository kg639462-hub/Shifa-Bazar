import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

/**
 * Global listener that intercepts Supabase recovery tokens (e.g. from email links)
 * and immediately routes the user to the Reset Password screen regardless of which page they landed on.
 */
function AuthRecoveryListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash || location.hash || '';
    const search = window.location.search || location.search || '';
    const isRecovery =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      (hash.includes('access_token=') && !location.pathname.startsWith('/reset-password') && !location.pathname.startsWith('/admin'));

    if (isRecovery && location.pathname !== '/reset-password') {
      navigate(`/reset-password${search}${hash}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AuthRecoveryListener />
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-[#f0faf4]">
            {/* Top Navigation */}
            <Header />

            {/* Main View Area */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
