import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPills, FaClinicMedical, FaChartLine, FaShieldAlt, FaRobot, FaBolt } from 'react-icons/fa';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-15" style={{
          background: 'radial-gradient(circle, #667eea 0%, transparent 70%)',
          top: '-15%', left: '-10%',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, #764ba2 0%, transparent 70%)',
          bottom: '10%', right: '-5%',
          animation: 'float 10s ease-in-out infinite reverse'
        }}></div>
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, #f093fb 0%, transparent 70%)',
          top: '40%', left: '50%',
          animation: 'float 12s ease-in-out infinite'
        }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
        {/* Floating Icons */}
        <div className="absolute text-5xl opacity-[0.06]" style={{ top: '12%', left: '8%', animation: 'floatIcon 7s ease-in-out infinite' }}>💊</div>
        <div className="absolute text-4xl opacity-[0.06]" style={{ top: '65%', left: '5%', animation: 'floatIcon 9s ease-in-out infinite 1s' }}>🧪</div>
        <div className="absolute text-5xl opacity-[0.06]" style={{ top: '20%', right: '8%', animation: 'floatIcon 8s ease-in-out infinite 2s' }}>💉</div>
        <div className="absolute text-4xl opacity-[0.06]" style={{ bottom: '25%', right: '12%', animation: 'floatIcon 10s ease-in-out infinite 0.5s' }}>🏥</div>
        <div className="absolute text-3xl opacity-[0.06]" style={{ top: '45%', left: '3%', animation: 'floatIcon 11s ease-in-out infinite 3s' }}>⚕️</div>
        <div className="absolute text-4xl opacity-[0.06]" style={{ top: '80%', right: '30%', animation: 'floatIcon 12s ease-in-out infinite 1.5s' }}>🩺</div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaPills className="text-white text-xl" />
              </div>
              <h1 className="text-white text-xl font-bold tracking-tight">
                MedInventory Pro
              </h1>
            </Link>
            
            <div className="flex space-x-3 mt-2 sm:mt-0">
              <Link to="/login">
                <button className="text-gray-300 hover:text-white px-5 py-2.5 rounded-xl 
                  hover:bg-white/10 transition-all font-medium text-sm">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl 
                  hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/25
                  font-semibold text-sm flex items-center space-x-2 transform hover:scale-105">
                  <span>Get Started</span>
                  <span>→</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow">
        <div className="container mx-auto text-center pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto mb-20">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <FaBolt className="text-yellow-400" />
              <span>AI-Powered Pharmacy Management</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Revolutionizing{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pharmacy Management
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Transform your pharmacy operations with our AI-powered inventory solution. 
              Track medicines, manage returns, and get smart analytics — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl 
                  hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-indigo-500/30
                  font-bold text-lg flex items-center space-x-2 transform hover:scale-105">
                  <span>Start Free Trial</span>
                  <span>🚀</span>
                </button>
              </Link>
              <Link to="/login">
                <button className="border border-white/20 text-gray-300 hover:text-white px-8 py-4 rounded-2xl 
                  hover:bg-white/10 transition-all font-semibold text-lg backdrop-blur-sm">
                  View Demo →
                </button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto mb-20">
            {[
              {
                icon: FaClinicMedical,
                title: "Smart Inventory",
                description: "AI-powered stock predictions, expiration tracking, and automated reorder suggestions",
                gradient: "from-indigo-500 to-blue-500",
                iconBg: "bg-indigo-500/20",
                iconColor: "text-indigo-400"
              },
              {
                icon: FaPills,
                title: "Medicine Tracking",
                description: "Batch-level tracking with real-time updates, barcode support, and supplier management",
                gradient: "from-pink-500 to-rose-500",
                iconBg: "bg-pink-500/20",
                iconColor: "text-pink-400"
              },
              {
                icon: FaChartLine,
                title: "Advanced Analytics",
                description: "Interactive dashboards, sales insights, demand forecasting, and profitability reports",
                gradient: "from-emerald-500 to-teal-500",
                iconBg: "bg-emerald-500/20",
                iconColor: "text-emerald-400"
              }
            ].map((card, index) => (
              <div 
                key={index}
                className="group backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10
                          hover:bg-white/10 hover:border-white/20 transition-all duration-500 
                          hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className={`${card.iconBg} w-14 h-14 rounded-xl mb-5 
                               flex items-center justify-center ${card.iconColor} text-2xl 
                               group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white text-left">{card.title}</h3>
                <p className="text-gray-400 text-left text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto mb-20">
            {[
              {
                icon: FaShieldAlt,
                title: "Secure & Compliant",
                description: "GST-ready billing, email verification, role-based access control",
                iconBg: "bg-amber-500/20",
                iconColor: "text-amber-400"
              },
              {
                icon: FaRobot,
                title: "AI Pharmacist Copilot",
                description: "Ask our AI chatbot for medicine alternatives, generic substitutes, and dosage info",
                iconBg: "bg-cyan-500/20",
                iconColor: "text-cyan-400"
              },
              {
                icon: FaBolt,
                title: "Return & Expiry Management",
                description: "Automated purchase returns, sale returns, and expired stock handling with one click",
                iconBg: "bg-violet-500/20",
                iconColor: "text-violet-400"
              }
            ].map((card, index) => (
              <div 
                key={index}
                className="group backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10
                          hover:bg-white/10 hover:border-white/20 transition-all duration-500 
                          hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className={`${card.iconBg} w-14 h-14 rounded-xl mb-5 
                               flex items-center justify-center ${card.iconColor} text-2xl 
                               group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white text-left">{card.title}</h3>
                <p className="text-gray-400 text-left text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
            {[
              { number: "500+", label: "Pharmacies Trust Us" },
              { number: "1M+", label: "Medicines Tracked" },
              { number: "24/7", label: "AI Support" },
              { number: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 
                          hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text mb-1 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="max-w-3xl mx-auto backdrop-blur-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl p-10 border border-indigo-500/20 mb-10">
            <h3 className="text-3xl font-bold text-white mb-3">Ready to Transform Your Pharmacy?</h3>
            <p className="text-gray-300 mb-6">Join 500+ pharmacies already using MedInventory Pro</p>
            <Link to="/register">
              <button className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold 
                hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105">
                Get Started for Free →
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-md bg-white/5">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <div className="flex items-center space-x-2 mb-2 justify-center md:justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaPills className="text-white text-sm" />
                </div>
                <h3 className="text-lg font-bold text-white">MedInventory Pro</h3>
              </div>
              <p className="text-gray-500 text-sm">AI-Powered Pharmacy Management System</p>
              <p className="text-gray-600 text-xs mt-1">© 2024 All rights reserved</p>
            </div>
            
            <div className="flex space-x-4">
              {[
                { href: "#", icon: FaFacebookF, hoverColor: "hover:bg-blue-500/20 hover:text-blue-400" },
                { href: "#", icon: FaTwitter, hoverColor: "hover:bg-cyan-500/20 hover:text-cyan-400" },
                { href: "#", icon: FaInstagram, hoverColor: "hover:bg-pink-500/20 hover:text-pink-400" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href}
                  className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center 
                    text-gray-500 transition-all duration-300 ${social.hoverColor}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          75% { transform: translateY(10px) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
};

export default Layout;