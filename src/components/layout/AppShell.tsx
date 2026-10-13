import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AutonexaLogo } from '../brand/AutonexaLogo';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
  Send,
  History,
  Calendar,
  Flame,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface AppShellProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenGlobalSearch: () => void;
  onOpenNewLead: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  onOpenGlobalSearch,
  onOpenNewLead,
  children,
}) => {
  const { user, logout } = useAuth();
  const { leads, tasks, dealAlerts } = useData();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Compute urgent badges
  const overdueCount = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return new Date(t.dueDate).getTime() < startOfToday;
  }).length;

  const radarCount = dealAlerts.filter((a) => !a.resolved).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery', label: 'Find Businesses', icon: Search },
    { id: 'scanner', label: 'Opportunity Scanner', icon: Sparkles, badge: 'AI' },
    { id: 'leads', label: 'Leads', icon: Users, count: leads.length },
    { id: 'outreach', label: 'Outreach Workspace', icon: Send },
    { id: 'history', label: 'Contact History', icon: History },
    {
      id: 'tasks',
      label: 'Tasks & Follow-ups',
      icon: Calendar,
      badgeCount: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'radar',
      label: 'Deal Rescue Radar',
      icon: Flame,
      badgeCount: radarCount > 0 ? radarCount : undefined,
      badgeColor: 'bg-amber-500 text-white animate-pulse',
    },
    { id: 'analytics', label: 'Sales Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Current formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-[#6B7280] hover:text-[#17172A] hover:bg-[#F8F7FF] rounded-lg transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden sm:block">
            <AutonexaLogo size="sm" showTagline={false} />
          </div>
          <div className="sm:hidden">
            <AutonexaLogo size="sm" variant="icon" />
          </div>
        </div>

        {/* Center: Search trigger & Quick Actions */}
        <div className="flex items-center gap-3 flex-1 max-w-lg mx-4">
          <button
            onClick={onOpenGlobalSearch}
            className="w-full max-w-md py-1.5 px-3.5 bg-[#F8F7FF] hover:bg-[#EDE9FE]/50 border border-[#E5E7EB] hover:border-[#DDD6FE] text-[#6B7280] rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="truncate">Search leads, tasks, locations...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-[#DDD6FE] rounded text-[#6B7280] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Date, Notifications, Demo Mode, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Date */}
          <span className="hidden xl:inline-block text-xs font-semibold text-[#6B7280]">
            {todayFormatted}
          </span>

          {/* New Lead Quick Button */}
          <button
            onClick={onOpenNewLead}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#312E81] hover:bg-[#282568] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#93C5FD]" />
            New Lead
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-[#6B7280] hover:text-[#17172A] hover:bg-[#F8F7FF] rounded-lg transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {(overdueCount > 0 || radarCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-3 text-xs z-50 animate-in fade-in space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
                  <span className="font-bold text-[#17172A]">Notifications & Radar</span>
                  <span className="text-[10px] text-[#6B7280]">Pipeline Autopilot</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {radarCount > 0 && (
                    <div
                      onClick={() => {
                        onNavigate('radar');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                    >
                      <p className="font-bold text-amber-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        {radarCount} Stalled Deal Alert{radarCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        High-probability prospects risk going cold. Click to review pattern interrupts.
                      </p>
                    </div>
                  )}

                  {overdueCount > 0 && (
                    <div
                      onClick={() => {
                        onNavigate('tasks');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <p className="font-bold text-red-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        {overdueCount} Overdue Follow-up Task{overdueCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        Due dates exceeded. Click to complete or reschedule cadence.
                      </p>
                    </div>
                  )}

                  {radarCount === 0 && overdueCount === 0 && (
                    <div className="p-4 text-center text-[#6B7280] text-xs">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      All pipeline alerts up to date!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-[#F8F7FF] rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#312E81] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="font-bold text-[#17172A] block">{user?.name || 'Amulya Lakshmi'}</span>
                <span className="text-[10px] text-[#6B7280] mt-0.5 block truncate max-w-[110px]">
                  {user?.companyName || 'Nexa Growth Labs'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#17172A]" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-2 text-xs z-50 animate-in fade-in space-y-1">
                <div className="p-2 border-b border-[#F3F4F6]">
                  <p className="font-bold text-[#17172A]">{user?.name}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#F8F7FF] text-[#17172A] font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Settings & Profile
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-30 w-64 bg-[#312E81] text-white flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-100'
          }`}
        >
          {/* Navigation Links */}
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-indigo-300 uppercase">
              Sales Pipeline
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-md font-bold'
                      : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-indigo-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-[#EDE9FE] text-[#7C3AED]">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-white/15 text-white">
                        {item.count}
                      </span>
                    )}
                    {item.badgeCount !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                          item.badgeColor || 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer branding */}
          <div className="p-4 border-t border-white/10 bg-[#282568]/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-indigo-200">AUTONEXA Autopilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
            </div>
            <p className="text-[10px] text-indigo-300 leading-tight">
              Discover Smarter. Close Faster.
            </p>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
