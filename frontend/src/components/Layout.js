import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Pill, 
  Hospital, 
  ShieldCheck, 
  FileText, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Receipt, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Boxes, 
  Stethoscope,
  Clock,
  ChevronRight,
  Database,
  Building2,
  Lock,
  Search,
  Users,
  Printer,
  Sparkles,
  ShoppingCart,
  Package,
  RefreshCw,
  Bell,
  BarChart3,
  X,
  Menu,
  Check,
  HelpCircle
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const QUICK_PERSONAS = [
  {
    role: 'admin',
    title: 'Medical Store Owner',
    email: 'vikramaadarsh2001@gmail.com',
    password: '12345',
    icon: '👑',
    storeName: 'Aadarsh Super Specialty Medicos',
    description: 'See total sales, profit, stock & reports',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    role: 'manager',
    title: 'Store Manager',
    email: 'vikramaadarsh1999@gmail.com',
    password: '12345',
    icon: '🩺',
    storeName: 'Aadarsh Pharmacy Retail Hub',
    description: 'Add new stock, manage bills & returns',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    role: 'user',
    title: 'Billing Staff / Cashier',
    email: 'ashishkumar57060@gmail.com',
    password: '12345',
    icon: '💼',
    storeName: 'Ashish Medicos & Surgical',
    description: 'Make customer bills & print receipts',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
];

const Layout = () => {
  const navigate = useNavigate();
  const [activePersonaLoading, setActivePersonaLoading] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'modules', label: 'Modules' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About' },
  ];

  const scrollToSection = (e, id) => {
    if (e) e.preventDefault();
    setActiveNav(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -85; // navbar height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  // Scroll spy to highlight active nav link on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'pricing', 'modules', 'features', 'home'];
      const scrollPos = window.scrollY + 120;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && scrollPos >= el.offsetTop) {
          setActiveNav(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle URL hash on initial page mount
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const yOffset = -85;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          setActiveNav(id);
        }, 150);
      }
    }
  }, []);

  const handleQuickLogin = async (persona) => {
    setActivePersonaLoading(persona.role);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email: persona.email,
        password: persona.password
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', persona.email.toLowerCase());
        localStorage.setItem('role', response.data.role || persona.role);
        localStorage.setItem('name', response.data.user?.name || persona.title);
        localStorage.setItem('pharmacyName', response.data.pharmacyName || persona.storeName);
        setShowDemoModal(false);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Quick login failed:', err);
      navigate('/login');
    } finally {
      setActivePersonaLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      
      {/* Top Forest Green Notification Bar matching screenshot */}
      <div className="bg-[#03473d] text-white px-4 py-2 text-xs font-medium border-b border-[#023830]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3 flex-wrap">
            <span className="bg-[#075c50] text-emerald-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide">
              PHARMACY CARE
            </span>
            <span className="text-emerald-100 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-300">✓</span> Easy GST Billing (CGST &amp; SGST)
            </span>
            <span className="text-emerald-100 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-300">✓</span> Expiry Alerts
            </span>
            <span className="text-emerald-100 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-300">✓</span> Batch Stock Tracking
            </span>
            <span className="text-emerald-100 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-300">✓</span> Prescription Safety
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-emerald-100">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              3,760+ Ready Medicines Loaded
            </span>
          </div>
        </div>
      </div>

      {/* Main Medical Navbar matching screenshot */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Brand Logo & Pharmacy Management Software Pill */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#00796b] text-white flex items-center justify-center shadow-sm group-hover:bg-[#00695c] transition">
                <Pill className="w-6 h-6 transform -rotate-45" />
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  MedInventory
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#e0f2f1] text-[#00695c] border border-[#b2dfdb]">
                  Pharmacy Management Software
                </span>
              </div>
            </Link>

            {/* Menu Links with Active Tab State and Smooth Scrolling */}
            <div className="hidden lg:flex items-center space-x-8 text-sm font-medium">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    activeNav === link.id
                      ? 'bg-[#e0f2f1] text-[#00695c]'
                      : 'text-slate-600 hover:text-[#00796b]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Action Buttons & Mobile Toggle */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="hidden sm:inline-block px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#00796b] hover:bg-[#00695c] rounded-xl shadow-sm transition flex items-center space-x-1.5"
              >
                <span>Open Medical Portal</span>
                <span>→</span>
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#00796b] hover:bg-slate-100 transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`block w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeNav === link.id
                    ? 'bg-[#e0f2f1] text-[#00695c]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section matching screenshot layout */}
      <section id="home" className="pt-12 pb-16 bg-gradient-to-b from-white via-slate-50/40 to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column (Copy + Buttons + Highlights) */}
            <div className="lg:col-span-5 text-left">
              <h1 className="text-4xl sm:text-[46px] font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-4">
                Simple &amp; Fast Software for Your <br className="hidden sm:inline" />
                <span className="text-[#00796b]">Medical Store &amp; Pharmacy</span>
              </h1>

              <p className="text-base text-slate-600 leading-relaxed mb-8 max-w-lg">
                Manage medicine stock, generate bills, track expiry, handle purchases and sales — all in one easy and reliable software.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl bg-[#00796b] hover:bg-[#00695c] text-white font-bold text-sm shadow-md shadow-teal-700/20 transition flex items-center space-x-2 group"
                >
                  <span>Get Started Free</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-2xs transition flex items-center space-x-2"
                >
                  <span className="text-[#00796b] font-serif">▷</span>
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* 4 Feature Pills */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                  <span className="text-amber-500">⚡</span> Fast Billing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                  <span className="text-teal-600">📦</span> Stock &amp; Batch
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                  <span className="text-rose-500">🔔</span> Expiry Alerts
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                  <span className="text-emerald-600">🛡️</span> GST Compliant
                </span>
              </div>
            </div>

            {/* Right Column (Floating App Mockup Card) */}
            <div className="lg:col-span-7">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
                
                <div className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/80 p-4 sm:p-5 overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4">
                    
                    {/* Mini Sidebar */}
                    <div className="w-full sm:w-36 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 pr-0 sm:pr-3 pb-3 sm:pb-0 space-y-1">
                      <div className="flex items-center space-x-2 px-2 py-1.5 mb-2">
                        <Pill className="w-4 h-4 text-[#00796b] transform -rotate-45" />
                        <span className="text-xs font-extrabold text-slate-900">MedInventory</span>
                      </div>
                      
                      <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
                        <div className="px-2.5 py-1.5 rounded-lg bg-[#e0f2f1] text-[#00695c] font-bold text-xs flex items-center gap-2 whitespace-nowrap">
                          <span>🏠</span> Dashboard
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-slate-600 text-xs flex items-center gap-2 whitespace-nowrap hover:bg-slate-50">
                          <span>📦</span> Inventory
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-slate-600 text-xs flex items-center gap-2 whitespace-nowrap hover:bg-slate-50">
                          <span>🧾</span> Sales Billing
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-slate-600 text-xs flex items-center gap-2 whitespace-nowrap hover:bg-slate-50">
                          <span>🛍️</span> Purchase
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-slate-600 text-xs flex items-center gap-2 whitespace-nowrap hover:bg-slate-50">
                          <span>🔄</span> Returns
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-slate-600 text-xs flex items-center gap-2 whitespace-nowrap hover:bg-slate-50">
                          <span>⏰</span> Expiry
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-slate-600 text-xs flex items-center gap-2 whitespace-nowrap hover:bg-slate-50">
                          <span>📊</span> Reports
                        </div>
                      </div>
                    </div>

                    {/* Mini Dashboard Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-extrabold text-slate-900 text-sm">Dashboard</h3>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg bg-slate-50">
                          <span>📅</span>
                          <span>Last 30 Days</span>
                          <span className="text-[9px]">⌄</span>
                        </div>
                      </div>

                      {/* 4 Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] mb-1 font-bold">
                            🔗
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">Active Medicines</div>
                          <div className="text-sm font-extrabold text-slate-900">2,134</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] mb-1 font-bold">
                            👥
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">Suppliers</div>
                          <div className="text-sm font-extrabold text-slate-900">50</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] mb-1 font-bold">
                            📅
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">Expiring Soon</div>
                          <div className="text-sm font-extrabold text-rose-600">12</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] mb-1 font-bold">
                            🥞
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium truncate">Inventory Value</div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">₹1,19,27,166</div>
                        </div>
                      </div>

                      {/* Stock Alerts Table */}
                      <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
                          <span className="text-amber-500">⭐</span>
                          <span>Stock Alerts</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead>
                              <tr className="text-slate-400 font-medium border-b border-slate-200/60 pb-1 text-[10px]">
                                <th className="pb-1 font-semibold">Medicine</th>
                                <th className="pb-1 font-semibold">Batch</th>
                                <th className="pb-1 font-semibold">Expiry</th>
                                <th className="pb-1 font-semibold text-center">Qty</th>
                                <th className="pb-1 font-semibold text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                              <tr>
                                <td className="py-1.5 text-slate-900 font-semibold truncate pr-2">Azithromycin 500mg</td>
                                <td className="py-1.5 font-mono text-[10px] text-slate-500">B7078B</td>
                                <td className="py-1.5 text-slate-600 text-[10px]">Sep 4, 2028</td>
                                <td className="py-1.5 text-center font-bold">1006</td>
                                <td className="py-1.5 text-right">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    In Stock
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-slate-900 font-semibold truncate pr-2">Diclofenac 50mg</td>
                                <td className="py-1.5 font-mono text-[10px] text-slate-500">B7939F</td>
                                <td className="py-1.5 text-slate-600 text-[10px]">Mar 4, 2028</td>
                                <td className="py-1.5 text-center font-bold">2508</td>
                                <td className="py-1.5 text-right">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    In Stock
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-slate-900 font-semibold truncate pr-2">Domperidone 10mg</td>
                                <td className="py-1.5 font-mono text-[10px] text-slate-500">B6047E</td>
                                <td className="py-1.5 text-slate-600 text-[10px]">Feb 27, 2027</td>
                                <td className="py-1.5 text-center font-bold">4552</td>
                                <td className="py-1.5 text-right">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    In Stock
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* "Everything You Need" Section matching screenshot */}
      <section id="features" className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e0f2f1] text-[#00695c] border border-[#b2dfdb] mb-2">
            Everything You Need
          </span>
          
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-12">
            Complete Pharmacy Management Solution
          </h2>

          {/* 6 Feature Cards in a clean horizontal grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
            
            {/* Card 1: Billing & Invoicing */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00796b] hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center mb-3">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#00796b] transition-colors">
                Billing &amp; Invoicing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create GST bills quickly and accurately.
              </p>
            </div>

            {/* Card 2: Inventory Management */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00796b] hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#00796b] transition-colors">
                Inventory Management
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track stock, batches and expiry in real-time.
              </p>
            </div>

            {/* Card 3: Purchase & Suppliers */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00796b] hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#00796b] transition-colors">
                Purchase &amp; Suppliers
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage purchases, suppliers and returns easily.
              </p>
            </div>

            {/* Card 4: Sales & Returns */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00796b] hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#00796b] transition-colors">
                Sales &amp; Returns
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Handle sales, customer returns and refunds.
              </p>
            </div>

            {/* Card 5: Expiry Alerts */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00796b] hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#00796b] transition-colors">
                Expiry Alerts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get notified before medicines expire.
              </p>
            </div>

            {/* Card 6: Reports & Analytics */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00796b] hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#00796b] transition-colors">
                Reports &amp; Analytics
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View sales, stock and profit reports.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Specialized Pharmacy Modules Section */}
      <section id="modules" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e0f2f1] text-[#00695c] border border-[#b2dfdb] mb-2">
              Specialized Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3">
              Deep Operational Tools for Medical Stores
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Every tool is tailored for high-volume retail dispensaries, chemist counters, and hospital pharmacies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Module 1: Fast Counter Billing */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#00796b] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center text-xl mb-4 font-bold">
                🧾
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">10-Second Customer GST Billing</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Rapid barcode &amp; medicine search, automatic CGST &amp; SGST splits, item-wise discount calculations, and instant thermal receipt printing for long customer queues.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Thermal receipt &amp; A4 bill formats</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Doctor &amp; patient prescription records</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Automatic cash &amp; digital payment records</li>
              </ul>
            </div>

            {/* Module 2: FEFO Batch Inventory */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#00796b] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center text-xl mb-4 font-bold">
                📦
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">FEFO &amp; Multi-Batch Inventory</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Strict First-Expiry-First-Out dispensing logic automatically prompts your counter staff to sell older medicine batches first, preventing expired stock write-offs.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Real-time batch-level quantity tracking</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Low stock auto-reorder alerts</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Fast physical inventory stock audit</li>
              </ul>
            </div>

            {/* Module 3: Supplier Inwards & OCR */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#00796b] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center text-xl mb-4 font-bold">
                🚚
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Supplier Inwards &amp; Bill Ingestion</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Record distributor bills (Cipla, Sun Pharma, Mankind, Lupin) in seconds. Upload distributor invoice scans or PDFs to auto-populate batches and stock.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" /> Automatic purchase rate vs MRP margins</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" /> Supplier ledger &amp; payment tracking</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" /> Fast purchase return voucher generator</li>
              </ul>
            </div>

            {/* Module 4: Expiry Quarantine & Debit Notes */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#00796b] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center text-xl mb-4 font-bold">
                ⏰
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Expiry Quarantine &amp; Debit Notes</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Automatic alerts 30, 60, and 90 days before medicines expire. Expired stock is automatically locked from sales and bundled into supplier return debit notes.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" /> Zero accidental expired medicine sales</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" /> 1-Click distributor debit note generator</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" /> Full expiry refund reconciliation</li>
              </ul>
            </div>

            {/* Module 5: Clinical Safety & Substitutes */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#00796b] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center text-xl mb-4 font-bold">
                🩺
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Drug Safety &amp; Generic Salts</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Built-in clinical guard checks for adverse drug-drug interactions before printing invoices, and helps staff suggest equivalent generic salt substitutes.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Real-time drug interaction warnings</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Generic substitute &amp; salt finder</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Patient dosage safety notes</li>
              </ul>
            </div>

            {/* Module 6: Role Permissions & Financial Security */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#00796b] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center text-xl mb-4 font-bold">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Role Permissions &amp; Privacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Complete separation of Owner, Manager, and Cashier roles. Store owners maintain total privacy over margins and profit reports, while staff handle counter billing.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> Store Owner, Manager &amp; Staff accounts</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> Sensitive sales &amp; profit data protection</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> Detailed user audit &amp; login history</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e0f2f1] text-[#00695c] border border-[#b2dfdb] mb-2">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3">
              Simple &amp; Affordable Plans for Every Pharmacy
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              No hidden fees, no per-bill charges. Choose the tier that fits your store size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* Plan 1: Free Starter */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between text-left">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 uppercase tracking-wider">
                  Community Free
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-1">Single Counter</h3>
                <p className="text-xs text-slate-500 mb-6">For small medical shops, clinics &amp; dispensaries.</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">₹0</span>
                  <span className="text-slate-500 text-xs font-medium ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 border-t border-slate-200 pt-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> 1 Billing counter account</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Up to 1,000 medicines &amp; batches</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> GST customer invoices &amp; thermal print</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Expiry date alert warnings</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Basic sales &amp; purchase history</li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="block w-full py-3 px-4 rounded-xl text-center text-sm font-bold border border-slate-300 text-slate-800 hover:bg-white hover:border-[#00796b] transition shadow-xs"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Plan 2: Retail Chemist Pro (Highlighted) */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#00796b] shadow-xl relative flex flex-col justify-between text-left">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00796b] text-white px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2f1] text-[#00695c] uppercase tracking-wider">
                  Retail Chemist
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-1">Store Owner Pro</h3>
                <p className="text-xs text-slate-500 mb-6">For busy retail chemist &amp; pharmacy shops.</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-[#00796b]">₹799</span>
                  <span className="text-slate-500 text-xs font-medium ml-1">/ month</span>
                  <span className="block text-[11px] text-teal-700 font-semibold mt-1">or ₹6,999 / year (Save 27%)</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 border-t border-slate-100 pt-6 font-medium">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00796b] flex-shrink-0" /> Unlimited medicines &amp; batch tracking</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00796b] flex-shrink-0" /> Unlimited billing staff &amp; cashiers</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00796b] flex-shrink-0" /> Distributor purchase bill auto-ingestion</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00796b] flex-shrink-0" /> Clinical drug interaction safety check</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00796b] flex-shrink-0" /> Automated supplier return debit notes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00796b] flex-shrink-0" /> Daily sales, profit &amp; stock valuation</li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="block w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold bg-[#00796b] hover:bg-[#00695c] text-white shadow-md shadow-teal-700/20 transition"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
            </div>

            {/* Plan 3: Hospital & Multi-Branch */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between text-left">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 uppercase tracking-wider">
                  Enterprise
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-1">Hospital Dispensary</h3>
                <p className="text-xs text-slate-500 mb-6">For multi-counter dispensaries &amp; pharmacy chains.</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">₹1,999</span>
                  <span className="text-slate-500 text-xs font-medium ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 border-t border-slate-200 pt-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Multi-branch warehouse transfers</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Doctor prescription barcode lookup</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Schedule H, H1 &amp; Narcotic registers</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Priority WhatsApp &amp; phone support</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0" /> Automated cloud database backup</li>
                </ul>
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="block w-full py-3 px-4 rounded-xl text-center text-sm font-bold border border-slate-300 text-slate-800 hover:bg-white hover:border-[#00796b] transition shadow-xs"
                >
                  Try Enterprise Demo
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About MedInventory Section */}
      <section id="about" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 text-left">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e0f2f1] text-[#00695c] border border-[#b2dfdb] mb-3">
                About MedInventory
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                Engineered for Indian Retail Chemists &amp; Dispensaries
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                MedInventory was developed specifically to solve the real daily pain points of pharmacy owners: expired medicine wastage, slow billing queues during peak rush hours, and complex GST filing.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00796b] flex items-center justify-center font-bold text-sm mb-2">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Zero Expired Stock Loss</h4>
                  <p className="text-xs text-slate-500">Automated FEFO logic and 30-day alerts ensure near-expiry medicines are returned on time.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00796b] flex items-center justify-center font-bold text-sm mb-2">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">100% GST &amp; HSN Ready</h4>
                  <p className="text-xs text-slate-500">HSN 3004 tax tagging with automatic CGST and SGST math ready for monthly GSTR-1 returns.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00796b] flex items-center justify-center font-bold text-sm mb-2">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">3,760+ Preloaded Medicines</h4>
                  <p className="text-xs text-slate-500">Start billing right away with preloaded popular medicines from Cipla, Sun Pharma, Mankind, and Lupin.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00796b] flex items-center justify-center font-bold text-sm mb-2">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Financial Privacy</h4>
                  <p className="text-xs text-slate-500">Multi-role separation keeps shop profits and purchase prices protected from counter billing staff.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg text-left space-y-6">
                <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-[#00796b] text-white flex items-center justify-center text-2xl shadow-sm">
                    💊
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Aadarsh Medicos Central Dispensary</h3>
                    <p className="text-xs text-slate-500">Live Production Pharmacy System • Patna, India</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Ready Stock</span>
                    <span className="text-lg font-extrabold text-[#00796b]">3,760+ Items</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Distributors Connected</span>
                    <span className="text-lg font-extrabold text-slate-900">30+ Wholesale</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">GST Tax Calculation</span>
                    <span className="text-lg font-extrabold text-emerald-700">100% Automated</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Wastage</span>
                    <span className="text-lg font-extrabold text-teal-700">0% Protected</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs text-slate-700 leading-relaxed flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-[#00695c] block mb-0.5">Want to test how it works?</span>
                    <span className="text-[11px] text-slate-500">Log in with a single click to see live inventory and counter billing.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoModal(true)}
                    className="px-4 py-2 bg-[#00796b] hover:bg-[#00695c] text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-sm transition"
                  >
                    Try 1-Click Demo →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1-Click Demo Modal when clicking "Watch Demo" */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] flex items-center justify-center text-lg border border-teal-100 font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Try 1-Click Demo Store</h3>
                <p className="text-xs text-slate-500">Pick any shop role to test the live system immediately</p>
              </div>
            </div>

            <div className="space-y-3 mt-5">
              {QUICK_PERSONAS.map((persona) => {
                const isLoading = activePersonaLoading === persona.role;
                return (
                  <button
                    key={persona.role}
                    type="button"
                    onClick={() => handleQuickLogin(persona)}
                    disabled={activePersonaLoading !== null}
                    className="w-full p-3.5 text-left rounded-2xl border border-slate-200 hover:border-[#00796b] hover:bg-teal-50/40 bg-slate-50 transition-all flex items-center justify-between group disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="text-2xl">{persona.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-[#00796b]">
                            {persona.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${persona.badgeClass}`}>
                            {persona.role === 'admin' ? 'Store Owner' : persona.role === 'manager' ? 'Manager' : 'Staff'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {persona.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#00796b] group-hover:translate-x-1 transition-transform ml-2">
                      {isLoading ? 'Opening...' : 'Enter →'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <Link
                to="/login"
                onClick={() => setShowDemoModal(false)}
                className="text-xs text-slate-500 hover:text-teal-700 font-medium transition"
              >
                Or sign in with your own store email and password →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Numbers Section */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 border-r border-slate-800 last:border-none">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono mb-1">3,760+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Medicines Ready in Database</div>
            </div>
            <div className="p-4 border-r border-slate-800 last:border-none">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono mb-1">30+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Major Medicine Suppliers</div>
            </div>
            <div className="p-4 border-r border-slate-800 last:border-none">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mb-1">100%</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Automatic GST Math</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono mb-1">0%</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Expired Stock Wastage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                Ready To Use
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-2">
                Ready to make your medical store easy to run?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Test the complete system now with pre-filled medicines, purchase bills, and billing screens.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <Link
                to="/login"
                className="px-6 py-3.5 bg-white text-teal-800 hover:bg-slate-100 rounded-xl font-bold text-sm text-center shadow-lg transition"
              >
                Try Demo Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 bg-teal-600/80 hover:bg-teal-600 text-white rounded-xl font-bold text-sm text-center border border-teal-400/30 transition"
              >
                Register Medical Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Healthcare Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 text-white font-bold text-base mb-2">
                <Pill className="w-5 h-5 text-teal-400 transform -rotate-45" />
                <span>MedInventory</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-3">
                Simple, reliable management software for medical stores, pharmacies, and dispensaries.
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Aadarsh Super Specialty Medicos
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Shop Features</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><Link to="/login" className="hover:text-teal-400 transition">Customer Billing Counter</Link></li>
                <li><Link to="/login" className="hover:text-teal-400 transition">Medicine Stock & Batches</Link></li>
                <li><Link to="/login" className="hover:text-teal-400 transition">Expiry Alerts & Quarantine</Link></li>
                <li><Link to="/login" className="hover:text-teal-400 transition">Supplier Purchases & Inward Bills</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Store Security</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><Link to="/login" className="hover:text-teal-400 transition">Owner & Staff Accounts</Link></li>
                <li><Link to="/login" className="hover:text-teal-400 transition">GST Tax Invoices (HSN 3004)</Link></li>
                <li><Link to="/login" className="hover:text-teal-400 transition">Recent Login History</Link></li>
                <li><Link to="/login" className="hover:text-teal-400 transition">Supplier Return Vouchers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">System Status</h4>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Database</span>
                  <span className="text-emerald-400 font-semibold">Online & Connected</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>GST Rates</span>
                  <span className="text-slate-300">CGST (6%) + SGST (6%)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Stock Alert</span>
                  <span className="text-teal-300">Automatic Expiry Tracking</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>© {new Date().getFullYear()} MedInventory Pharmacy Software. Simple & Easy to Use.</div>
            <div className="flex items-center space-x-4">
              <span>Privacy Safe</span>
              <span>•</span>
              <span>Secure Medical Records</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Layout;
