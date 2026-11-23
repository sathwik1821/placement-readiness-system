import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { PORTAL_OPTIONS } from './PortalSelector';

export default function PortalSelectionModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Institutional Access Control</span>
            </span>
            <h3 className="text-xl font-black text-white">
              Select Your Access Persona
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your institutional role to continue to your dedicated authentication portal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PORTAL_OPTIONS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.roleId}
                onClick={() => {
                  onClose();
                  navigate(portal.path);
                }}
                className={`group p-4 rounded-2xl bg-slate-950 border border-slate-800 ${portal.hoverBorder} hover:bg-slate-950/90 transition-all cursor-pointer flex flex-col justify-between shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${portal.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${portal.badgeColor}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {portal.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {portal.subtitle}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {portal.emailRule}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Login</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-500">
            RGUKT Placement Ecosystem • Protected by Spring Security RBAC
          </p>
        </div>
      </div>
    </div>
  );
}
