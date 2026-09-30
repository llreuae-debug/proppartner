import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  UserSquare2, 
  Share2, 
  ExternalLink,
  Plus,
  FileText,
  Sliders,
  Palette,
  MessageSquare,
  Wallet,
  BarChart3,
  Globe,
  Stethoscope,
  Shield
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Sidebar({ activeTab, onSelectTab, onOpenQR }) {
  const { t, isRTL } = useLanguage();
  const { currentDoctor } = useAuth();
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    api.getMessageStats()
      .then(res => {
        if (res?.failedCount) setFailedCount(res.failedCount);
      })
      .catch(() => {});
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients Directory', icon: Users },
    { id: 'prescriptions', label: 'Visits & Prescriptions', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: CalendarClock },
    { id: 'ledger', label: 'Doctor Ledger', icon: Wallet },
    { id: 'reports', label: 'Practice Reports', icon: BarChart3 },
    { 
      id: 'messages', 
      label: 'WhatsApp & Messages', 
      icon: MessageSquare, 
      badge: failedCount > 0 ? `${failedCount} Failed` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'pdf-settings', label: 'Letterhead & PDF', icon: Palette },
    { id: 'profile', label: 'Doctor Profile & Settings', icon: UserSquare2 },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 min-h-[calc(100vh-4rem)] transition-colors">
        
        {/* Practice Status Card */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 text-white shadow-md shadow-teal-700/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-teal-300" /> Private Portal
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              Doctor Isolated
            </span>
          </div>
          <p className="text-xs text-teal-50 font-medium leading-relaxed truncate">
            {currentDoctor?.clinicName || 'DocCare Medical Clinic'}
          </p>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-teal-200">
            <span>Fee: PKR {currentDoctor?.consultationFee?.toLocaleString()}</span>
            <span className="font-mono">PMDC #{currentDoctor?.pmdcNumber}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Public Directory Preview Switcher */}
        <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={() => onSelectTab('public-directory')}
            className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Public Patient Directory</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>

      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'appointments', label: 'Slots', icon: CalendarClock },
          { id: 'prescriptions', label: 'Rx Writer', icon: FileText },
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'ledger', label: 'Ledger', icon: Wallet },
          { id: 'reports', label: 'Reports', icon: BarChart3 }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-700 dark:text-teal-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
