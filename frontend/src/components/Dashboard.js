import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useSocket } from '../context/SocketContext';
import { SOCKET_EVENTS } from "../utils/socketUtils.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const CATEGORY_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#a855f7', '#64748b'
];

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  const [inventoryCount, setInventoryCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [categoryViewMode, setCategoryViewMode] = useState('chart'); // 'chart' | 'list'
  const [purchaseSuggestions, setPurchaseSuggestions] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    topSellingMedicines: [],
    salesGrowth: 0,
    topCustomers: [],
    topSuppliers: []
  });

  // Real-time activity metrics
  const [activityMetrics, setActivityMetrics] = useState({
    dailySales: "₹0",
    monthlySales: "₹0",
    activeCustomers: 0
  });

  // Refs to prevent multiple API calls
  const dataFetchedRef = useRef(false);
  const socketConnectedRef = useRef(false);
  const fetchTimeout = useRef(null);

  // Process inventory data for low stock and expiring items
  const processInventoryData = useCallback((inventoryData) => {
    console.log('Processing inventory data:', inventoryData);

    if (!inventoryData || !Array.isArray(inventoryData)) {
      console.warn('Invalid inventory data received:', inventoryData);
      return;
    }

    const lowStockThreshold = 10;
    const expiringSoonThreshold = 30;
    const lowStockItems = [];
    const expiringSoonItems = [];
    const categories = {};
    const currentDate = new Date();

    inventoryData.forEach((item) => {
      // Group by category
      const cat = item.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;

      // Check for low stock
      const quantity = parseInt(item.quantity) || 0;
      if (quantity <= lowStockThreshold && quantity > 0) {
        lowStockItems.push({
          name: item.itemName || item.name,
          quantity: quantity
        });
      }

      // Check for expiring items
      if (item.expiryDate) {
        const expirationDate = new Date(item.expiryDate);
        const daysToExpire = Math.ceil((expirationDate - currentDate) / (1000 * 3600 * 24));

        if (daysToExpire > 0 && daysToExpire <= expiringSoonThreshold) {
          expiringSoonItems.push({
            name: item.itemName || item.name,
            expiryDate: item.expiryDate,
            daysRemaining: daysToExpire,
            quantity: quantity
          });
        }
      }
    });

    // Generate purchase suggestions based on low stock and sales data
    const suggestions = generatePurchaseSuggestions(lowStockItems, inventoryData);
    setPurchaseSuggestions(suggestions);

    setLowStockCount(lowStockItems.length);
    setExpiringSoonCount(expiringSoonItems.length);
    setCategoryDistribution(
      Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    );

    const lowStockNotifications = lowStockItems.map(item => ({
      type: "warning",
      message: `Low stock: ${item.name} (${item.quantity} units remaining)`,
      priority: "high"
    }));

    const expiringSoonNotifications = expiringSoonItems.map(item => ({
      type: "danger",
      message: `Expiring soon: ${item.name} (${item.daysRemaining} days remaining)`,
      priority: "urgent"
    }));

    setNotifications([...lowStockNotifications, ...expiringSoonNotifications]);
  }, []);

  // Generate purchase suggestions
  const generatePurchaseSuggestions = useCallback((lowStockItems, inventoryData) => {
    const suggestions = [];

    // Suggest reordering for low stock items
    lowStockItems.forEach(item => {
      const inventoryItem = inventoryData.find(inv =>
        (inv.itemName || inv.name) === item.name
      );

      if (inventoryItem) {
        const suggestedQuantity = Math.max(50, item.quantity * 5); // Suggest 5x current stock or minimum 50
        suggestions.push({
          type: 'reorder',
          itemName: item.name,
          currentStock: item.quantity,
          suggestedQuantity,
          reason: 'Low stock alert',
          priority: 'high',
          estimatedCost: (inventoryItem.mrp || 0) * suggestedQuantity * 0.7 // Assuming 70% of MRP as cost
        });
      }
    });

    // Add seasonal/trending suggestions (mock data for now)
    if (suggestions.length < 5) {
      const commonMedicines = [
        { name: 'Paracetamol 500mg', suggestedQty: 100, reason: 'High demand medicine' },
        { name: 'Amoxicillin 250mg', suggestedQty: 50, reason: 'Antibiotic essential' },
        { name: 'Vitamin D3', suggestedQty: 75, reason: 'Seasonal demand' }
      ];

      commonMedicines.forEach(med => {
        if (!suggestions.find(s => s.itemName === med.name)) {
          suggestions.push({
            type: 'trending',
            itemName: med.name,
            currentStock: 0,
            suggestedQuantity: med.suggestedQty,
            reason: med.reason,
            priority: 'medium',
            estimatedCost: med.suggestedQty * 10 // Mock cost
          });
        }
      });
    }

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }, []);

  const fetchUserEmail = useCallback(() => {
    let userEmail = null;

    // Try multiple sources for email
    userEmail = localStorage.getItem("email");

    if (!userEmail) {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const userData = JSON.parse(userJson);
          userEmail = userData.email;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }

    // Also fetch name
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setUserName(storedName);
    } else if (userEmail) {
      // Fallback: Use the part before @ if name is not found
      setUserName(userEmail.split('@')[0]);
    }

    const emailToUse = userEmail || "Guest";
    setEmail(emailToUse);

    return userEmail;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const userEmail = fetchUserEmail();
    if (!userEmail || userEmail === "Guest") {
      console.warn('No valid email found, skipping data fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching dashboard data for:', userEmail);
      setLoading(true);

      const inventoryRes = await axiosInstance.get('/api/inventory', {
        params: { email: userEmail }
      });

      console.log('Inventory response:', inventoryRes.data);

      const inventoryData = inventoryRes.data;
      if (Array.isArray(inventoryData)) {
        setInventoryCount(inventoryData.length);
        processInventoryData(inventoryData);
      } else {
        console.warn('Inventory data is not an array:', inventoryData);
        setInventoryCount(0);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setInventoryCount(0);
      setLowStockCount(0);
      setExpiringSoonCount(0);
      setNotifications([{
        type: "error",
        message: "Error loading inventory data. Please refresh the page.",
        priority: "high"
      }]);
    } finally {
      setLoading(false);
    }
  }, [processInventoryData, fetchUserEmail]);

  const fetchAnalyticsData = useCallback(async () => {
    const userEmail = fetchUserEmail();
    if (!userEmail || userEmail === "Guest") return;

    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Only include medicineName if not empty
      const params = {
        email: userEmail,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
      // If you ever want to filter by medicine, add it here:
      // if (medicineName && medicineName.trim() !== '') params.medicineName = medicineName;

      const response = await axiosInstance.get('/api/bills/medicine-sales', { params });

      if (response.data && response.data.salesDetails) {
        const sales = response.data.salesDetails;

        const totalRevenue = sales.reduce((sum, sale) =>
          sum + (sale.mrp * sale.quantity - sale.discount), 0);

        const uniqueInvoices = [...new Set(sales.map(sale => sale.saleInvoiceNumber))];
        const averageOrderValue = uniqueInvoices.length > 0 ? totalRevenue / uniqueInvoices.length : 0;

        const medicineMap = sales.reduce((acc, sale) => {
          const key = (sale.itemName || sale.name || '').trim();
          if (!key || key.toLowerCase() === 'undefined') return acc;
          if (!acc[key]) acc[key] = 0;
          acc[key] += Number(sale.quantity) || 0;
          return acc;
        }, {});

        const topSellingMedicines = Object.entries(medicineMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, quantity]) => ({
            name,
            shortName: name.length > 14 ? name.slice(0, 12) + '…' : name,
            quantity
          }));

        // Fetch Top Parties
        let topCustomers = [];
        let topSuppliers = [];
        try {
          const partiesRes = await axiosInstance.get('/api/bills/top-parties');
          if (partiesRes.data && partiesRes.data.success) {
            topCustomers = partiesRes.data.topCustomers || [];
            topSuppliers = partiesRes.data.topSuppliers || [];
          }
        } catch (err) {
          console.error("Error fetching top parties:", err);
        }

        setAnalyticsData({
          totalRevenue,
          averageOrderValue,
          topSellingMedicines,
          salesGrowth: 0,
          topCustomers,
          topSuppliers
        });

        // Update activity metrics
        setActivityMetrics(prev => ({
          ...prev,
          monthlySales: `₹${totalRevenue.toFixed(2)}`,
          dailySales: `₹${(totalRevenue / 30).toFixed(2)}` // Rough daily average
        }));
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsData({
        totalRevenue: 0,
        averageOrderValue: 0,
        topSellingMedicines: [],
        salesGrowth: 0,
        topCustomers: [],
        topSuppliers: []
      });
    }
  }, [fetchUserEmail]);

  // Setup authentication
  useEffect(() => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token && window.location.pathname !== '/login') {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Socket connection and event handlers
  useEffect(() => {
    if (!socket || socketConnectedRef.current) return;

    const userEmail = fetchUserEmail();
    if (!userEmail || userEmail === "Guest") return;

    console.log('Setting up socket connection for:', userEmail);

    const handleInventoryUpdate = () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
      fetchTimeout.current = setTimeout(() => {
        fetchDashboardData();
        fetchTimeout.current = null;
      }, 1000); // 1 second debounce
    };

    const handleDashboardUpdate = (data) => {
      console.log('WebSocket dashboard update received:', data);
      if (data && data.userEmail === userEmail) {
        setActivityMetrics(prev => ({
          ...prev,
          dailySales: data.dailySales || prev.dailySales,
          monthlySales: data.monthlySales || prev.monthlySales,
          activeCustomers: data.activeCustomers || prev.activeCustomers
        }));
      }
    };

    const handleConnect = () => {
      console.log('Socket connected, joining room for:', userEmail);
      socket.emit('join', { email: userEmail, room: 'dashboard' });
      socketConnectedRef.current = true;
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      socketConnectedRef.current = false;
    };

    // Remove existing listeners
    socket.off(SOCKET_EVENTS.INVENTORY_UPDATE);
    socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE);
    socket.off('connect');
    socket.off('disconnect');

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(SOCKET_EVENTS.INVENTORY_UPDATE, handleInventoryUpdate);
    socket.on(SOCKET_EVENTS.DASHBOARD_UPDATE, handleDashboardUpdate);

    // Join room if already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(SOCKET_EVENTS.INVENTORY_UPDATE, handleInventoryUpdate);
      socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE, handleDashboardUpdate);
      socketConnectedRef.current = false;
    };
  }, [socket, processInventoryData, fetchUserEmail, fetchDashboardData, fetchAnalyticsData]);

  // Initial data fetch
  useEffect(() => {
    if (!dataFetchedRef.current) {
      const userEmail = fetchUserEmail();
      if (userEmail && userEmail !== "Guest") {
        fetchDashboardData();
        fetchAnalyticsData();
        dataFetchedRef.current = true;
      }
    }
  }, [fetchDashboardData, fetchAnalyticsData, fetchUserEmail]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const userEmail = fetchUserEmail();
        if (userEmail && userEmail !== "Guest") {
          fetchDashboardData();
          fetchAnalyticsData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchDashboardData, fetchAnalyticsData, fetchUserEmail]);

  const handleLogout = () => {
    // Clean up socket connection
    if (socket) {
      socket.disconnect();
    }

    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const handleAlertClick = () => {
    navigate('/alerts');
  };

  const handlePurchaseSuggestionClick = (suggestion) => {
    // Navigate to purchase/inventory page with suggestion data
    navigate('/inventory', {
      state: {
        suggestion,
        action: 'purchase'
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-5 bg-white rounded-2xl shadow-sm border border-slate-200/90">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {userName || email || "Store Manager"}!
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Medical Store Overview & Inventory Control</p>
          </div>
          <div className="flex items-center space-x-3">
            {socket?.connected && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Live Stock Sync</span>
              </span>
            )}
            <span
              onClick={handleAlertClick}
              className="bg-teal-50 text-teal-800 border border-teal-200 px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:bg-teal-100 transition-colors shadow-sm"
            >
              🔔 {notifications.length} Alerts
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Inventory Health Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Inventory Health</h2>
                <p className="text-xs text-slate-500">Stock on shelf & alerts</p>
              </div>
            </div>
            <div className="space-y-3">
              <MetricItem
                label="Total Medicines"
                value={inventoryCount}
                icon="📦"
                color="teal"
                onClick={() => navigate("/inventory")}
              />
              <MetricItem
                label="Low Stock Items"
                value={lowStockCount}
                icon="⚠️"
                color="amber"
                onClick={handleAlertClick}
              />
              <MetricItem
                label="Expiring Soon (30d)"
                value={expiringSoonCount}
                icon="⌛"
                color="rose"
                onClick={handleAlertClick}
              />
            </div>
          </div>

          {/* Purchase Suggestions Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Reorder Suggestions</h2>
                <p className="text-xs text-slate-500">Low stock medicines</p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {purchaseSuggestions.length > 0 ? (
                purchaseSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handlePurchaseSuggestionClick(suggestion)}
                    className="p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-teal-50/50 hover:border-teal-300 transition-all border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-slate-800 text-sm truncate mr-2">{suggestion.itemName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${suggestion.priority === 'high' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{suggestion.reason}</p>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Suggested: {suggestion.suggestedQuantity} units</span>
                      <span className="text-slate-800 font-bold">₹{suggestion.estimatedCost?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <span className="text-2xl mb-1 block">✅</span>
                  <p className="text-xs font-medium">All medicines have healthy stock</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Shop & Counter Overview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Counter Sales Overview</h2>
                <p className="text-xs text-slate-500">Today's billing & medicine trends</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Store Sales</h3>
                <div className="grid grid-cols-1 gap-3">
                  <ActivityItem
                    title="Today's Total Sales"
                    amount={activityMetrics.dailySales}
                    icon="💰"
                    color="green"
                  />
                  <ActivityItem
                    title="This Month's Sales"
                    amount={activityMetrics.monthlySales}
                    icon="📆"
                    color="indigo"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Top Fast-Moving Medicines</h3>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {analyticsData.topSellingMedicines.length > 0 ? (
                    analyticsData.topSellingMedicines.map((medicine, index) => (
                      <div key={index} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-800 truncate mr-2">{medicine.name}</span>
                        <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex-shrink-0">{medicine.quantity} units</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <p className="text-xs">No sales recorded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers & Suppliers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl text-teal-600">👥</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Frequent Customers</h2>
                <p className="text-xs text-slate-500">Regular patients & counter visitors</p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {analyticsData.topCustomers && analyticsData.topCustomers.length > 0 ? (
                analyticsData.topCustomers.map((customer, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-base shadow-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{customer.name}</h4>
                        <p className="text-xs text-slate-500">{customer.billsCount} Bills</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-teal-700 text-sm">₹{customer.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No customer sales recorded yet</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl text-blue-600">🏭</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Top Medicine Suppliers</h2>
                <p className="text-xs text-slate-500">Wholesale distributors & inward stock</p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {analyticsData.topSuppliers && analyticsData.topSuppliers.length > 0 ? (
                analyticsData.topSuppliers.map((supplier, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-base shadow-sm">
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{supplier.name}</h4>
                        <p className="text-xs text-slate-500">{supplier.billsCount} Invoices</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-700 text-sm">₹{supplier.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No supplier invoices found</div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Selling Medicines Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold text-slate-900">Top Selling Medicines</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  By Units
                </span>
              </div>
              {analyticsData.topSellingMedicines.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={analyticsData.topSellingMedicines} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      angle={-15}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                      formatter={(val, _name, item) => [`${val} units sold`, item.payload.name || 'Medicine']}
                    />
                    <Bar dataKey="quantity" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[230px] flex items-center justify-center text-slate-400 text-xs">No sales data yet</div>
              )}
            </div>
          </div>

          {/* Inventory Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🥧</span>
                  <h3 className="text-lg font-bold text-slate-900">Inventory Status</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {inventoryCount} Items Total
                </span>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Healthy Stock', value: Math.max(0, inventoryCount - lowStockCount - expiringSoonCount) },
                      { name: 'Low Stock', value: lowStockCount },
                      { name: 'Expiring Soon', value: expiringSoonCount },
                    ]}
                    cx="50%" cy="45%" innerRadius={50} outerRadius={75}
                    paddingAngle={4} dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px'
                    }}
                    formatter={(val, name) => [`${val} items`, name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Card (Enhanced UI) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏷️</span>
                  <h3 className="text-lg font-bold text-gray-900">Category Distribution</h3>
                </div>
                {/* View toggle tabs */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCategoryViewMode('chart')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      categoryViewMode === 'chart'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Donut
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryViewMode('list')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      categoryViewMode === 'list'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Breakdown
                  </button>
                </div>
              </div>

              {categoryDistribution.length > 0 ? (
                categoryViewMode === 'chart' ? (
                  <div>
                    {/* Donut Chart with clean center label */}
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={62}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryDistribution.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                            formatter={(value, name) => [
                              `${value} medicines (${(
                                (value /
                                  (categoryDistribution.reduce((a, b) => a + b.value, 0) || 1)) *
                                100
                              ).toFixed(1)}%)`,
                              name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</span>
                        <span className="text-sm font-bold text-gray-800">
                          {categoryDistribution.length} Cats
                        </span>
                      </div>
                    </div>

                    {/* Scrollable multi-column clean legend list */}
                    <div className="mt-2 max-h-[85px] overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 custom-scrollbar">
                      {categoryDistribution.map((cat, idx) => {
                        const total = categoryDistribution.reduce((a, b) => a + b.value, 0) || 1;
                        const pct = ((cat.value / total) * 100).toFixed(0);
                        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-gray-50/80 hover:bg-gray-100 transition-colors border border-gray-100"
                            title={`${cat.name}: ${cat.value} medicines (${pct}%)`}
                          >
                            <div className="flex items-center space-x-1.5 truncate mr-1">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="truncate text-[11px] font-medium text-gray-700">
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Ranked Breakdown Progress List */
                  <div className="h-[235px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {categoryDistribution.map((cat, idx) => {
                      const total = categoryDistribution.reduce((a, b) => a + b.value, 0) || 1;
                      const pct = ((cat.value / total) * 100).toFixed(1);
                      const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                      return (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-gray-50/90 hover:bg-gray-100 transition-all border border-gray-100"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center space-x-2 truncate mr-2">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-semibold text-gray-800 text-[11px] truncate">
                                {cat.name}
                              </span>
                            </div>
                            <span className="font-bold text-gray-900 text-xs whitespace-nowrap">
                              {cat.value}{' '}
                              <span className="font-normal text-[10px] text-gray-400">
                                ({pct}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="h-[230px] flex items-center justify-center text-gray-400">
                  No categories found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <p className="text-xs text-slate-500">Fast shortcuts to common medical store workflows</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              label="Sales Report"
              icon="💰"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-700"
              badgeColor="border-emerald-200"
              description="Daily, weekly & monthly medicine sales trends"
              onClick={() => navigate("/medicine-sales-summary")}
            />
            <ActionButton
              label="Medicine Stock"
              icon="💊"
              iconBg="bg-teal-50"
              iconColor="text-teal-700"
              badgeColor="border-teal-200"
              description="Check stock levels, batch counts & valuations"
              onClick={() => navigate("/view-inventory")}
            />
            <ActionButton
              label="Purchase History"
              icon="📦"
              iconBg="bg-blue-50"
              iconColor="text-blue-700"
              badgeColor="border-blue-200"
              description="Review supplier bills and distributor inwards"
              onClick={() => navigate("/purchase-history")}
            />
            <ActionButton
              label="Customer Billing"
              icon="🧾"
              iconBg="bg-indigo-50"
              iconColor="text-indigo-700"
              badgeColor="border-indigo-200"
              description="Create customer GST bills or record returns"
              onClick={() => navigate("/generate-bill")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
const MetricItem = ({ label, value, icon, color, onClick }) => {
  const colorClasses = {
    teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" }
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer shadow-sm"
    >
      <div className="flex items-center space-x-3">
        <span className={`text-xl ${colorClasses[color].bg} ${colorClasses[color].text} border ${colorClasses[color].border} p-2 rounded-lg`}>
          {icon}
        </span>
        <span className="text-slate-700 text-sm font-semibold">{label}</span>
      </div>
      <span className={`text-lg font-bold ${colorClasses[color].text}`}>{value || 0}</span>
    </div>
  );
};

const ActivityItem = ({ title, amount, icon, color }) => {
  const colorClasses = {
    green: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    indigo: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    purple: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  };

  return (
    <div className={`p-4 ${colorClasses[color].bg} rounded-xl border ${colorClasses[color].border} transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`text-xl ${colorClasses[color].text}`}>{icon}</span>
          <span className="text-slate-700 text-xs font-semibold">{title}</span>
        </div>
        <span className={`text-base font-extrabold ${colorClasses[color].text}`}>{amount}</span>
      </div>
    </div>
  );
};

const ActionButton = ({ label, icon, description, onClick, iconBg, iconColor, badgeColor }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/90 hover:shadow-md hover:border-teal-400 transition-all text-left min-h-[155px]"
  >
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} border ${badgeColor} flex items-center justify-center text-xl shadow-sm`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Open →
        </span>
      </div>
      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{label}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
    </div>
  </button>
);

export default Dashboard;
