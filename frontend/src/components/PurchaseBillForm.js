import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { SOCKET_EVENTS } from '../utils/socketUtils';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PurchaseBillForm = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [items, setItems] = useState([
    {
      itemName: "",
      batch: "",
      expiryDate: "",
      pack: "",
      quantity: "",
      purchaseRate: "",
      mrp: "",
      gstPercentage: "",
      discount: "",
      totalAmount: "",
      discountAmount: "",
      gstAmount: "",
      netAmount: ""
    },
  ]);

  const [purchaseDetails, setPurchaseDetails] = useState({
    supplierInvoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    receiptNumber: `RCP-${Math.floor(100 + Math.random() * 900)}`,
    partyName: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [message, setMessage] = useState("");

  // Add new state for file upload and loading
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Add socket event listener for inventory updates
  useEffect(() => {
    if (!socket) return;

    const handleInventoryUpdate = (data) => {
      console.log('Inventory update received in purchase form:', data);
      // Clear success message after 3 seconds
      if (message.includes("successfully")) {
        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    };

    socket.on(SOCKET_EVENTS.INVENTORY_UPDATE, handleInventoryUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.INVENTORY_UPDATE, handleInventoryUpdate);
    };
  }, [socket, message]);

  const calculateItemAmounts = (item) => {
    const quantity = parseFloat(item.quantity || 0);
    const purchaseRate = parseFloat(item.purchaseRate || 0);
    const discount = parseFloat(item.discount || 0);
    const gstPercentage = parseFloat(item.gstPercentage || 0);

    // Calculate total amount
    const totalAmount = quantity * purchaseRate;
    
    // Calculate discount amount
    const discountAmount = (totalAmount * discount) / 100;
    
    // Calculate amount after discount
    const amountAfterDiscount = totalAmount - discountAmount;
    
    // Calculate GST amount
    const gstAmount = (amountAfterDiscount * gstPercentage) / 100;
    
    // Calculate net amount
    const netAmount = amountAfterDiscount + gstAmount;

    return {
      totalAmount: totalAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      netAmount: netAmount.toFixed(2)
    };
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const updatedItems = [...items];
    updatedItems[index][name] = value;

    // Calculate amounts when relevant fields change
    if (['quantity', 'purchaseRate', 'discount', 'gstPercentage'].includes(name)) {
      const calculatedAmounts = calculateItemAmounts(updatedItems[index]);
      updatedItems[index] = {
        ...updatedItems[index],
        ...calculatedAmounts
      };
    }

    setItems(updatedItems);
  };

  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    setPurchaseDetails({ ...purchaseDetails, [name]: value });
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        batch: "",
        expiryDate: "",
        pack: "",
        quantity: "",
        purchaseRate: "",
        mrp: "",
        gstPercentage: "",
        discount: "",
        totalAmount: "",
        discountAmount: "",
        gstAmount: "",
        netAmount: ""
      },
    ]);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Purchase Bill", 14, 15);

    // Add purchase details
    doc.setFontSize(10);
    doc.text(`Supplier Invoice: ${purchaseDetails.supplierInvoiceNumber}`, 14, 25);
    doc.text(`Receipt Number: ${purchaseDetails.receiptNumber}`, 14, 30);
    doc.text(`Party Name: ${purchaseDetails.partyName}`, 14, 35);
    doc.text(`Date: ${purchaseDetails.date}`, 14, 40);

    // Table headers
    const headers = [
      "Item Name",
      "Batch",
      "Quantity",
      "Rate",
      "Total",
      "Discount",
      "GST",
      "Net Amount"
    ];

    // Table data
    const tableData = items.map(item => [
      item.itemName,
      item.batch,
      item.quantity,
      item.purchaseRate,
      item.totalAmount,
      item.discountAmount,
      item.gstAmount,
      item.netAmount
    ]);

    // Add totals row
    const totals = {
      totalAmount: items.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0).toFixed(2),
      discountAmount: items.reduce((sum, item) => sum + parseFloat(item.discountAmount || 0), 0).toFixed(2),
      gstAmount: items.reduce((sum, item) => sum + parseFloat(item.gstAmount || 0), 0).toFixed(2),
      netAmount: items.reduce((sum, item) => sum + parseFloat(item.netAmount || 0), 0).toFixed(2)
    };

    tableData.push(['', '', '', 'Total:', totals.totalAmount, totals.discountAmount, totals.gstAmount, totals.netAmount]);

    // Add table
    doc.autoTable({
      startY: 45,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });

    doc.save("PurchaseBill.pdf");
  };

  const createPurchaseBill = async () => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!email || !token) {
      setMessage("User is not authenticated. Please log in again.");
      return;
    }

    if (!purchaseDetails.partyName?.trim()) {
      setMessage("Please enter Supplier / Party Name (e.g., Cipla Healthcare, Sun Pharma).");
      return;
    }

    const filledItems = items.filter(it => it.itemName && it.itemName.trim().length > 0);
    if (filledItems.length === 0) {
      setMessage("Please enter at least one Medicine Item Name (e.g., Paracetamol 500mg).");
      return;
    }

    // Validate quantities
    for (const it of filledItems) {
      if (!it.quantity || parseFloat(it.quantity) <= 0) {
        setMessage(`Please enter a valid Quantity (> 0) for "${it.itemName}".`);
        return;
      }
      if (it.purchaseRate === "" || parseFloat(it.purchaseRate) < 0) {
        setMessage(`Please enter a valid Purchase Rate for "${it.itemName}".`);
        return;
      }
    }

    const defaultExpiry = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sanitizedItems = filledItems.map((item, idx) => {
      const quantity = Math.max(0, parseFloat(item.quantity) || 1);
      const purchaseRate = Math.max(0, parseFloat(item.purchaseRate) || 0);
      const mrp = Math.max(0, parseFloat(item.mrp) || purchaseRate || 0);
      const discount = Math.max(0, parseFloat(item.discount) || 0);
      const gstPercentage = Math.max(0, parseFloat(item.gstPercentage) || 0);

      const totalAmount = quantity * purchaseRate;
      const discountAmount = (totalAmount * discount) / 100;
      const amountAfterDiscount = totalAmount - discountAmount;
      const gstAmount = (amountAfterDiscount * gstPercentage) / 100;
      const netAmount = amountAfterDiscount + gstAmount;

      return {
        ...item,
        itemName: item.itemName.trim(),
        batch: item.batch?.trim() || `BAT-${Date.now().toString().slice(-4)}${idx}`,
        expiryDate: item.expiryDate || defaultExpiry,
        pack: item.pack?.trim() || 'Strip',
        quantity,
        purchaseRate,
        mrp,
        discount,
        gstPercentage,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        netAmount: parseFloat(netAmount.toFixed(2))
      };
    });

    const purchaseAmount = sanitizedItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalAmount = purchaseAmount;
    const discountAmount = sanitizedItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const gstAmount = sanitizedItems.reduce((sum, item) => sum + item.gstAmount, 0);
    const netAmount = sanitizedItems.reduce((sum, item) => sum + item.netAmount, 0);

    const body = {
      ...purchaseDetails,
      supplierInvoiceNumber: purchaseDetails.supplierInvoiceNumber?.trim() || `PUR-${Date.now().toString().slice(-6)}`,
      receiptNumber: purchaseDetails.receiptNumber?.trim() || `RCP-${Date.now().toString().slice(-6)}`,
      date: purchaseDetails.date || new Date().toISOString().split('T')[0],
      purchaseAmount: parseFloat(purchaseAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      email,
      items: sanitizedItems
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/bills/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Idempotency-Key": `purchase-${body.supplierInvoiceNumber || Date.now()}`
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setMessage("Purchase bill created and inventory updated successfully!");
        generatePDF();
        
        // Emit purchase bill created event
        if (socket) {
          socket.emit('purchase_bill_created', {
            email,
            items: body.items,
            timestamp: new Date().toISOString()
          });
        }

        // Reset form with fresh random invoice/receipt numbers
        setItems([{
          itemName: "",
          batch: "",
          expiryDate: "",
          pack: "",
          quantity: "",
          purchaseRate: "",
          mrp: "",
          gstPercentage: "",
          discount: "",
          totalAmount: "",
          discountAmount: "",
          gstAmount: "",
          netAmount: ""
        }]);
        setPurchaseDetails({
          supplierInvoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          receiptNumber: `RCP-${Math.floor(100 + Math.random() * 900)}`,
          partyName: "",
          date: new Date().toISOString().split('T')[0],
        });

        // Clear success message after 4 seconds
        setTimeout(() => {
          setMessage("");
        }, 4000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const detailedError = errorData.error || errorData.message || "Failed to create purchase bill";
        setMessage(`Failed to create purchase bill: ${detailedError}`);
      }
    } catch (error) {
      setMessage(`Error occurred while creating the purchase bill: ${error.message}`);
    }
  };

  // Calculate totals
  const totals = {
    totalAmount: items.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0).toFixed(2),
    discountAmount: items.reduce((sum, item) => sum + parseFloat(item.discountAmount || 0), 0).toFixed(2),
    gstAmount: items.reduce((sum, item) => sum + parseFloat(item.gstAmount || 0), 0).toFixed(2),
    netAmount: items.reduce((sum, item) => sum + parseFloat(item.netAmount || 0), 0).toFixed(2)
  };

  // Handler for file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Handler for uploading the file to backend
  const handleUpload = async () => {
    if (!uploadFile) {
      setMessage('Please select an image or PDF file to upload.');
      return;
    }
    setUploading(true);
    setMessage('AI is reading and extracting bill data with Gemini Vision...');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const response = await axios.post(`${API_BASE_URL}/api/ocr-bill`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data;
      if (data.purchaseDetails && data.items && data.items.length > 0) {
        setPurchaseDetails(data.purchaseDetails);
        setItems(data.items);
        setMessage(`✨ Successfully extracted ${data.items.length} items from the bill and auto-filled the form!`);
      } else {
        setMessage('Could not extract complete bill data. Please check the file clarity.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setMessage(error.response?.data?.message || 'Error processing file with AI OCR. Please check API key or file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 sm:p-8 bg-white border border-slate-200/80 shadow-xl rounded-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#00796b] border border-teal-100 flex items-center justify-center text-xl font-bold">
              📦
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                New Purchase & Supplier Inward
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Record distributor stock invoices, auto-update medicine inventory and batch stock.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI OCR Bill Extraction Card (Top placement for quick auto-fill) */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📄</span>
            <h3 className="font-bold text-slate-900 text-sm">
              Distributor Bill OCR & Inward Ingestion (Optional)
            </h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 font-semibold rounded-full bg-teal-100 text-[#00695c] border border-teal-200 self-start sm:self-auto">
            AI Auto-Fill
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Upload supplier invoice photo or PDF (Cipla, Sun Pharma, Mankind, Lupin) to extract items, batches, and rates automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            id="bill-upload"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="border border-slate-300 p-2.5 rounded-xl w-full sm:flex-1 bg-white text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#00796b] hover:file:bg-teal-100 cursor-pointer"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={handleUpload}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#00796b] hover:bg-[#00695c] text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2"
            disabled={uploading || !uploadFile}
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Analyzing Invoice...</span>
              </>
            ) : (
              <span>Scan & Auto-Fill Form</span>
            )}
          </button>
        </div>
      </div>

      {/* Supplier & Invoice Header Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Supplier / Party Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="partyName"
            placeholder="E.g., Mankind Healthcare, Cipla"
            value={purchaseDetails.partyName}
            onChange={handleDetailsChange}
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b] text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Supplier Invoice #
          </label>
          <input
            type="text"
            name="supplierInvoiceNumber"
            placeholder="E.g., INV-2026-105"
            value={purchaseDetails.supplierInvoiceNumber}
            onChange={handleDetailsChange}
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b] text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Receipt / Challan #
          </label>
          <input
            type="text"
            name="receiptNumber"
            placeholder="E.g., RCP-105"
            value={purchaseDetails.receiptNumber}
            onChange={handleDetailsChange}
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b] text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Inward Date
          </label>
          <input
            type="date"
            name="date"
            value={purchaseDetails.date}
            onChange={handleDetailsChange}
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00796b] text-sm bg-white"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto mb-6 rounded-xl border border-slate-200 shadow-2xs">
        <table className="table-auto w-full text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              {[
                "Medicine Name *",
                "Batch *",
                "Expiry Date",
                "Pack",
                "Quantity *",
                "Rate (₹) *",
                "MRP (₹)",
                "GST (%)",
                "Disc (%)",
                "Total (₹)",
                "Disc (₹)",
                "GST (₹)",
                "Net (₹)"
              ].map((header, index) => (
                <th
                  key={index}
                  className="p-3 text-left font-semibold text-slate-700 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, rowIndex) => (
              <tr key={rowIndex} className="bg-white hover:bg-slate-50/70 transition-colors">
                {Object.keys(item).map((field, colIndex) => (
                  <td key={colIndex} className="p-2">
                    <input
                      type={
                        ["quantity", "purchaseRate", "mrp", "gstPercentage", "discount", 
                         "totalAmount", "discountAmount", "gstAmount", "netAmount"].includes(field)
                          ? "number"
                          : field === "expiryDate"
                          ? "date"
                          : "text"
                      }
                      name={field}
                      value={item[field]}
                      onChange={(e) => handleItemChange(rowIndex, e)}
                      placeholder={
                        field === "itemName" ? "E.g., Dolo 650mg" :
                        field === "batch" ? "E.g., DL-101" :
                        field === "quantity" ? "Qty" :
                        field === "purchaseRate" ? "Rate" :
                        field === "mrp" ? "MRP" :
                        field === "pack" ? "Strip" :
                        ""
                      }
                      title={`Enter ${field}`}
                      className={`w-full p-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00796b] ${
                        ["totalAmount", "discountAmount", "gstAmount", "netAmount"].includes(field)
                          ? "bg-slate-50 text-slate-600 font-medium border-slate-200 cursor-not-allowed"
                          : "border-slate-300 bg-white"
                      }`}
                      readOnly={["totalAmount", "discountAmount", "gstAmount", "netAmount"].includes(field)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
            <tr>
              <td colSpan="9" className="p-3 text-right text-slate-700">
                Summary Total:
              </td>
              <td className="p-3 text-slate-900 font-mono">
                ₹{totals.totalAmount}
              </td>
              <td className="p-3 text-amber-700 font-mono">
                -₹{totals.discountAmount}
              </td>
              <td className="p-3 text-teal-800 font-mono">
                +₹{totals.gstAmount}
              </td>
              <td className="p-3 text-[#00796b] font-mono text-sm">
                ₹{totals.netAmount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <button
          type="button"
          onClick={addItem}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs flex items-center justify-center space-x-1.5"
        >
          <span>+ Add Medicine Row</span>
        </button>

        <button
          type="button"
          onClick={createPurchaseBill}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#00796b] hover:bg-[#00695c] text-white font-bold text-sm shadow-md shadow-teal-700/20 transition flex items-center justify-center space-x-2"
        >
          <span>✓ Create Purchase Bill &amp; Update Stock</span>
        </button>
      </div>

      {/* Status & Feedback Message */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2.5 ${
            message.includes("successfully")
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{message.includes("successfully") ? "✓" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default PurchaseBillForm;
