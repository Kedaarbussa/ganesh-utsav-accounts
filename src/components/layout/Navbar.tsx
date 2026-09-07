import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFestival } from '../../context/FestivalContext';
import { LogOut, Calendar, Building2, User as UserIcon, Shield, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { festivals, activeFestival, setActiveFestivalId } = useFestival();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand logo & Mobile menu toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ganesh-600 via-ganesh-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-ganesh-600/30">
              🪔
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-ganesh-700 to-amber-600 bg-clip-text text-transparent leading-none">
                GANESH UTSAV
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                {activeFestival?.apartmentName || 'APARTMENT ACCOUNTS'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Active Year Selector, User Info & Logout */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Active Festival Selector */}
          <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg px-2 sm:px-3 py-1.5">
            <Calendar className="w-4 h-4 text-ganesh-600 mr-1.5 hidden sm:inline" />
            <select
              value={activeFestival?._id || ''}
              onChange={(e) => setActiveFestivalId(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-ganesh-800 focus:outline-none cursor-pointer"
            >
              {festivals.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.festivalName} {f.year}
                </option>
              ))}
            </select>
          </div>

          {/* User Badge */}
          <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 flex items-center">
                {user?.fullName}
                {isAdmin && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-ganesh-600 text-white rounded">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500">@{user?.username}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
