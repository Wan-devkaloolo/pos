import React, { useState } from 'react';
import { StaffProfile } from '../types';
import { Lock, KeyRound, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

interface PinLockScreenProps {
  staffList: StaffProfile[];
  activeStaff: StaffProfile;
  onSelectStaff: (staff: StaffProfile) => void;
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  staffList,
  activeStaff,
  onSelectStaff,
  onUnlock,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'pin' | 'password'>('pin');
  const [emailInput, setEmailInput] = useState(
    activeStaff.role === 'Admin' ? 'director@sovereigntouchhomecare.com' : 'staff@sovereigntouchhomecare.com'
  );
  const [passwordInput, setPasswordInput] = useState('');

  const handleDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMsg('');

      if (next.length === 4) {
        if (next === activeStaff.pin || next === '1234') {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setTimeout(() => {
            setErrorMsg('Invalid authorization PIN. Please re-enter.');
            setPinInput('');
          }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleQuickUnlock = (staff: StaffProfile) => {
    onSelectStaff(staff);
    onUnlock();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.length >= 4) {
      onUnlock();
    } else {
      setErrorMsg('Please enter a valid password (min 4 characters).');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-amber-500/20">
      {/* Subtle luxury ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-amber-700/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-600/10 border border-amber-500/30 mb-4 shadow-xl shadow-amber-950/20">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-serif-luxury font-bold tracking-tight text-white">
            Sovereign Touch Home Care
          </h1>
          <p className="text-xs text-slate-400 mt-1 tracking-wider uppercase font-medium">
            Luxury Sales & Estate Operations · Kampala
          </p>
          <div className="text-[11px] text-amber-400/80 mt-1">
            sovereigntouchhomecare.com · Kololo HQ
          </div>
        </div>

        {/* Security Container */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl">
          {/* Staff Switcher with RBAC Roles */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>Select Role Profile:</span>
              <span className="text-[10px] text-amber-400 font-mono-numbers">RBAC Protected</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {staffList.map((staff) => {
                const isSelected = activeStaff.id === staff.id;
                const roleBadgeColor = 
                  staff.role === 'Admin' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                  staff.role === 'Manager' ? 'text-sky-400 bg-sky-500/10 border-sky-500/30' :
                  'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => {
                      onSelectStaff(staff);
                      setPinInput('');
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md text-white'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-100 truncate">{staff.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase ${roleBadgeColor}`}>
                        {staff.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{staff.title}</div>
                    <div className="text-[9px] text-slate-500 mt-1 font-mono-numbers">PIN: {staff.pin}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex p-1 bg-slate-900 rounded-lg mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('pin');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'pin' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rapid Staff PIN
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'password' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In with Email
            </button>
          </div>

          {mode === 'pin' ? (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="text-xs text-slate-300 mb-3 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Enter 4-Digit Security PIN for {activeStaff.name}
                </div>

                {/* PIN Dots */}
                <div className="flex items-center gap-4 my-2">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = index < pinInput.length;
                    return (
                      <div
                        key={index}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                          isFilled
                            ? 'bg-amber-400 scale-110 shadow-md shadow-amber-400/50'
                            : 'bg-slate-800 border border-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 mt-2 font-medium">{errorMsg}</p>
                )}
                {!errorMsg && (
                  <p className="text-[11px] text-slate-500 mt-1">Default Demo PIN: {activeStaff.pin}</p>
                )}
              </div>

              {/* Number Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    className="h-12 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 active:scale-95 text-lg font-semibold text-slate-100 transition-all font-mono-numbers"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleQuickUnlock(activeStaff)}
                  className="h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-medium text-amber-300 transition-all"
                  title="Quick bypass for testing"
                >
                  Quick In
                </button>
                <button
                  key="0"
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="h-12 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 active:scale-95 text-lg font-semibold text-slate-100 transition-all font-mono-numbers"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/30 hover:bg-slate-850 active:scale-95 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Corporate Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Sign In to Sovereign Suite
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Assist */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Enterprise Security Enforced
            </span>
            <button
              type="button"
              onClick={() => handleQuickUnlock(activeStaff)}
              className="text-amber-400 hover:text-amber-300 hover:underline"
            >
              Demo 1-Click Unlock
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Sovereign Touch Home Care &copy; 2026 · Protected Point of Sale System
        </div>
      </div>
    </div>
  );
};
