import React, { useState, useEffect, useCallback, useReducer } from "react";
import jsPDF from "jspdf";
import { useSocket } from '../context/SocketContext';
import { SOCKET_EVENTS } from '../utils/socketUtils';
import { useRef } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Custom hook for managing items
const useItems = (initialGstNumber) => {
  // Initial state
  const initialState = [
    {
      itemName: "",
      batch: "",
      batchOptions: [],
      availableQuantity: 0,
      quantity: "",
      mrp: "",
      saleRate: "",
      purchaseRate: "",
      discount: "0",
      amount: "",
      gstNo: initialGstNumber,
      gstPercentage: "0",
      expiryDate: ""
    }
  ];

  // Reducer for items state
  const itemsReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_ITEM':
        return state.map((item, index) => 
          index === action.index ? { ...item, ...action.payload } : item
        );
      
      case 'ADD_ITEM':
        return [
          ...state,
          {
            itemName: "",
            batch: "",
            batchOptions: [],
            availableQuantity: 0,
            quantity: "",
            mrp: "",
            saleRate: "",
            purchaseRate: "",
            discount: "0",
            amount: "",
            gstNo: initialGstNumber,
            gstPercentage: "0",
            expiryDate: ""
          }
        ];
      
      case 'RESET_ITEMS':
        return [{
          itemName: "",
          batch: "",
          batchOptions: [],
          availableQuantity: 0,
          quantity: "",
          mrp: "",
          saleRate: "",
          purchaseRate: "",
          discount: "0",
          amount: "",
          gstNo: initialGstNumber,
          gstPercentage: "0",
          expiryDate: ""
        }];
      
      case 'REMOVE_ITEM':
        if (state.length <= 1) return state;
        return state.filter((_, idx) => idx !== action.index);

      case 'UPDATE_ALL_GST':
        return state.map(item => ({
          ...item,
          gstNo: action.payload
        }));
      
      default:
        return state;
    }
  };

  const [items, dispatch] = useReducer(itemsReducer, initialState);

  // Update all items' GST number when it changes
  useEffect(() => {
    dispatch({ type: 'UPDATE_ALL_GST', payload: initialGstNumber });
  }, [initialGstNumber]);

  // Helper functions
  const updateItem = (index, payload) => {
    dispatch({ type: 'UPDATE_ITEM', index, payload });
  };

  const addItem = () => {
    dispatch({ type: 'ADD_ITEM' });
  };

  const removeItem = (index) => {
    dispatch({ type: 'REMOVE_ITEM', index });
  };

  const resetItems = () => {
    dispatch({ type: 'RESET_ITEMS' });
  };

  return { items, updateItem, addItem, removeItem, resetItems };
};

