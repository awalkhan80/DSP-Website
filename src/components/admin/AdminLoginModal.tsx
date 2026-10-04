import React, { useState, useEffect } from 'react';
import {
  ADMIN_CREDENTIALS,
  validateAdminCredentials,
  getLockoutRemainingSeconds,
  forceResetLockout,
  createAdminSession,
  AdminSession,
} from '../../utils/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AdminSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState(ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState(ADMIN_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check lockout on mount and interval
  useEffect(() => {
    const checkLockout = () => {
      const remaining = getLockoutRemainingSeconds();
      setLockoutSeconds(remaining);
      if (remaining > 0) {
        setErrorMessage(`Security lockout active. Please wait ${remaining}s or click "Reset Lockout".`);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const handleResetLockout = () => {
    forceResetLockout();
    setLockoutSeconds(0);
    setErrorMessage(null);
  };

  const handleInstantLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const session = createAdminSession(rememberMe);
      setIsLoading(false);
      onSuccess(session);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutSeconds > 0) {
      setErrorMessage(`Portal locked. Please wait ${lockoutSeconds} seconds or click "Reset Lockout".`);
      return;
    }

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);

    // Verify credentials
    setTimeout(() => {
      const result = validateAdminCredentials(username, password, rememberMe);
      setIsLoading(false);

      if (result.success && result.session) {
        onSuccess(result.session);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        if (result.lockedSeconds) {
          setLockoutSeconds(result.lockedSeconds);
        }
      }
    }, 250);
  };

  const handleQuickFill = () => {
    setUsername(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setErrorMessage(null);
    if (lockoutSeconds > 0) {
      handleResetLockout();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#181514] text-[#FAF6F0] rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-heading"
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close Admin Login"
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-stone-900 border border-amber-500/40 flex items-center justify-center mb-3 shadow-inner">
              <span className="material-symbols-outlined text-[30px] text-amber-400">admin_panel_settings</span>
            </div>
            <h2 id="admin-login-heading" className="text-xl font-bold font-serif text-white tracking-wide">
              Operator Admin Portal
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              The Phoenix Desert Safari Dubai • Direct Fleet CMS
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              256-Bit TLS Secured Admin Gateway
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">error</span>
              <div className="flex-1">
                <span>{errorMessage}</span>
                {lockoutSeconds > 0 && (
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-red-900/60">
                    <span className="font-mono text-amber-300 font-bold text-[11px]">
                      Lockout remaining: {lockoutSeconds}s
                    </span>
                    <button
                      type="button"
                      onClick={handleResetLockout}
                      className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Reset Lockout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CapsLock Warning */}
          {isCapsLockOn && (
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Warning: Caps Lock is ON</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Admin Username / Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                  mail
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyUp={handleKeyDown}
                  placeholder="awalgsm@gmail.com or admin"
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Password
                </label>
                <span className="text-[10px] text-stone-400">Case-insensitive accepted</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyDown}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-stone-900"
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={handleQuickFill}
                title="Fill credentials for quick testing"
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-900/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>

            {/* 1-Click Instant Access Button */}
            <button
              type="button"
              onClick={handleInstantLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">bolt</span>
              <span>1-Click Instant Operator Sign In</span>
            </button>
          </form>

          {/* Quick Helper Credentials Note */}
          <div className="mt-5 p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400 flex flex-col gap-1">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-amber-400">key</span>
                Authorized Operator Credentials:
              </span>
              <button
                onClick={handleQuickFill}
                className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
              >
                Insert
              </button>
            </div>
            <div className="font-mono text-stone-300 text-[10px] mt-0.5 space-y-0.5 bg-stone-950/60 p-2 rounded">
              <div>Username: <span className="text-amber-300 font-semibold">{ADMIN_CREDENTIALS.email}</span> (or <span className="text-amber-300">admin</span>)</div>
              <div>Password: <span className="text-amber-300 font-semibold">{ADMIN_CREDENTIALS.password}</span></div>
            </div>
          </div>

          {/* Return to Storefront */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-400 hover:text-stone-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Return to Dubai Safari Storefront</span>
            </button>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="bg-[#12100F] px-6 py-2.5 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-emerald-400">shield</span>
            Direct DTCM Operator Gate
          </span>
          <span className="text-stone-400 font-mono">DTCM-LIC-#102357</span>
        </div>
      </div>
    </div>
  );
};
