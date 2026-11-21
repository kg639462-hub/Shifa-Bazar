import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import DispensaryLogo from '../components/common/DispensaryLogo';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updatePassword, resetPasswordForEmail, verifyOtpForRecovery } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Recovery code fallback states
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [manualCodeMode, setManualCodeMode] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [requestSentMessage, setRequestSentMessage] = useState('');

  // Check URL parameters and active session on mount
  useEffect(() => {
    let mounted = true;

    async function checkRecoveryStatus() {
      try {
        if (!isSupabaseConfigured() || !supabase) {
          if (mounted) {
            setCheckingSession(false);
            setHasValidSession(false);
          }
          return;
        }

        // Check if URL has PKCE 'code' query param
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        if (code) {
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeError && data.session) {
              if (mounted) {
                setHasValidSession(true);
                setCheckingSession(false);
                return;
              }
            }
          } catch (e) {
            console.warn('PKCE exchange error (may already be handled by SDK):', e.message);
          }
        }

        // Check current Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
            return;
          }
        }

        // Listen for Supabase PASSWORD_RECOVERY event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            if (mounted) {
              setHasValidSession(true);
              setCheckingSession(false);
            }
          }
        });

        // If hash contains type=recovery or access_token
        if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token')) {
          if (mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
        } else {
          // Allow a brief delay for Supabase auth state listener to trigger
          setTimeout(() => {
            if (mounted) {
              setCheckingSession(false);
            }
          }, 800);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error verifying recovery session:', err);
        if (mounted) setCheckingSession(false);
      }
    }

    checkRecoveryStatus();

    return () => {
      mounted = false;
    };
  }, []);

  // Validation rules
  const isMinLength = password.length >= 6;
  const isMatching = password && password === confirmPassword;
  const isFormValid = isMinLength && isMatching;

  // Handle password update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      // If user is using manual OTP code mode
      if (manualCodeMode && otpCode && email) {
        const otpResult = await verifyOtpForRecovery({ email, token: otpCode });
        if (!otpResult.success) {
          setError(otpResult.error || 'Invalid or expired recovery code.');
          setLoading(false);
          return;
        }
      }

      // Update password via Supabase
      const result = await updatePassword(password);
      if (result.success) {
        setSuccessMessage('Password updated successfully! Redirecting you to sign in...');
        setTimeout(() => {
          navigate('/signin', {
            state: { message: 'Password updated successfully! Please sign in with your new credentials.' }
          });
        }, 2500);
      } else {
        setError(result.error || 'Failed to update password. Your recovery link may have expired.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while resetting your password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting a new reset link directly
  const handleRequestNewLink = async (e) => {
    e.preventDefault();
    setError('');
    setRequestSentMessage('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordForEmail(email.trim());
      if (res.success) {
        setRequestSentMessage(`Recovery link dispatched to ${email.trim()}! Please check your inbox and click the link.`);
      } else {
        setError(res.error || 'Failed to dispatch reset email. Please verify the email address.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
        <p className="text-xs text-[#4b6356] font-medium">Verifying secure recovery authorization...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <DispensaryLogo variant="auth_center" />

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#d6e8dd] shadow-sm space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-[#0a2e1e] text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-[#bbf7d0]">
            <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
            <span>DISPENSARY CREDENTIAL RECOVERY</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0a2e1e]">
            {successMessage ? 'Password Reset Complete' : 'Reset Your Password'}
          </h1>

          <p className="text-xs sm:text-sm text-[#4b6356] leading-relaxed">
            {hasValidSession || manualCodeMode
              ? 'Choose a strong, memorable password to secure your Ash-Shifa dispensary account and medical orders.'
              : 'Securely recover your account access using your registered email.'}
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold text-sm text-emerald-800">{successMessage}</p>
              <p className="text-emerald-700">You will be redirected automatically, or click below:</p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
              >
                Sign In with New Password &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Request Sent Alert */}
        {requestSentMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{requestSentMessage}</span>
          </div>
        )}

        {/* CASE 1: Valid Session or Manual Code Mode -> Show Set New Password Form */}
        {(hasValidSession || manualCodeMode) && !successMessage && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {manualCodeMode && (
              <div className="space-y-3.5 p-4 bg-[#f8faf9] rounded-2xl border border-[#d6e8dd]">
                <div>
                  <label className="block text-xs font-medium text-[#0a2e1e] mb-1">
                    Your Registered Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white text-xs sm:text-sm text-[#0a2e1e] rounded-xl pl-10 pr-4 py-2.5 border border-[#d6e8dd] focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0a2e1e] mb-1">
                    6-Digit Recovery Code / Token *
                  </label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code received via email"
                    className="w-full bg-white font-mono text-xs sm:text-sm text-[#0a2e1e] rounded-xl px-4 py-2.5 border border-[#d6e8dd] focus:border-emerald-600 focus:outline-hidden tracking-widest"
                  />
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <label className="text-[#0a2e1e]">New Password *</label>
                <span className="text-[11px] text-[#4b6356]/80 font-mono">Min. 6 characters</span>
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
                  placeholder="Enter your new password"
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

            {/* Confirm New Password */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <label className="text-[#0a2e1e]">Confirm New Password *</label>
                <span className="text-[11px] text-[#4b6356]/80 font-mono">Must match</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-800">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-[#eaf5ee] hover:bg-[#e4f2e9] focus:bg-[#e4f2e9] text-xs sm:text-sm text-[#0a2e1e] rounded-xl pl-10 pr-10 py-3 border border-transparent focus:border-emerald-600 focus:outline-hidden transition-all placeholder:text-[#4b6356]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Password Checklist */}
            <div className="p-3 bg-[#f8faf9] rounded-xl border border-[#d6e8dd] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isMinLength ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isMinLength ? '✓' : '•'}
                </div>
                <span className={isMinLength ? 'text-emerald-800 font-medium' : 'text-gray-500'}>
                  At least 6 characters long
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isMatching ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isMatching ? '✓' : '•'}
                </div>
                <span className={isMatching ? 'text-emerald-800 font-medium' : 'text-gray-500'}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-[#0a2e1e] hover:bg-[#072417] text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              )}
              Update Dispensary Password
            </button>
          </form>
        )}

        {/* CASE 2: No active session detected -> Prompt to request reset link or enter code */}
        {!hasValidSession && !manualCodeMode && !successMessage && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>Password Reset Link Required</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                To protect patient security, password resets require an authenticated recovery token sent to your registered email address.
              </p>
            </div>

            {/* Form to Request Link */}
            <form onSubmit={handleRequestNewLink} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0a2e1e] mb-1.5">
                  Your Registered Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-800">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full bg-[#eaf5ee] hover:bg-[#e4f2e9] focus:bg-[#e4f2e9] text-xs sm:text-sm text-[#0a2e1e] rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-emerald-600 focus:outline-hidden transition-all placeholder:text-[#4b6356]/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-[#0a2e1e] hover:bg-[#072417] text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                )}
                Send Password Reset Link
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#e2ece5] w-full"></div>
              <span className="bg-white px-3 text-[10px] font-bold tracking-wider text-emerald-900 uppercase shrink-0">
                OR
              </span>
              <div className="border-t border-[#e2ece5] w-full"></div>
            </div>

            <button
              type="button"
              onClick={() => setManualCodeMode(true)}
              className="w-full bg-[#eaf5ee] hover:bg-[#e2efe7] text-[#0a2e1e] py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-[#d6e8dd] transition-colors"
            >
              <KeyRound className="w-4 h-4 text-emerald-700" />
              I have a 6-digit recovery code from email
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-[#e2ece5] flex items-center justify-between text-xs">
          <Link
            to="/signin"
            className="inline-flex items-center gap-1.5 text-[#0a2e1e] hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>

          {manualCodeMode && !hasValidSession && (
            <button
              type="button"
              onClick={() => setManualCodeMode(false)}
              className="text-[#4b6356] hover:text-[#0a2e1e] hover:underline"
            >
              Request new link instead
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
