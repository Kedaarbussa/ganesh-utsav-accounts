import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  Gift,
  Receipt,
  History,
  Building,
  FileSpreadsheet,
  FileCheck,
  Users,
  Settings,
  Activity,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'funds', label: 'Funds Received', icon: Wallet },
    { id: 'sponsorships', label: 'Sponsorships', icon: Gift },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'flat-contributions', label: 'Flat Contributions', icon: Building },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'final-report', label: 'Final Report', icon: FileCheck, highlight: true },
  ];

  if (isAdmin) {
    navItems.push(
      { id: 'users', label: 'Users', icon: Users },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'activity-logs', label: 'Activity Logs', icon: Activity }
    );
  }

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 lg:hidden">
          <span className="font-extrabold text-ganesh-700 tracking-wide">NAVIGATION</span>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Main Accounting
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-ganesh-600 to-amber-600 text-white shadow-md shadow-ganesh-600/30 font-bold'
                      : 'bg-ganesh-50 text-ganesh-700 font-bold border-l-4 border-ganesh-600 pl-2.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? (item.highlight ? 'text-white' : 'text-ganesh-600') : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 rounded">
                    Key
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
