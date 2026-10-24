import React, { useState } from 'react';
import { StaffProfile, SupabaseConfig, UserRole } from '../types';
import { Sparkles, Zap, Lock, Database, ChevronDown, CheckCircle2, CalendarDays, Check } from 'lucide-react';

interface HeaderProps {
  activeStaff: StaffProfile;
  staffList: StaffProfile[];
  onSelectStaff: (staff: StaffProfile) => void;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenPOSModal: () => void;
  onLockScreen: () => void;
  supabaseConfig: SupabaseConfig;
}

export const Header: React.FC<HeaderProps> = ({
  activeStaff,
  staffList,
  onSelectStaff,
  activeTab,
  onNavigateTab,
  onOpenPOSModal,
  onLockScreen,
  supabaseConfig,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const safeRole = (activeStaff && (activeStaff.role === 'Admin' || activeStaff.role === 'Manager' || activeStaff.role === 'Staff'))
    ? activeStaff.role
    : 'Admin';

  // Role badge color
  const roleBadgeStyle = 
    safeRole === 'Admin' ? 'text-amber-400 bg-amber-500/10 border-amber-500/40' :
    safeRole === 'Manager' ? 'text-sky-400 bg-sky-500/10 border-sky-500/40' :
    'text-emerald-400 bg-emerald-500/10 border-emerald-500/40';

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0b0f17] border-b border-slate-800/80 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <button
          onClick={() => onNavigateTab(activeStaff.role === 'Staff' ? 'tasks' : 'dashboard')}
          className="text-base font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 font-serif-luxury"
        >
          Sovereign Touch Home Care
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line navigation links filtered by Role */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        {/* Admin & Manager can see Reporting */}
        {(activeStaff.role === 'Admin' || activeStaff.role === 'Manager') && (
          <button
            onClick={() => onNavigateTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'dashboard' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            KPI Reporting
          </button>
        )}

        {/* Staff dedicated tasks view */}
        <button
          onClick={() => onNavigateTab('tasks')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'tasks' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          {activeStaff.role === 'Staff' ? 'My Client Tasks' : 'Field Tasks'}
        </button>

        {/* Client Directory (Staff, Manager, Admin) */}
        <button
          onClick={() => onNavigateTab('clients')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'clients' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Client Directory
        </button>

        {/* Manager & Admin see Scheduling */}
        {(activeStaff.role === 'Admin' || activeStaff.role === 'Manager') && (
          <button
            onClick={() => onNavigateTab('scheduling')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'scheduling' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Dispatch Schedule
          </button>
        )}

        {/* Manager & Admin see CRM */}
        {(activeStaff.role === 'Admin' || activeStaff.role === 'Manager') && (
          <button
            onClick={() => onNavigateTab('pipeline')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'pipeline' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            CRM Leads
          </button>
        )}

        {/* Manager & Admin see STHC Quoter */}
        {(activeStaff.role === 'Admin' || activeStaff.role === 'Manager') && (
          <button
            onClick={() => onNavigateTab('quoter')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'quoter' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <span>STHC Quoter</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Guard</span>
          </button>
        )}

        {/* Admin only: Invoices & Billing */}
        {activeStaff.role === 'Admin' && (
          <button
            onClick={() => onNavigateTab('invoices')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'invoices' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Invoices & Ledger
          </button>
        )}

        {/* Quality QA for all */}
        <button
          onClick={() => onNavigateTab('quality')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'quality' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Quality QA
        </button>

        {/* Admin only: Supabase Sync */}
        {activeStaff.role === 'Admin' && (
          <button
            onClick={() => onNavigateTab('supabase')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'supabase' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Sync</span>
            {supabaseConfig.isConnected ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" title="Offline" />
            )}
          </button>
        )}
      </nav>

      {/* Zone 3: 1 primary action + Staff Switcher & Lock */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role & Staff Profile Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors text-xs"
          >
            <div>
              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span>{activeStaff.name.split(' ')[0]}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold ${roleBadgeStyle}`}>
                  {activeStaff.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono-numbers truncate">
                Kampala HQ
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switch Role Dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Switch Role / Staff User
              </div>
              {staffList.map((staff) => {
                const isCurrent = staff.id === activeStaff.id;
                return (
                  <button
                    key={staff.id}
                    onClick={() => {
                      onSelectStaff(staff);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/10 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{staff.name}</div>
                      <div className="text-[10px] text-slate-400">{staff.title}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
                        {staff.role}
                      </span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lock Screen */}
        <button
          onClick={onLockScreen}
          title="Lock Suite (Require PIN)"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>

        {/* Role-Sensitive Primary Action */}
        {activeStaff.role === 'Admin' ? (
          <button
            onClick={onOpenPOSModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Rapid POS Intake</span>
          </button>
        ) : activeStaff.role === 'Manager' ? (
          <button
            onClick={() => onNavigateTab('scheduling')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-sky-400 to-sky-500 rounded-lg hover:from-sky-300 hover:to-sky-400 shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Dispatch Schedule</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigateTab('tasks')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg hover:from-emerald-300 hover:to-emerald-400 shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Field Tasks</span>
          </button>
        )}
      </div>
    </header>
  );
};
