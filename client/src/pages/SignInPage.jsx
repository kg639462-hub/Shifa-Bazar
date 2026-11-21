import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  Leaf,
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DispensaryLogo from '../components/common/DispensaryLogo';

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, resetPasswordForEmail } = useAuth();

  // Clear demo credentials - start with empty input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Check if URL hash has #forgot
  useEffect(() => {
    if (window.location.hash === '#forgot') {
      setShowForgotModal(true);
    }
  }, []);

  const openForgotModal = () => {
    setForgotEmail(email.trim());
    setForgotError('');
    setForgotSuccess('');
    setShowForgotModal(true);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await resetPasswordForEmail(forgotEmail.trim());
      if (res.success) {
        setForgotSuccess(res.message || 'Password reset link sent to your email.');
      } else {
        setForgotError(res.error || 'Failed to dispatch password reset email. Please try again.');
      }
    } catch (err) {
      setForgotError(err.message || 'Error processing password reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        navigate('/orders');
      } else {
        setError(result.error || 'Failed to authenticate with dispensary database.');
      }
    } catch (err) {
      setError(err.message || 'Dispensary authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Top Logo placeholder (isolated in DispensaryLogo.jsx for user customization) */}
      <DispensaryLogo variant="auth_center" />

      {/* Main Sign In Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#d6e8dd] shadow-sm space-y-6">
        {/* Verified Dispensary Access Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-[#0a2e1e] text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-[#bbf7d0]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span> VERIFIED USERS ACCESS</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0a2e1e]">
             Sign In
          </h1>

          <p className="text-xs sm:text-sm text-[#4b6356] leading-relaxed">
            Access your personalized herbal regimens, practitioner notes, and  order history.
          </p>
        </div>

        {/* Info Message (e.g. from registration redirect) */}
        {infoMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Identifier / Email */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <label className="text-[#0a2e1e]">Patient Identifier / Email *</label>
              <span className="text-[11px] text-[#4b6356]/80 font-mono">e.g. name@domain.com</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-800">
                <User className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full bg-[#eaf5ee] hover:bg-[#e4f2e9] focus:bg-[#e4f2e9] text-xs sm:text-sm text-[#0a2e1e] rounded-xl pl-10 pr-10 py-3 border border-transparent focus:border-emerald-600 focus:outline-hidden transition-all placeholder:text-[#4b6356]/60"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-700">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Secure Dispensary Password */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <label className="text-[#0a2e1e]">Secure Dispensary Password *</label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-[11px] text-[#0a2e1e] hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-800">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your dispensary password"
                className="w-full bg-[#eaf5ee] hover:bg-[#e4f2e9] focus:bg-[#e4f2e9] text-xs sm:text-sm text-[#0a2e1e] rounded-xl pl-10 pr-10 py-3 border border-transparent focus:border-emerald-600 focus:outline-hidden transition-all placeholder:text-[#4b6356]/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember this medical device Toggle */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#0a2e1e] font-medium">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="rounded text-[#0a2e1e] focus:ring-emerald-800 h-4 w-4"
              />
              <span>Remember this device</span>
            </label>
            <ShieldCheck className="w-4 h-4 text-emerald-700" title="HIPAA Compliant" />
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a2e1e] hover:bg-[#072417] text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Leaf className="w-4 h-4 text-emerald-300" />
            )}
            Sign In to Ash-Shifa 
          </button>
        </form>

        {/* Divider: Fast Botanical Access */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#e2ece5] w-full"></div>
          <span className="bg-white px-3 text-[10px] font-bold tracking-wider text-emerald-900 uppercase shrink-0">
            ✨ QUICK LOGIN
          </span>
          <div className="border-t border-[#e2ece5] w-full"></div>
        </div>

        {/* Secondary Options */}
        <div className="space-y-2.5">
          
            

          <button
            type="button"
            onClick={() => setError('Google Sign-In can be enabled in Supabase Dashboard -> Authentication -> Providers -> Google.')}
            className="w-full bg-[#eaf5ee] hover:bg-[#e2efe7] text-[#0a2e1e] py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-[#d6e8dd] transition-colors"
          >
            <span className="font-bold text-blue-600">G</span>
            Sign in with Google
          </button>
        </div>
      </div>

      {/* New to Ash-Shifa Banner Card matching screenshot */}
      <div className="bg-[#dcfce7]/60 rounded-3xl p-5 sm:p-6 border border-[#bbf7d0] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#0a2e1e] flex items-center justify-center sm:justify-start gap-1.5">
            <User className="w-4 h-4 text-emerald-800" />
            New to Ash-Shifa Herbals?
          </h3>
          <p className="text-xs text-[#4b6356]">
            Create an account to track customized tinctures, holistic regimens, and clinical lab batches.
          </p>
        </div>
        <Link
          to="/register"
          className="bg-white hover:bg-gray-50 text-[#0a2e1e] px-5 py-2.5 rounded-xl font-bold text-xs border border-[#d6e8dd] shadow-2xs shrink-0 transition-colors"
        >
          Register Account
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#d6e8dd] space-y-5 animate-in fade-in zoom-in-95 duration-150 relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-[#0a2e1e] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-[#bbf7d0]">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>PASSWORD RECOVERY</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0a2e1e]">
                Reset Your Password
              </h2>
              <p className="text-xs text-[#4b6356] leading-relaxed">
                Enter your registered email address. We'll dispatch a secure recovery link so you can set a new password.
              </p>
            </div>

            {/* Success Feedback */}
            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reset Link Dispatched!</span>
                  </div>
                  <p className="text-emerald-700 leading-relaxed">
                    A password recovery link has been sent to <span className="font-semibold underline">{forgotEmail}</span>.
                    Please check your inbox (and spam/junk folder) and click the link to choose your new password.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      navigate('/reset-password');
                    }}
                    className="w-full bg-[#0a2e1e] hover:bg-[#072417] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    Go to Reset Password Screen
                    <ArrowRight className="w-4 h-4 text-emerald-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full bg-[#f0faf4] hover:bg-[#e4f4ec] text-[#0a2e1e] py-2.5 px-4 rounded-xl font-semibold text-xs border border-[#d6e8dd] transition-colors"
                  >
                    Done / Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#0a2e1e] mb-1.5">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-800">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. yourname@domain.com"
                      className="w-full bg-[#eaf5ee] hover:bg-[#e4f2e9] focus:bg-[#e4f2e9] text-xs sm:text-sm text-[#0a2e1e] rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-emerald-600 focus:outline-hidden transition-all placeholder:text-[#4b6356]/60"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="w-full bg-[#0a2e1e] hover:bg-[#072417] text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                    )}
                    Send Password Reset Link
                  </button>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-[#4b6356]">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="hover:text-[#0a2e1e] hover:underline"
                    >
                      Cancel
                    </button>
                    <Link
                      to="/reset-password"
                      onClick={() => setShowForgotModal(false)}
                      className="text-[#0a2e1e] hover:underline font-semibold"
                    >
                      Already have code or link? &rarr;
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
