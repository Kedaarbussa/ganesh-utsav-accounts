import React from 'react';
import { LayoutDashboard, Wallet, Gift, Receipt, FileCheck } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
}) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'funds', label: 'Funds', icon: Wallet },
    { id: 'quickadd', label: 'Add', isFab: true },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'final-report', label: 'Final', icon: FileCheck },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1 lg:hidden">
      <div className="flex items-center justify-around">
        {items.map((item, idx) => {
          if (item.isFab) {
            return (
              <button
                key="fab"
                onClick={onOpenQuickAdd}
                className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-ganesh-600 via-ganesh-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-ganesh-600/40 text-2xl font-black active:scale-95 transition-transform"
                title="Quick Add Transaction"
              >
                +
              </button>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-ganesh-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-ganesh-600' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
