import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    {
      section: 'Overview',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/alerts', label: 'Alerts', icon: '🔔' },
      ]
    },
    {
      section: 'Inventory',
      items: [
        { path: '/inventory', label: 'Manage Inventory', icon: '💊' },
        { path: '/view-inventory', label: 'View Inventory', icon: '📋' },
      ]
    },
    {
      section: 'Billing',
      items: [
        { path: '/generate-bill', label: 'Generate Bill', icon: '🧾' },
        { path: '/purchase-bill', label: 'Purchase Bill', icon: '📦' },
        { path: '/sell-bill', label: 'Sale Bill', icon: '💰' },
      ]
    },
    {
      section: 'Returns',
      items: [
        { path: '/return-bill', label: 'Return Options', icon: '🔄' },
        { path: '/purchase-return', label: 'Purchase Return', icon: '↩️' },
        { path: '/sale-return', label: 'Sale Return', icon: '↪️' },
      ]
    },
    {
      section: 'Expiry',
      items: [
        { path: '/expiry-bill', label: 'Expiry Bills', icon: '⏰' },
        { path: '/expiry/client', label: 'Client Expiry', icon: '📤' },
        { path: '/expiry-bill/supplier', label: 'Supplier Expiry', icon: '🏭' },
      ]
    },
    {
      section: 'Reports',
      items: [
        { path: '/medicine-sales-summary', label: 'Sales Report', icon: '📈' },
        { path: '/purchase-history', label: 'Purchase History', icon: '🕰️' },
        { path: '/party-invoices', label: 'Party Invoices', icon: '🔍' },
        { path: '/forecasting', label: 'Smart Forecasting', icon: '📈' },
      ]
    },
  ];

  const role = localStorage.getItem('role') || 'user';
  if (role === 'admin') {
      menuItems.find(m => m.section === 'Reports').items.push(
          { path: '/activity-logs', label: 'Activity Logs', icon: '📝' }
      );
  }

  const isActive = (path) => location.pathname === path;

  const sidebarContent = (
    <div className={`flex flex-col h-full ${isDark ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
      {/* Logo */}
      <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <span className="text-2xl">💊</span>
            <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
              MedInventory
            </h1>
          </motion.div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg hidden lg:block ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((group) => (
          <div key={group.section} className="mb-3">
            {isOpen && (
              <p className={`px-3 mb-1 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {group.section}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(item.path)
                    ? isDark
                      ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                      : 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : isDark
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-yellow-400' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-700'}`}
        >
          <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
          {isOpen && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
        >
          <span className="text-lg">🚪</span>
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block flex-shrink-0 shadow-lg transition-all duration-300 ${isOpen ? 'w-[260px]' : 'w-[72px]'}`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`flex items-center justify-between px-4 py-3 shadow-sm lg:px-6 ${isDark ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-100'} transition-colors`}>
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className={`p-2 rounded-lg lg:hidden ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Home / </span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {location.pathname.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Dashboard'}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-950' : 'bg-gray-50'} transition-colors`}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