const SellBillForm = () => {
  const [sellDetails, setSellDetails] = useState({
    saleInvoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    receiptNumber: "",
    partyName: "",
    email: "",
    gstNumber: "",
  });

  // Remove the lastInvoiceNumber state since we'll get it from the server
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);

  // AI Drug Safety & Interaction state
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [safetyResult, setSafetyResult] = useState(null);

  const socket = useSocket();
  const fetchTimeout = useRef(null);

  // Use the custom hook for items management
  const { items, updateItem, addItem, removeItem, resetItems } = useItems(sellDetails.gstNumber);

  // Handler for AI Drug Interaction & Patient Safety Check
  const handleCheckDrugSafety = async () => {
    const medNames = items
      .map(item => item.itemName?.trim())
      .filter(Boolean);

    if (medNames.length === 0) {
      toast.error('Please add at least one medicine to the bill first.');
      return;
    }

    setSafetyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/check-interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: medNames })
      });
      const data = await res.json();
      if (res.status === 404) {
        toast.error('Backend route not loaded. Please restart your backend server (npm run dev).');
        return;
      }
      if (data.success && data.data) {
        setSafetyResult(data.data);
        setSafetyModalOpen(true);
      } else {
        toast.error(data.message || 'Safety check could not be completed.');
      }
    } catch (err) {
      console.error('Safety check error:', err);
      toast.error('Error connecting to AI Safety engine. Is the backend running?');
    } finally {
      setSafetyLoading(false);
    }
  };

  // Fetch the next invoice number when component mounts
  useEffect(() => {
    const fetchNextInvoiceNumber = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        
        console.log('Fetching next invoice number with token:', token);
        console.log('User email:', email);
        
        if (!token || !email) {
          console.error('Missing token or email in localStorage');
          setMessage('Authentication information missing. Please log in again.');
          
          // Set default invoice number if authentication fails
          setSellDetails(prev => ({
            ...prev,
            saleInvoiceNumber: "INV001",
            date: new Date().toISOString().split("T")[0],
            receiptNumber: "",
            partyName: "",
            email: "",
            gstNumber: "",
          }));
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/bills/next-invoice-number`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email })
        });
  
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
  
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch next invoice number');
        }
  
        // Update sell details with the fetched invoice number
        setSellDetails(prev => ({
          ...prev,
          saleInvoiceNumber: data.invoiceNumber || "INV001", // Fallback to INV001 if no invoice number
          date: new Date().toISOString().split("T")[0],
          receiptNumber: data.receiptNumber || "REC001",
          partyName: "",
          email: "",
          gstNumber: "",
        }));
        
      } catch (error) {
        console.error('Error fetching next invoice number:', error);
        setMessage(error.message);
        
        // Set default invoice number in case of any error
        setSellDetails(prev => ({
          ...prev,
          saleInvoiceNumber: "INV001",
          date: new Date().toISOString().split("T")[0],
          receiptNumber: "REC001",
          partyName: "",
          email: "",
          gstNumber: "",
        }));
      }
    };
  
    fetchNextInvoiceNumber();
  }, []);

  // Function to generate next invoice number
  const generateNextInvoiceNumber = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      
      console.log("Generating next invoice number with:", { token, email });
      
      const response = await fetch(`${API_BASE_URL}/api/bills/next-invoice-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email })
      });
      
      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      if (response.ok) {
        return responseData;
      } else {
        setMessage(`Error generating next invoice number: ${responseData.message || 'Unknown error'}`);
        return null;
      }
    } catch (error) {
      console.error("Error in generateNextInvoiceNumber:", error);
      setMessage(`Error generating next invoice number: ${error.message}`);
      return null;
    }
  };

  // Reset function to also handle invoice number generation
  const resetForm = async () => {
    const nextInvoiceData = await generateNextInvoiceNumber();
    if (nextInvoiceData) {
      setSellDetails(prev => ({
        ...prev,
        saleInvoiceNumber: nextInvoiceData.invoiceNumber,
        receiptNumber: nextInvoiceData.receiptNumber || "REC001",
        partyName: "",
        email: "",
        gstNumber: "",
        date: new Date().toISOString().split("T")[0],
      }));
    }
  };

  const calculateItemTotals = (updatedItemData) => {
    const qty = parseFloat(updatedItemData.quantity) || 0;
    const mrp = parseFloat(updatedItemData.mrp) || 0;
    let saleRate = parseFloat(updatedItemData.saleRate);
    let discount = parseFloat(updatedItemData.discount) || 0;
    const gstPercentage = parseFloat(updatedItemData.gstPercentage) || 0;
    const availableQty = parseFloat(updatedItemData.availableQuantity) || 0;
    
    // Default saleRate to MRP if not explicitly provided
    if (isNaN(saleRate) || saleRate <= 0) {
      saleRate = mrp > 0 ? mrp : 0;
    }

    if (qty > availableQty && availableQty > 0) {
      setMessage({ type: 'error', text: `Insufficient stock for ${updatedItemData.itemName}. Available: ${availableQty}` });
      return { 
        ...updatedItemData, 
        saleRate: saleRate > 0 ? saleRate.toString() : (updatedItemData.saleRate || ""),
        amount: "-" 
      };
    } else if (qty < 0) {
      setMessage({ type: 'error', text: "Quantity cannot be negative" });
      return { 
        ...updatedItemData, 
        saleRate: saleRate > 0 ? saleRate.toString() : (updatedItemData.saleRate || ""),
        amount: "-" 
      };
    }
    
    if (qty === 0) {
      return { 
        ...updatedItemData, 
        saleRate: saleRate > 0 ? saleRate.toString() : (updatedItemData.saleRate || ""),
        amount: "-",
        netAmount: "-"
      };
    }

    // Effective unit price after discount
    const effectiveUnitPrice = discount > 0 ? saleRate * (1 - discount / 100) : saleRate;
    const totalAmount = qty * effectiveUnitPrice;
    const undiscountedTotal = qty * saleRate;
    const discountAmount = undiscountedTotal - totalAmount;
    
    const gstAmount = (totalAmount * gstPercentage) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;
    const igst = 0;
    
    const netAmount = totalAmount + gstAmount;
    
    setMessage("");
    return {
      ...updatedItemData,
      saleRate: saleRate.toString(),
      amount: netAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      sgst: sgst.toFixed(2),
      cgst: cgst.toFixed(2),
      igst: igst.toFixed(2),
      totalGst: gstAmount.toFixed(2),
      netAmount: netAmount.toFixed(2)
    };
  };

  // Stable timer ref for debounced search
  const debounceTimerRef = useRef(null);

  // Fetch inventory batches and available stock for autocomplete dropdown without overwriting user's typing
  const fetchInventoryData = useCallback((itemName, email, index) => {
    if (!itemName || itemName.trim().length < 2) {
      setSearchResults([]);
      setShowAutocomplete(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const safeEmail = email || localStorage.getItem("email") || "";
        const response = await fetch(
          `${API_BASE_URL}/api/inventory/available?itemName=${encodeURIComponent(
            itemName.trim()
          )}&email=${encodeURIComponent(safeEmail)}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          setSearchResults(data);
          setShowAutocomplete(true);
          setMessage("");

          // If the user typed or scanned an EXACT match (case-insensitive), auto-populate batch & price
          const exactMatch = data.find(
            b => b.itemName?.trim().toLowerCase() === itemName.trim().toLowerCase()
          );
          if (exactMatch) {
            const matchingBatches = data.filter(
              r => r.itemName?.trim().toLowerCase() === exactMatch.itemName?.trim().toLowerCase()
            );
            const batchOptions = matchingBatches.map((b) => ({
              batchNumber: b.batch || 'DEFAULT',
              quantity: b.availableQuantity ?? b.quantity ?? 0,
              mrp: b.mrp,
              purchaseRate: b.purchaseRate,
              gstNo: sellDetails.gstNumber,
              expiryDate: b.expiryDate,
              gstPercentage: b.gstPercentage
            }));

            const inStockBatch = matchingBatches.find(b => (b.availableQuantity ?? b.quantity ?? 0) > 0) || matchingBatches[0];
            const autoMrp = inStockBatch.mrp?.toString() || inStockBatch.purchaseRate?.toString() || "";
            const autoSaleRate = autoMrp;
            const autoPurchaseRate = inStockBatch.purchaseRate?.toString() || "";
            const autoGst = inStockBatch.gstPercentage?.toString() || "0";
            const autoAvailable = inStockBatch.availableQuantity ?? inStockBatch.quantity ?? 0;
            const defaultQty = autoAvailable > 0 ? "1" : "0";

            let newRow = {
              itemName: exactMatch.itemName,
              batchOptions,
              batch: inStockBatch.batch || 'DEFAULT',
              availableQuantity: autoAvailable,
              quantity: defaultQty,
              mrp: autoMrp,
              saleRate: autoSaleRate,
              purchaseRate: autoPurchaseRate,
              discount: "0",
              gstPercentage: autoGst,
              expiryDate: inStockBatch.expiryDate || ""
            };

            newRow = calculateItemTotals(newRow);
            updateItem(index, newRow);
          }
        } else {
          setSearchResults([]);
          setShowAutocomplete(false);
          setMessage(`No existing stock found for "${itemName}". You can still create the invoice manually.`);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        setMessage(`Error checking inventory: ${error.message}`);
        setSearchResults([]);
        setShowAutocomplete(false);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
  }, [sellDetails.gstNumber, updateItem]);

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const email = localStorage.getItem("email") || "";
    
    // Handle item name change with debounced search
    if (name === "itemName") {
      updateItem(index, { itemName: value });
      
      if (value && value.trim().length >= 2) {
        setActiveItemIndex(index);
        fetchInventoryData(value, email, index);
      } else {
        setShowAutocomplete(false);
      }
      return;
    }

    // Handle batch selection: auto-populate MRP, Sale Rate, Purchase Rate, GST, Expiry
    if (name === "batch") {
      const currentItem = items[index];
      const cleanBatch = value;
      const selectedBatch = currentItem.batchOptions.find(
        (batch) => batch.batchNumber === cleanBatch
      );
      
      if (selectedBatch) {
        const autoMrp = selectedBatch.mrp?.toString() || selectedBatch.purchaseRate?.toString() || "";
        const autoSaleRate = autoMrp; // Default sales rate = MRP
        const autoPurchaseRate = selectedBatch.purchaseRate?.toString() || "";
        const autoGst = selectedBatch.gstPercentage?.toString() || "0";
        const autoAvailable = selectedBatch.quantity ?? 0;
        const currentQty = parseFloat(currentItem.quantity);
        const defaultQty = (currentQty > 0 && currentQty <= autoAvailable) ? currentQty.toString() : (autoAvailable > 0 ? "1" : "0");

        let updatedPayload = {
          ...currentItem,
          batch: cleanBatch,
          availableQuantity: autoAvailable,
          quantity: defaultQty,
          mrp: autoMrp,
          saleRate: autoSaleRate,
          purchaseRate: autoPurchaseRate,
          discount: currentItem.discount || "0",
          gstPercentage: autoGst,
          expiryDate: selectedBatch.expiryDate || ""
        };
        updatedPayload = calculateItemTotals(updatedPayload);
        updateItem(index, updatedPayload);
      }
      return;
    }

    // When user changes Sale Rate: automatically recalculate discount %
    if (name === "saleRate") {
      const currentMrp = parseFloat(items[index].mrp) || 0;
      const newRate = parseFloat(value) || 0;
      let newDiscount = "0";
      if (currentMrp > 0 && newRate < currentMrp) {
        newDiscount = (((currentMrp - newRate) / currentMrp) * 100).toFixed(1);
      }
      let updatedPayload = { ...items[index], saleRate: value, discount: newDiscount };
      updatedPayload = calculateItemTotals(updatedPayload);
      updateItem(index, updatedPayload);
      return;
    }

    // When user changes Discount %: automatically recalculate Sale Rate
    if (name === "discount") {
      const currentMrp = parseFloat(items[index].mrp) || 0;
      const newDisc = parseFloat(value) || 0;
      let newSaleRate = currentMrp;
      if (currentMrp > 0 && newDisc >= 0) {
        newSaleRate = currentMrp * (1 - newDisc / 100);
      }
      let updatedPayload = { ...items[index], discount: value, saleRate: newSaleRate.toFixed(2) };
      updatedPayload = calculateItemTotals(updatedPayload);
      updateItem(index, updatedPayload);
      return;
    }

    // When user changes MRP: automatically recalculate Sale Rate based on existing discount
    if (name === "mrp") {
      const newMrp = parseFloat(value) || 0;
      const currentDisc = parseFloat(items[index].discount) || 0;
      const newSaleRate = newMrp * (1 - currentDisc / 100);
      let updatedPayload = { ...items[index], mrp: value, saleRate: newSaleRate.toFixed(2) };
      updatedPayload = calculateItemTotals(updatedPayload);
      updateItem(index, updatedPayload);
      return;
    }
    
    // Handle quantity and other fields
    let updatedPayload = { ...items[index], [name]: value };
    updatedPayload = calculateItemTotals(updatedPayload);
    updateItem(index, updatedPayload);
  };

  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    // Prevent changing invoice number
    if (name === 'saleInvoiceNumber') return;
    setSellDetails({ ...sellDetails, [name]: value });
  };
  
  // Handle autocomplete selection - instant populate without debounced refetch lag
  const handleAutocompleteSelect = (selectedResult) => {
    if (activeItemIndex === null) return;
    setShowAutocomplete(false);

    // Resolve target result whether passed as object or string
    const targetItem = (typeof selectedResult === 'object' && selectedResult !== null)
      ? selectedResult
      : (searchResults.find(r => r.itemName === selectedResult) || { itemName: selectedResult });

    // Find all batches in searchResults for this medicine
    const matchingBatches = searchResults.filter(
      r => r.itemName?.trim().toLowerCase() === targetItem.itemName?.trim().toLowerCase()
    );

    const batchOptions = (matchingBatches.length > 0 ? matchingBatches : [targetItem]).map((b) => ({
      batchNumber: b.batch || 'DEFAULT',
      quantity: b.availableQuantity ?? b.quantity ?? 0,
      mrp: b.mrp,
      purchaseRate: b.purchaseRate,
      gstNo: sellDetails.gstNumber,
      expiryDate: b.expiryDate,
      gstPercentage: b.gstPercentage
    }));

    // Pick in-stock batch if selected one is empty
    const inStockBatch = (targetItem.availableQuantity > 0 ? targetItem : null)
      || matchingBatches.find(b => (b.availableQuantity ?? b.quantity ?? 0) > 0)
      || targetItem;

    const autoMrp = inStockBatch.mrp?.toString() || inStockBatch.purchaseRate?.toString() || "";
    const autoSaleRate = autoMrp; // Default sales rate = MRP
    const autoPurchaseRate = inStockBatch.purchaseRate?.toString() || "";
    const autoGst = inStockBatch.gstPercentage?.toString() || "0";
    const autoAvailable = inStockBatch.availableQuantity ?? inStockBatch.quantity ?? 0;
    const defaultQty = autoAvailable > 0 ? "1" : "0";

    let updatedRow = {
      itemName: targetItem.itemName,
      batchOptions,
      batch: inStockBatch.batch || 'DEFAULT',
      availableQuantity: autoAvailable,
      quantity: defaultQty,
      mrp: autoMrp,
      saleRate: autoSaleRate,
      purchaseRate: autoPurchaseRate,
      discount: "0",
      gstPercentage: autoGst,
      expiryDate: inStockBatch.expiryDate || ""
    };

    updatedRow = calculateItemTotals(updatedRow);
    updateItem(activeItemIndex, updatedRow);
    setMessage("");
  };
  
  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAutocomplete(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Real-time inventory update via WebSocket
  useEffect(() => {
    if (!socket) return;
    const handleInventoryUpdate = () => {
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
      fetchTimeout.current = setTimeout(() => {
        // Re-fetch suggestions for the active item (if any)
        if (activeItemIndex !== null && items[activeItemIndex]?.itemName) {
          const email = localStorage.getItem('email');
          fetchInventoryData(items[activeItemIndex].itemName, email, activeItemIndex);
        }
        fetchTimeout.current = null;
      }, 1000); // debounce
    };
    socket.on(SOCKET_EVENTS.INVENTORY_UPDATE, handleInventoryUpdate);
    return () => {
      socket.off(SOCKET_EVENTS.INVENTORY_UPDATE, handleInventoryUpdate);
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    };
  }, [socket, activeItemIndex, items, fetchInventoryData]);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header with gradient background
    doc.setFillColor(41, 128, 185); // Blue color
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Sales Invoice', 105, 20, { align: 'center' });
    
    // Add company details
    doc.setFontSize(10);
    doc.text('Medicine Inventory Management System', 105, 30, { align: 'center' });
    
    // Add invoice details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${sellDetails.saleInvoiceNumber || 'INV001'}`, 20, 50);
    doc.text(`Date: ${sellDetails.date}`, 20, 60);
    doc.text(`Receipt Number: ${sellDetails.receiptNumber}`, 20, 70);
    
    // Add party details
    doc.setFontSize(12);
    doc.text('Party Details:', 20, 85);
    doc.setFontSize(10);
    doc.text(`Name: ${sellDetails.partyName}`, 20, 95);
    doc.text(`GST Number: ${sellDetails.gstNumber}`, 20, 100);
    
    // Add items table
    const tableColumn = [
      'Item Name',
      'Batch',
      'Qty',
      'MRP',
      'Rate',
      'Disc%',
      'GST%',
      'Expiry Date',
      'Amount'
    ];
    
    const tableRows = items.map(item => [
      item.itemName,
      item.batch,
      item.quantity,
      `₹${parseFloat(item.mrp || 0).toFixed(2)}`,
      `₹${parseFloat(item.saleRate || item.mrp || 0).toFixed(2)}`,
      `${item.discount || 0}%`,
      `${item.gstPercentage || 0}%`,
      item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '-',
      `₹${parseFloat(item.amount || 0).toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Item Name
        1: { cellWidth: 15 }, // Batch
        2: { cellWidth: 10 }, // Quantity
        3: { cellWidth: 20 }, // Purchase Rate
        4: { cellWidth: 15 }, // MRP
        5: { cellWidth: 10 }, // Discount
        6: { cellWidth: 10 }, // GST
        7: { cellWidth: 20 }, // Expiry Date
        8: { cellWidth: 20 }  // Amount
      },
      styles: {
        cellPadding: 2,
        fontSize: 9,
        valign: 'middle'
      },
      margin: { left: 20, right: 20 }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text('Bill Summary', 20, finalY);
    
    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (parseFloat(item.discountAmount) || 0), 0);
    const totalGst = items.reduce((sum, item) => sum + (parseFloat(item.gstAmount) || 0), 0);
    const netAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    doc.setFontSize(10);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 20, finalY + 10);
    doc.text(`Total Discount: ₹${totalDiscount.toFixed(2)}`, 20, finalY + 20);
    doc.text(`Total GST: ₹${totalGst.toFixed(2)}`, 20, finalY + 30);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Net Amount: ₹${netAmount.toFixed(2)}`, 20, finalY + 45);
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated document. No signature required.', 105, 280, { align: 'center' });
    
    // Add terms and conditions
    doc.setFontSize(8);
    doc.text('Terms and Conditions:', 20, 290);
    doc.setFontSize(7);
    doc.text('1. Goods once sold will not be taken back.', 20, 295);
    doc.text('2. Subject to local jurisdiction.', 20, 300);
    
    // Save the PDF with proper invoice number
    const invoiceNumber = sellDetails.saleInvoiceNumber || 'INV001';
    doc.save(`SalesInvoice_${invoiceNumber}.pdf`);
  };

  //New function to update inventory quantities after a sale
  // const updateInventoryQuantities = async (soldItems) => {
  //   const token = localStorage.getItem("token");
  //   const email = localStorage.getItem("email");
    
  //   try {
  //     // Create an array of inventory updates
  //     const updates = soldItems.map(item => ({
  //       email,
  //       itemName: item.itemName,
  //       batch: item.batch,
  //       quantity: -Number(item.quantity) // Negative value to reduce inventory
  //     }));
      
  //     // Make the API call to update inventory
  //     const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventory/update-batch-quantities`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ updates }),
  //     });
      
  //     const data = await response.json();
      
  //     if (!response.ok) {
  //       throw new Error(data.message || "Failed to update inventory");
  //     }
      
  //     console.log("Inventory updated successfully:", data);
  //     return true;
  //   } catch (error) {
  //     console.error("Error updating inventory:", error);
  //     // Check if the error message contains a specific pattern that indicates
  //     // the inventory was actually updated despite the error message
  //     if (error.message && error.message.includes("already updated") || 
  //         error.message.includes("success")) {
  //       console.log("Inventory seems to have been updated despite the error");
  //       return true;
  //     }
  //     setMessage({ type: 'error', text: `Error updating inventory: ${error.message}` });
  //     return false;
  //   }
  // };

  
  
  // const createSellBill = async () => {
  //   const token = localStorage.getItem("token");
  //   const email = localStorage.getItem("email");
  
  //   if (!sellDetails.gstNumber) {
  //     setMessage({ type: 'error', text: "GST Number is required" });
  //     return;
  //   }
  
  //   const gstMismatch = items.some(item => item.gstNo !== sellDetails.gstNumber);
  //   if (gstMismatch) {
  //     setMessage({ type: 'error', text: "All items must have the same GST Number" });
  //     return;
  //   }
  
  //   const invalidQuantities = items.some(item => 
  //     item.availableQuantity < Number(item.quantity) || 
  //     Number(item.quantity) <= 0
  //   );
  
  //   if (invalidQuantities) {
  //     setMessage({ type: 'error', text: "Invalid quantities detected" });
  //     return;
  //   }
  
  //   // Calculate totals
  //   const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
  //   const totalDiscount = items.reduce((sum, item) => sum + (parseFloat(item.discountAmount) || 0), 0);
  //   const totalGst = items.reduce((sum, item) => sum + (parseFloat(item.gstAmount) || 0), 0);
  //   const netAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  //   const body = {
  //     ...sellDetails,
  //     items: items.map(({ batchOptions, availableQuantity, ...rest }) => ({
  //       ...rest,
  //       quantity: Number(rest.quantity),
  //       mrp: Number(rest.mrp),
  //       discount: Number(rest.discount),
  //       gstPercentage: Number(rest.gstPercentage),
  //       gstNo: sellDetails.gstNumber,
  //       amount: Number(rest.amount),
  //       totalAmount: Number(rest.totalAmount),
  //       discountAmount: Number(rest.discountAmount),
  //       gstAmount: Number(rest.gstAmount),
  //       netAmount: Number(rest.netAmount)
  //     })),
  //     totalAmount,
  //     discountAmount: totalDiscount,
  //     sgstAmount: totalGst / 2,
  //     cgstAmount: totalGst / 2,
  //     igstAmount: 0,
  //     totalGstAmount: totalGst,
  //     netAmount,
  //     email
  //   };
  
  //   try {
  //     setLoading(true);
  //     const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bills/sale`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(body),
  //     });
  
  //     const responseData = await response.json();
  
  //     if (response.ok) {
  //       // Set success message before updating inventory
  //       setMessage({ type: 'success', text: "Invoice created successfully!" });
        
  //       // Update inventory quantities after successful bill creation
  //       try {
  //         const inventoryUpdated = await updateInventoryQuantities(items);
          
  //         if (inventoryUpdated) {
  //           setMessage({ type: 'success', text: "Invoice created and inventory updated successfully!" });
  //           generatePDF();
  //           resetItems();
  //           resetForm();
  //         }
  //       } catch (updateError) {
  //         console.error("Error in inventory update:", updateError);
  //         // Don't change the success message even if inventory update has an error
  //         // Since we know the bill was created successfully
  //         generatePDF();
  //         resetItems();
  //         resetForm();
  //       }
  //     } else {
  //       setMessage({ type: 'error', text: responseData.message || "Failed to create invoice" });
  //     }
  //   } catch (error) {
  //     setMessage({ type: 'error', text: "Error creating invoice" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const createSellBill = async () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!sellDetails.gstNumber) {
      setMessage({ type: 'error', text: "GST Number is required" });
      return;
    }

    const gstMismatch = items.some(item => item.gstNo !== sellDetails.gstNumber);
    if (gstMismatch) {
      setMessage({ type: 'error', text: "All items must have the same GST Number" });
      return;
    }

    const invalidQuantities = items.some(item => 
      item.availableQuantity < Number(item.quantity) || 
      Number(item.quantity) <= 0
    );

    if (invalidQuantities) {
      setMessage({ type: 'error', text: "Invalid quantities detected" });
      return;
    }

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (parseFloat(item.discountAmount) || 0), 0);
    const totalGst = items.reduce((sum, item) => sum + (parseFloat(item.gstAmount) || 0), 0);
    const netAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const body = {
      ...sellDetails,
      items: items.map(({ batchOptions, availableQuantity, ...rest }) => ({
        ...rest,
        quantity: Number(rest.quantity),
        mrp: Number(rest.mrp),
        discount: Number(rest.discount),
        gstPercentage: Number(rest.gstPercentage),
        gstNo: sellDetails.gstNumber,
        amount: Number(rest.amount),
        totalAmount: Number(rest.totalAmount),
        discountAmount: Number(rest.discountAmount),
        gstAmount: Number(rest.gstAmount),
        netAmount: Number(rest.netAmount)
      })),
      totalAmount,
      discountAmount: totalDiscount,
      sgstAmount: totalGst / 2,
      cgstAmount: totalGst / 2,
      igstAmount: 0,
      totalGstAmount: totalGst,
      netAmount,
      email
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bills/sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": `sale-${sellDetails.saleInvoiceNumber}`
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        setMessage({ type: 'success', text: 'Sales invoice created & inventory stock updated successfully!' });
        if (typeof toast !== 'undefined' && toast.success) {
          toast.success('Sales invoice created & stock updated!');
        }

        // Handle PDF download
        if (responseData.pdfUrl) {
          try {
            const pdfResponse = await fetch(`${API_BASE_URL}${responseData.pdfUrl}`);
            const blob = await pdfResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${sellDetails.saleInvoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          } catch (pdfError) {
            console.error('Error downloading backend PDF, generating client PDF:', pdfError);
            generatePDF();
          }
        } else {
          generatePDF();
        }

        resetItems();
        resetForm();

        // Broadcast inventory update via socket
        if (socket) {
          socket.emit(SOCKET_EVENTS.INVENTORY_UPDATE, {
            email,
            timestamp: new Date().toISOString()
          });
        }
        return;
      }

      // If response not ok, show detailed error
      const errorMsg = responseData.message || responseData.error || "Failed to create invoice";
      setMessage({ type: 'error', text: errorMsg });
    } catch (error) {
      setMessage({ type: 'error', text: "Error creating invoice: " + (error.message || '') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1360px] mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">Create Sales Invoice</h2>
          <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                placeholder="E.g., 27AADCP1234F1Z5 or 'UNREGISTERED'"
                className="rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 transition-colors"
                value={sellDetails.gstNumber}
                onChange={handleDetailsChange}
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Party Name</label>
              <input
                type="text"
                name="partyName"
                placeholder="E.g., Rahul Sharma - Type precisely for history tracking"
                className="rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 transition-colors"
                value={sellDetails.partyName}
                onChange={handleDetailsChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="saleInvoiceNumber"
                  value={sellDetails.saleInvoiceNumber}
                  className="rounded-lg border-2 border-indigo-100 bg-gray-100 p-3 transition-colors"
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  className="rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 transition-colors"
                  value={sellDetails.date}
                  onChange={handleDetailsChange}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input
                type="text"
                name="receiptNumber"
                placeholder="E.g., SRCP-1052"
                className="rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 transition-colors"
                value={sellDetails.receiptNumber}
                onChange={handleDetailsChange}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-indigo-600">Item Details</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
              {items.length} {items.length === 1 ? 'item' : 'items'} in bill
            </span>
          </div>
          <div className="rounded-xl border-2 border-indigo-50 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[320px]">Item Name</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[150px]">Batch</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[90px] text-center">Available</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[85px] text-center">Qty</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[105px] text-center">MRP (₹)</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[120px] text-center">Sale Rate (₹)</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[90px] text-center">Disc %</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[90px] text-center">GST %</th>
                  <th className="px-3 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[110px] text-center">Expiry</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider min-w-[125px] text-right">Net Amount</th>
                  <th className="px-2 py-3.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50 bg-white">
                {items.map((item, index) => {
                  // Calculate adjusted available quantity for this row
                  const pickedElsewhere = items.reduce((sum, row, idx) => {
                    if (
                      idx !== index &&
                      row.itemName === item.itemName &&
                      row.batch === item.batch &&
                      row.batch && row.itemName
                    ) {
                      return sum + (parseFloat(row.quantity) || 0);
                    }
                    return sum;
                  }, 0);
                  const adjustedAvailable = (parseFloat(item.availableQuantity) || 0) - pickedElsewhere;
                  return (
                    <tr 
                      key={index}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      {/* Medicine Search with Generous Width */}
                      <td className="px-4 py-3 relative min-w-[320px]">
                        <input
                          type="text"
                          name="itemName"
                          placeholder="Type medicine name (e.g. Zincovit, Dolo)..."
                          title="Start typing a medicine name to search available batches"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (searchResults && searchResults.length > 0) {
                                const exact = searchResults.find(
                                  r => r.itemName?.trim().toLowerCase() === item.itemName?.trim().toLowerCase()
                                );
                                handleAutocompleteSelect(exact || searchResults[0]);
                              }
                            } else if (e.key === 'Escape') {
                              setShowAutocomplete(false);
                            }
                          }}
                          autoComplete="off"
                          className="w-full rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white placeholder-gray-400 transition-colors shadow-2xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveItemIndex(index);
                            if (item.itemName && item.itemName.trim().length >= 2) {
                              setShowAutocomplete(true);
                            }
                          }}
                        />
                        {showAutocomplete && activeItemIndex === index && (
                          <div 
                            className="absolute z-30 left-4 mt-1.5 w-[440px] max-w-[90vw] bg-white border border-indigo-100 rounded-xl shadow-2xl max-h-72 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {searchLoading ? (
                              <div className="p-4 text-center text-gray-500 flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                <span className="text-xs font-medium text-slate-500">Searching inventory...</span>
                              </div>
                            ) : searchResults.length > 0 ? (
                              <ul className="divide-y divide-gray-100">
                                {searchResults.map((result, idx) => (
                                  <li 
                                    key={idx}
                                    className="px-4 py-3 hover:bg-indigo-50/70 cursor-pointer flex justify-between items-center transition-colors group"
                                    onClick={() => handleAutocompleteSelect(result)}
                                  >
                                    <div className="flex-1 min-w-0 pr-3">
                                      <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600">
                                        {result.itemName}
                                      </div>
                                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                                          {result.batch || 'DEFAULT'}
                                        </span>
                                        {result.expiryDate && (
                                          <span className="text-slate-400">
                                            Exp: {new Date(result.expiryDate).toLocaleDateString('en-GB')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="text-sm font-bold text-indigo-600">₹{result.mrp || result.purchaseRate || 0}</div>
                                      <div className="text-xs">
                                        <span className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                                          (result.availableQuantity ?? result.quantity ?? 0) > 0 
                                            ? 'bg-emerald-50 text-emerald-700' 
                                            : 'bg-rose-50 text-rose-600'
                                        }`}>
                                          {result.availableQuantity ?? result.quantity ?? 0} in stock
                                        </span>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="p-4 text-center text-xs text-gray-500">
                                No matching inventory batches found
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Batch Select */}
                      <td className="px-3 py-3 min-w-[150px]">
                        <select
                          name="batch"
                          title="Select a batch after typing the item name"
                          value={item.batch}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2.5 px-2.5 text-xs font-semibold text-gray-700 bg-white transition-colors"
                        >
                          <option value="">Select Batch</option>
                          {item.batchOptions.map((batch, idx) => (
                            <option key={idx} value={batch.batchNumber}>
                              {batch.batchNumber} {batch.quantity !== undefined ? `(${batch.quantity} left)` : ''}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Available Count */}
                      <td className="px-3 py-3 text-center min-w-[90px]">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          adjustedAvailable > 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {adjustedAvailable >= 0 ? adjustedAvailable : 0}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-3 py-3 min-w-[85px]">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            if (adjustedAvailable > 0 && val > adjustedAvailable) {
                              setMessage({ type: 'error', text: `Cannot select more than available (${adjustedAvailable}) for this batch.` });
                              return;
                            }
                            setMessage("");
                            handleItemChange(index, e);
                          }}
                          className="w-full rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-2 text-center text-sm font-bold text-gray-900 bg-white shadow-2xs"
                          min="0"
                          max={adjustedAvailable > 0 ? adjustedAvailable : undefined}
                        />
                      </td>

                      {/* Automated MRP */}
                      <td className="px-3 py-3 min-w-[105px]">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-1 text-xs font-medium">₹</span>
                          <input
                            type="number"
                            name="mrp"
                            value={item.mrp}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="0"
                            title="Maximum Retail Price"
                            className="w-full px-2 py-2 text-xs text-center font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500"
                          />
                        </div>
                      </td>

                      {/* Automated & Editable Sale Rate */}
                      <td className="px-3 py-3 min-w-[120px]">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="text-indigo-600 mr-1 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              name="saleRate"
                              value={item.saleRate}
                              onChange={(e) => handleItemChange(index, e)}
                              placeholder="0"
                              title="Customer Selling Rate"
                              className="w-full px-2 py-2 text-xs text-center font-bold text-indigo-900 bg-indigo-50/70 border border-indigo-300 rounded-lg focus:bg-white focus:border-indigo-600 shadow-2xs"
                            />
                          </div>
                          {item.purchaseRate && (
                            <span className="text-[10px] text-slate-400 mt-0.5 text-center whitespace-nowrap">
                              Cost: ₹{item.purchaseRate}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Discount % */}
                      <td className="px-3 py-3 min-w-[90px]">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="discount"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full px-1.5 py-2 text-xs text-center font-medium rounded-lg border-2 border-indigo-100 focus:border-indigo-500"
                            min="0"
                            max="100"
                          />
                          <span className="text-gray-400 ml-1 text-xs">%</span>
                        </div>
                      </td>

                      {/* GST % */}
                      <td className="px-3 py-3 min-w-[90px]">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="gstPercentage"
                            value={item.gstPercentage}
                            onChange={(e) => handleItemChange(index, e)}
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full px-1.5 py-2 text-xs text-center font-medium border-2 border-indigo-100 rounded-lg focus:border-indigo-500"
                          />
                          <span className="text-gray-500 ml-1 text-xs">%</span>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-3 py-3 text-center min-w-[110px]">
                        <span className="text-xs text-slate-700 font-mono font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : '-'}
                        </span>
                      </td>

                      {/* Net Amount */}
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 font-mono text-sm whitespace-nowrap min-w-[125px]">
                        {item.amount && item.amount !== "-" ? `₹${item.amount}` : "-"}
                      </td>

                      {/* Remove Item Action */}
                      <td className="px-2 py-3 text-center w-10">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            title="Remove this medicine row"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={addItem}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Item
            </button>

            <button
              type="button"
              onClick={handleCheckDrugSafety}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center shadow-sm"
              disabled={safetyLoading}
            >
              {safetyLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">🛡️</span>
                  <span>Clinical Drug Safety Check</span>
                </>
              )}
            </button>
          </div>

          <div className="space-x-4">
            {message && (
              <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 mr-2 ${
                    message.type === 'success' ? 'text-green-500' : 'text-rose-500'
                  }`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  {message.type === 'success' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
                {message.text}
              </div>
            )}
            
            <button
              onClick={createSellBill}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Create Sales Invoice"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Drug Safety Assessment Modal */}
      {safetyModalOpen && safetyResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Clinical Drug Safety Assessment</h3>
                  <p className="text-xs text-gray-500">Cross-checking drug interactions & patient risks</p>
                </div>
              </div>
              <button
                onClick={() => setSafetyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Severity Banner */}
            <div className={`p-4 rounded-xl mb-4 ${
              safetyResult.severity === 'high'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : safetyResult.severity === 'moderate'
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              <div className="font-semibold text-sm flex items-center mb-1">
                {safetyResult.severity === 'high' && '⚠️ HIGH RISK: Adverse Interaction Detected'}
                {safetyResult.severity === 'moderate' && '⚡ CAUTION: Moderate Interaction Identified'}
                {(safetyResult.severity === 'low' || safetyResult.severity === 'none') && '✅ SAFE: No Severe Contraindications Found'}
              </div>
              <p className="text-xs mt-1">{safetyResult.summary}</p>
            </div>

            {/* Interactions */}
            {safetyResult.interactions && safetyResult.interactions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Identified Drug-Drug Interactions:</h4>
                <div className="space-y-2">
                  {safetyResult.interactions.map((inter, i) => (
                    <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                      <div className="font-bold text-gray-900">
                        {Array.isArray(inter.drugs) ? inter.drugs.join(' ↔ ') : 'Interacting Medications'}
                      </div>
                      <p className="text-gray-700 mt-1">{inter.description}</p>
                      {inter.clinicalRisk && (
                        <p className="text-red-600 font-medium mt-1">Risk: {inter.clinicalRisk}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cautions */}
            {safetyResult.cautions && safetyResult.cautions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Pharmacist Counseling Notes:</h4>
                <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                  {safetyResult.cautions.map((caution, i) => (
                    <li key={i}>{caution}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {safetyResult.recommendations && (
              <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <span className="font-semibold">Clinical Recommendation: </span>
                {safetyResult.recommendations}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSafetyModalOpen(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellBillForm;


