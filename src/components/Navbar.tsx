import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  Briefcase,
  FileText,
  Compass,
  Send,
  Calendar,
  Sparkles,
  Bell,
  Mail,
  BarChart3,
  HelpCircle,
  LogOut,
  UserCheck,
  Trash2,
  CheckCircle2,
  Sun,
  Moon,
  Zap,
  Radio,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem } from '../types.ts';
import { GmailAuthModal } from './GmailAuthModal.tsx';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: number) => void;
  onOpenAssistant: () => void;
  resumesCount: number;
  applicationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead,
  onOpenAssistant,
  resumesCount,
  applicationsCount,
}) => {
  const { user, signInWithGoogle, switchUser, logout, deleteAccount, isGmailConnected, gmailAddress } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'resumes', label: 'Resumes', icon: FileText, badge: resumesCount },
    { id: 'applications', label: 'Applications', icon: Send, badge: applicationsCount },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'email-sync', label: 'Gmail & Alerts', icon: Mail },
    { id: 'answer-bank', label: 'Answer Bank', icon: HelpCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteConfirm(false);
      setShowUserMenu(false);
    } catch (e: any) {
      alert('Error deleting account: ' + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header
        id="main-header"
        className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 shadow-xs dark:shadow-slate-950/40"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* 1. Logo & Brand with Live Active Engine Glow */}
            <div className="flex items-center space-x-2.5 flex-shrink-0">
              <div
                className="flex items-center space-x-2.5 cursor-pointer group active:scale-[0.97] transition-transform duration-150"
                onClick={() => setActiveTab('dashboard')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-blue-600 dark:via-indigo-600 dark:to-blue-700 flex items-center justify-center text-white shadow-sm font-bold text-base sm:text-lg tracking-tight group-hover:shadow-indigo-500/25 transition-all">
                  CH
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                      CareerHub
                    </span>
                    {/* PRO AI Badge with Shimmer */}
                    <span className="shimmer-badge text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-xs shadow-blue-500/30">
                      PRO AI
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[90px] sm:max-w-none">
                      Unified Career Platform
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Main Navigation Rail - Always Visible on Tablet & Desktop (md and up) */}
            <nav
              id="desktop-navbar"
              aria-label="Main Navigation"
              className="hidden md:flex items-center space-x-0.5 lg:space-x-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto no-scrollbar max-w-2xl lg:max-w-none"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 bg-slate-900 dark:bg-blue-600 rounded-xl shadow-xs"
                        transition={{ type: 'spring', stiffness: 480, damping: 35 }}
                      />
                    )}
                    <Icon className="relative z-10 w-3.5 h-3.5 flex-shrink-0" />
                    <span className="relative z-10 tracking-tight">{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`relative z-10 ml-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* 3. Right Action Controls: Gmail Authentication Pill, AI Assistant, Theme, Notifications & User */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              {/* Prominent Gmail Authentication & Live Alert Status Pill */}
              <button
                id="gmail-auth-status-button"
                onClick={() => setShowGmailModal(true)}
                className="group relative flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 text-xs font-semibold shadow-xs active:scale-[0.96] transition-all"
                title="Click to manage Gmail authentication and live notification alert delivery"
              >
                {/* Official Google G SVG Icon */}
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>

                <div className="flex items-center space-x-1.5">
                  <span className="hidden xl:inline text-[11px] font-medium text-slate-700 dark:text-slate-300 max-w-[130px] truncate">
                    {user?.email || 'raghavendraillale@gmail.com'}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="hidden sm:inline">Gmail Alerts Live</span>
                    <span className="sm:hidden">Gmail</span>
                  </span>
                </div>
              </button>

              {/* AI Career Assistant Button with Shimmer & Pulse Glow */}
              <button
                id="ai-assistant-button"
                onClick={onOpenAssistant}
                className="shimmer-badge relative flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-blue-500/25 active:scale-[0.96] hover:scale-[1.02] transition-all animate-pulse-glow"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden lg:inline tracking-tight">AI Assistant</span>
              </button>

              {/* Theme Toggle Button (Light / Dark) */}
              <button
                id="theme-toggle-button"
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-[0.92] transition-all duration-150"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  id="notifications-toggle"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-[0.92] transition-all duration-150"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-fade-in-up">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        Notifications & Alerts
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          No notifications right now.
                        </p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => onMarkNotificationRead(n.id)}
                            className={`py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition ${
                              !n.isRead ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {n.title}
                              </h4>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          setShowGmailModal(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Manage Gmail Alert Dispatches</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile / Account Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    id="user-menu-button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-1.5 p-1 sm:pl-2 sm:pr-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.96] transition-all duration-150"
                  >
                    <div className="relative">
                      <img
                        src={
                          user.photoURL ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`
                        }
                        alt={user.displayName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 animate-fade-in-up">
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                        <div className="mt-1.5 flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          <span>Gmail Verified & Alerts Active</span>
                        </div>
                      </div>

                      <div className="py-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowGmailModal(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-semibold transition flex items-center space-x-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Gmail Alerts & Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition"
                        >
                          Edit Professional Profile
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('resumes');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition"
                        >
                          Manage Resumes ({resumesCount})
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                          Log Out
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full flex items-center px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg font-medium transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                          Delete Account & Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="sign-in-button"
                  onClick={signInWithGoogle}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.96] transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}

              {/* Mobile Hamburger Button (< md) */}
              <button
                id="mobile-nav-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Mobile Slide-Down Menu for Small Screens (< md) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-1 shadow-lg"
            >
              {/* Mobile Gmail Status Row */}
              <div
                onClick={() => {
                  setShowGmailModal(true);
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 mb-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {user?.email || 'raghavendraillale@gmail.com'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 5. Mobile Bottom Quick Nav Bar for Phone viewports (< sm) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {[
          { id: 'dashboard', label: 'Home', icon: Compass },
          { id: 'jobs', label: 'Jobs', icon: Briefcase },
          { id: 'resumes', label: 'Resumes', icon: FileText },
          { id: 'applications', label: 'Apps', icon: Send },
          { id: 'email-sync', label: 'Gmail', icon: Mail },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Gmail Authentication & Test Alerts Modal */}
      <GmailAuthModal
        isOpen={showGmailModal}
        onClose={() => setShowGmailModal(false)}
        onAlertSent={() => {
          // Trigger any refresh if needed
        }}
      />

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Account & Wipe Data?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              This will permanently delete all your resumes, applications, ATS analyses, timeline
              history, and profile records from the PostgreSQL database. This action cannot be
              undone.
            </p>
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.96] transition"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl active:scale-[0.96] transition"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
