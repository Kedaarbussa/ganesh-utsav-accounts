import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FestivalProvider } from './context/FestivalContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { QuickAddModal } from './components/layout/QuickAddModal';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FundsReceived } from './pages/FundsReceived';
import { Sponsorships } from './pages/Sponsorships';
import { Expenses } from './pages/Expenses';
import { Transactions } from './pages/Transactions';
import { FlatContributions } from './pages/FlatContributions';
import { Reports } from './pages/Reports';
import { FinalReport } from './pages/FinalReport';
import { UsersPage } from './pages/Users';
import { SettingsPage } from './pages/Settings';
import { ActivityLogsPage } from './pages/ActivityLogs';

import { FundModal } from './components/modals/FundModal';
import { SponsorshipModal } from './components/modals/SponsorshipModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { useFestival } from './context/FestivalContext';

const MainContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { activeFestival, loading: festLoading } = useFestival();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick Add Trigger
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<'fund' | 'sponsorship' | 'expense' | null>(null);

  if (authLoading || festLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-ganesh-600 to-amber-500 text-white flex items-center justify-center text-3xl mx-auto animate-pulse">
            🪔
          </div>
          <p className="text-amber-200 text-xs font-bold uppercase tracking-widest">Loading Ganesh Utsav Accounts...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar & Mobile drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenQuickAdd={() => setQuickAddOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'funds' && <FundsReceived />}
          {activeTab === 'sponsorships' && <Sponsorships />}
          {activeTab === 'expenses' && <Expenses />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'flat-contributions' && <FlatContributions />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'final-report' && <FinalReport />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'activity-logs' && <ActivityLogsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
      />

      {/* Quick Add Selection Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSelectOption={(type) => setActiveModalType(type)}
      />

      {/* Individual Action Modals */}
      {activeModalType === 'fund' && (
        <FundModal
          isOpen={true}
          onClose={() => setActiveModalType(null)}
          onSuccess={() => {
            // refresh data
            window.dispatchEvent(new Event('refresh_data'));
          }}
          festivalId={activeFestival?._id || ''}
        />
      )}

      {activeModalType === 'sponsorship' && (
        <SponsorshipModal
          isOpen={true}
          onClose={() => setActiveModalType(null)}
          onSuccess={() => {
            window.dispatchEvent(new Event('refresh_data'));
          }}
          festivalId={activeFestival?._id || ''}
        />
      )}

      {activeModalType === 'expense' && (
        <ExpenseModal
          isOpen={true}
          onClose={() => setActiveModalType(null)}
          onSuccess={() => {
            window.dispatchEvent(new Event('refresh_data'));
          }}
          festivalId={activeFestival?._id || ''}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FestivalProvider>
        <MainContent />
      </FestivalProvider>
    </AuthProvider>
  );
};

export default App;
