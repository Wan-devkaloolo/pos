import React from 'react';
import { 
  BarChart3, 
  Users, 
  CalendarDays, 
  Receipt, 
  Award, 
  SendHorizontal, 
  Database, 
  Zap, 
  Building2,
  ExternalLink,
  CheckSquare,
  Lock,
  Shield,
  MapPin,
  Calculator
} from 'lucide-react';
import { StaffProfile, ROLE_PERMISSIONS } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingFollowUpsCount: number;
  newLeadsCount: number;
  activeStaff: StaffProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingFollowUpsCount,
  newLeadsCount,
  activeStaff,
}) => {
  const safeRole = (activeStaff && (activeStaff.role === 'Admin' || activeStaff.role === 'Manager' || activeStaff.role === 'Staff'))
    ? activeStaff.role
    : 'Admin';
  const perms = ROLE_PERMISSIONS[safeRole] || ROLE_PERMISSIONS.Admin;

  // All nav items with their permission checks
  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Reporting & KPIs',
      icon: BarChart3,
      badge: null,
      isAllowed: perms.canViewReporting,
      requiredRole: 'Manager or Admin',
    },
    {
      id: 'tasks',
      label: activeStaff.role === 'Staff' ? 'My Client Tasks' : 'Field Operations & Tasks',
      icon: CheckSquare,
      badge: 'Kampala',
      isAllowed: perms.canManageTasks,
      requiredRole: 'All Roles',
    },
    {
      id: 'clients',
      label: 'Client Directory & Notes',
      icon: Building2,
      badge: null,
      isAllowed: perms.canViewClients,
      requiredRole: 'All Roles',
    },
    {
      id: 'scheduling',
      label: 'Scheduling & Dispatch',
      icon: CalendarDays,
      badge: null,
      isAllowed: perms.canManageScheduling,
      requiredRole: 'Manager or Admin',
    },
    {
      id: 'pipeline',
      label: 'CRM Leads & Pipeline',
      icon: Users,
      badge: newLeadsCount > 0 ? `${newLeadsCount} New` : null,
      isAllowed: perms.canViewCRM,
      requiredRole: 'Manager or Admin',
    },
    {
      id: 'quoter',
      label: 'STHC Quoter & Site Audit',
      icon: Calculator,
      badge: 'Margin Guard',
      isAllowed: perms.canManageQuoter,
      requiredRole: 'Manager or Admin',
    },
    {
      id: 'quality',
      label: 'Service Quality (QA)',
      icon: Award,
      badge: null,
      isAllowed: perms.canPerformQA,
      requiredRole: 'All Roles',
    },
    {
      id: 'followups',
      label: 'Automated Follow-ups',
      icon: SendHorizontal,
      badge: pendingFollowUpsCount > 0 ? `${pendingFollowUpsCount} Due` : null,
      isAllowed: perms.canManageFollowUps,
      requiredRole: 'Manager or Admin',
    },
    {
      id: 'pos',
      label: 'Point of Sale (POS)',
      icon: Zap,
      badge: 'Quick Book',
      isAllowed: perms.canAccessPOS,
      requiredRole: 'Admin Only',
    },
    {
      id: 'invoices',
      label: 'Invoices & Billing',
      icon: Receipt,
      badge: null,
      isAllowed: perms.canManageInvoices,
      requiredRole: 'Admin Only',
    },
    {
      id: 'supabase',
      label: 'Supabase & GitHub Sync',
      icon: Database,
      badge: 'Cloud DB',
      isAllowed: perms.canManageSupabaseSync,
      requiredRole: 'Admin Only',
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
      {/* Brand Sub-Banner with Kampala Location */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Sovereign Touch
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Sales Management System
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-400/80" />
              <span>Kampala Operations (Kololo)</span>
            </div>
          </div>
          <a
            href="https://sovereigntouchhomecare.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-amber-400 transition-colors p-1"
            title="sovereigntouchhomecare.com"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-3 pt-3 pb-1">
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400">Role:</span>
            <span className="font-bold text-white">{activeStaff.role}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-numbers">
            {activeStaff.role === 'Admin' ? 'Full Access' : activeStaff.role === 'Manager' ? 'Reports/Dispatch' : 'Client Tasks'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = item.isAllowed;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : isAllowed
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-400 hover:bg-slate-950 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-amber-400' : isAllowed ? 'text-slate-500' : 'text-slate-600'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isAllowed && (
                  <span title={`Requires ${item.requiredRole}`} className="flex items-center">
                    <Lock className="w-3 h-3 text-slate-600" />
                  </span>
                )}
                {item.badge && (
                  <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Property Focus Tagline */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          Kampala Premium Estates
        </div>
        <div className="text-[10px] leading-relaxed">
          White-glove housekeeping & scheduling for residences in Kololo, Nakasero, Muyenga & Munyonyo.
        </div>
      </div>
    </aside>
  );
};
