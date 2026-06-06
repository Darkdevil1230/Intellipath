import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  BookOpen,
  FolderOpen,
  MessageSquare,
  ClipboardList,
  Briefcase,
  Users,
  User,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Layout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, darkMode, setDarkMode } = useAuthStore();
  const safeSetDarkMode = typeof setDarkMode === 'function' ? setDarkMode : () => {};

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/roadmap', icon: Map, label: 'Roadmap' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/resources', icon: FolderOpen, label: 'Resources' },
    { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/assessments', icon: ClipboardList, label: 'Assessments' },
    { path: '/careers', icon: Briefcase, label: 'Careers' },
    { path: '/mentors', icon: Users, label: 'Mentors' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        <aside className={`flex flex-col flex-shrink-0 ${collapsed ? 'w-20' : 'w-72'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 min-h-screen`}>
          <div className="flex flex-col justify-between min-h-screen py-6">
            <div>
              <div className={`flex items-center px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold">
                    I
                  </div>
                  {!collapsed && (
                    <div>
                      <h1 className="text-2xl font-bold text-primary-600">IntelliPath</h1>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Personalized learning
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setCollapsed((prev) => !prev)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </button>
              </div>

              <nav className="mt-10 space-y-2 px-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className={`${collapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 px-2">
              <Link
                to="/profile"
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${collapsed ? 'justify-center' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
              >
                <User className="w-5 h-5" />
                <span className={`${collapsed ? 'hidden' : 'block'}`}>Profile</span>
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${collapsed ? 'justify-center' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
              >
                <Settings className="w-5 h-5" />
                <span className={`${collapsed ? 'hidden' : 'block'}`}>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center' : ''}`}
              >
                <LogOut className="w-5 h-5" />
                <span className={`${collapsed ? 'hidden' : 'block'}`}>Logout</span>
              </button>
              <button
                onClick={() => safeSetDarkMode(!darkMode)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${collapsed ? 'justify-center' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
              >
                <span className="w-5 h-5 flex items-center justify-center">{collapsed ? (darkMode ? '☀' : '🌙') : null}</span>
                <span className={`${collapsed ? 'hidden' : 'block'}`}>{darkMode ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-h-screen flex flex-col">
          <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-primary-600">IntelliPath</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            {children || <Outlet />}
          </main>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary-600">Menu</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Navigate sections</p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-8 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
                <button
                  onClick={() => {
                    safeSetDarkMode(!darkMode);
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <span>{darkMode ? '☀' : '🌙'}</span>
                  <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
