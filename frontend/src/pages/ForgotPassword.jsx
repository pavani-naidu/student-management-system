import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset, 4: done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // NOTE: no backend endpoint exists for this flow yet (POST /api/auth/forgot-password,
  // /api/auth/verify-otp, /api/auth/reset-password). This page is wired up for that
  // API shape so wiring it in later is just adding the three controller methods + email service.

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    toast('OTP flow needs a backend endpoint — see the comment in ForgotPassword.jsx', { icon: '🛠️' });
    setStep(2);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setStep(4);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-slate-925 p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass rounded-badge p-8 shadow-card border border-ink/5 dark:border-white/5"
      >
        <Link to="/login" className="text-sm text-indigo-500 hover:underline">← Back to sign in</Link>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
            <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
            <p className="text-sm text-ink/60 dark:text-paper/60">Enter your email and we'll send a one-time code.</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
              Send code
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="mt-4 space-y-4">
            <h1 className="font-display text-2xl font-semibold">Enter the code</h1>
            <p className="text-sm text-ink/60 dark:text-paper/60">We sent a 6-digit code to {email}.</p>
            <input
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent tracking-[0.5em] text-center focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
              Verify code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
            <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
              Reset password
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="mt-4 text-center">
            <h1 className="font-display text-2xl font-semibold">Password reset</h1>
            <p className="text-sm text-ink/60 dark:text-paper/60 mt-2">
              You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-block w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
