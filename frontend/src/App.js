import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Alerts from './components/Alerts';

import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ViewInventory from './components/ViewInventory';
import GenerateBillOptions from './components/GenerateBillOptions';
import PurchaseBillForm from './components/PurchaseBillForm';
import SellBillForm from './components/SellBillForm';
import ReturnBillOptions from './components/ReturnBillOptions';
import PurchaseReturnForm from './components/PurchaseReturnForm';
import PurchaseReturnSearch from './components/PurchaseReturnSearch';
import SaleReturnForm from './components/SaleReturnForm';
import ExpiryBillForm from './components/ExpiryBillForm';
import BillGenerationDocs from './components/BillGenerationDocs';
import PurchaseHistory from './components/PurchaseHistory';
import PartyInvoiceSearch from './components/PartyInvoiceSearch';
import { Toaster } from 'react-hot-toast';
import MedicineSalesSummary from './components/Report';
import ClientExpiryReturnForm from './components/ClientExpiryReturnForm';
import ClientExpiryBillGenerator from './components/ClientExpiryBillGenerator';
import SupplierExpiryBillGenerator from './components/SupplierExpiryBillGenerator';
import ExpiryBillDocs from './components/ExpiryBillDocs';
import ActivityLogs from './components/ActivityLogs';
import ChatbotWidget from './components/ChatbotWidget';
import DemandForecasting from './components/DemandForecasting';

// Pages that should NOT have sidebar (public pages)
const publicPaths = ['/', '/login', '/register'];

const AppContent = () => {
  const location = useLocation();
  const isPublicPage = publicPaths.includes(location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <>
    <Sidebar>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/view-inventory" element={<ViewInventory />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/generate-bill" element={<GenerateBillOptions />} />
        <Route path="/documentation/bill-generation" element={<BillGenerationDocs />} />
        <Route path="/purchase-bill" element={<PurchaseBillForm />} />
        <Route path="/sell-bill" element={<SellBillForm />} />
        <Route path="/return-bill" element={<ReturnBillOptions />} />
        <Route path="/purchase-return" element={<PurchaseReturnForm />} />
        <Route path="/purchase-return-search" element={<PurchaseReturnSearch />} />
        <Route path="/sale-return" element={<SaleReturnForm />} />
        <Route path="/expiry-bill" element={<ExpiryBillForm />} />
        <Route path="/purchase-history" element={<PurchaseHistory />} />
        <Route path="/party-invoices" element={<PartyInvoiceSearch />} />
        <Route path="/medicine-sales-summary" element={<MedicineSalesSummary />} />
        <Route path="/expiry/client" element={<ClientExpiryReturnForm />} />
        <Route path="/expiry-bill/client" element={<ClientExpiryBillGenerator />} />
        <Route path="/expiry-bill/supplier" element={<SupplierExpiryBillGenerator />} />
        <Route path="/docs/expiry-bill" element={<ExpiryBillDocs />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/forecasting" element={<DemandForecasting />} />
      </Routes>
    </Sidebar>
    <ChatbotWidget />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Toaster position="top-right" reverseOrder={false} />
            <AppContent />
          </div>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
