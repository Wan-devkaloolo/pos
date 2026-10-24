import React from 'react';
import { StaffProfile, UserRole } from '../types';
import { ShieldAlert, Lock, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

interface AccessDeniedViewProps {
  activeStaff: StaffProfile;
  attemptedFeature: string;
  requiredRole: 'Admin' | 'Manager or Admin';
  onGoToPermittedTab: () => void;
  onRequestSwitchProfile: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  activeStaff,
  attemptedFeature,
  requiredRole,
  onGoToPermittedTab,
  onRequestSwitchProfile,
}) => {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Role-Based Access Control Enforced
          </span>
          <h3 className="text-xl font-serif-luxury font-bold text-white mt-1">
            Access Restricted
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Your current assigned role of <strong className="text-amber-400 font-semibold">{activeStaff.role}</strong> does not have permission to access <strong className="text-slate-200 font-semibold">{attemptedFeature}</strong>.
          </p>
        </div>

        {/* Roles Matrix Comparison */}
        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-800">
            <span>Your Profile:</span>
            <span className="text-slate-200 font-medium">{activeStaff.name} ({activeStaff.role})</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Required Authorization:</span>
            <span className="text-amber-400 font-semibold">{requiredRole}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Kampala Branch:</span>
            <span className="text-slate-300 font-mono-numbers">{activeStaff.branch}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={onRequestSwitchProfile}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Switch Role / Enter Admin PIN</span>
          </button>

          <button
            type="button"
            onClick={onGoToPermittedTab}
            className="w-full py-2 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Permitted Workspace</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 pt-1">
          Sovereign Touch Home Care Kampala · Enterprise RBAC Security
        </div>
      </div>
    </div>
  );
};
