import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { withIdempotency } from '../middleware/idempotencyMiddleware.js';
import { 
  createPurchaseBill,
  createSaleBill,
  createReturnBill,
  getBills,
  getBatchDetails,
  getPurchaseHistory,
  getNextInvoiceNumber,
  getMedicineSalesDetails,
  getSaleBillDetails,
  getMedicinesByParty,
  getClientsList,
  getTopParties
} from '../controllers/billController.js';
import inventoryRoutes from './inventoryRoutes.js';
import { getPurchaseBillHistory } from '../controllers/billController.js';
import SaleBill from '../models/SaleBillModel.js';
import ReturnBill from '../models/ReturnBillModel.js';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// Bill Management Routes
router.post('/purchase', isAuthenticated, withIdempotency, createPurchaseBill);
router.post('/sale', isAuthenticated, withIdempotency, createSaleBill);
router.post('/return', isAuthenticated, withIdempotency, createReturnBill);

// Get bill details
router.get('/sale-bill/:billId', isAuthenticated, getSaleBillDetails);
router.get('/batch-details', isAuthenticated, getBatchDetails);
router.get('/purchase-history', isAuthenticated, getPurchaseHistory);
router.post('/next-invoice-number', isAuthenticated, getNextInvoiceNumber);
router.get('/medicine-sales', isAuthenticated, getMedicineSalesDetails);
router.get('/top-parties', isAuthenticated, getTopParties);
router.get('/medicines-by-party', isAuthenticated, getMedicinesByParty);
router.get('/clients', isAuthenticated, getClientsList);

// Inventory Sub-routes
router.use('/inventory', inventoryRoutes);

// Get returnable quantities for medicines by party or invoice
router.get('/returnable-quantities', isAuthenticated, async (req, res) => {
  try {
    const { email, partyName, invoiceNumber } = req.query;
    console.log('Query params:', { email, partyName, invoiceNumber });

    if (!email || (!partyName && !invoiceNumber)) {
      return res.status(400).json({ message: 'Email and either party name or invoice number are required' });
    }

    let actualPartyName = partyName;
    let billItems = null;

    if (invoiceNumber) {
      const cleanInvoiceNumber = invoiceNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const invoiceRegex = new RegExp(`^\\s*${cleanInvoiceNumber}\\s*$`, 'i');
      
      const bill = await SaleBill.findOne({
        email,
        $or: [
          { saleInvoiceNumber: invoiceRegex },
          { receiptNumber: invoiceRegex }
        ]
      });

      if (!bill) {
        return res.status(404).json({ message: 'Sale bill not found for the given invoice/receipt number' });
      }

      actualPartyName = bill.partyName || bill.customerName;
      billItems = bill.items;
    }

    const cleanPartyName = actualPartyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
    const partyRegex = new RegExp(`^\\s*${cleanPartyName}\\s*$`, 'i');

    // Get all sale bills for the party (case-insensitive exact match)
    const saleBills = await SaleBill.find({
      email,
      $or: [
        { partyName: partyRegex },
        { customerName: partyRegex }
      ]
    });
    console.log('Found sale bills for party:', saleBills.length);

    // Get all return bills for the party (case-insensitive exact match)
    const returnBills = await ReturnBill.find({
      email,
      customerName: partyRegex
    });
    console.log('Found return bills for party:', returnBills.length);

    // Create a map to store total sold quantities to this party
    const partySoldMap = new Map();
    saleBills.forEach(bill => {
      if (bill.items && Array.isArray(bill.items)) {
        bill.items.forEach(item => {
          if (item.itemName && item.batch && item.quantity) {
            const key = `${item.itemName.trim().toLowerCase()}-${item.batch.trim()}`;
            const currentData = partySoldMap.get(key) || {
              itemName: item.itemName,
              batch: item.batch,
              quantity: 0,
              mrp: item.mrp || 0,
              discount: item.discount || 0,
              gstPercentage: item.gstPercentage || 0
            };
            currentData.quantity += parseInt(item.quantity) || 0;
            partySoldMap.set(key, currentData);
          }
        });
      }
    });
    console.log('Party sold map size:', partySoldMap.size);

    // Create a map to store total returned quantities from this party
    const partyReturnedMap = new Map();
    returnBills.forEach(bill => {
      if (bill.items && Array.isArray(bill.items)) {
        bill.items.forEach(item => {
          if (item.itemName && item.batch && item.quantity) {
            const key = `${item.itemName.trim().toLowerCase()}-${item.batch.trim()}`;
            const currentQuantity = partyReturnedMap.get(key) || 0;
            partyReturnedMap.set(key, currentQuantity + (parseInt(item.quantity) || 0));
          }
        });
      }
    });
    console.log('Party returned map size:', partyReturnedMap.size);

    // Get purchase rates from inventory
    const inventoryItems = await Inventory.find({
      email,
      itemName: { $in: Array.from(partySoldMap.keys()).map(key => key.split('-')[0]) }
    });
    console.log('Found inventory items:', inventoryItems.length);

    // Create a map of purchase rates by item and batch
    const purchaseRateMap = new Map();
    inventoryItems.forEach(item => {
      const key = `${item.itemName.toLowerCase()}-${item.batch}`;
      purchaseRateMap.set(key, item.purchaseRate);
    });

    // Calculate returnable quantities
    const returnableQuantities = [];
    partySoldMap.forEach((soldData, key) => {
      const returnedQuantity = partyReturnedMap.get(key) || 0;
      const returnableQuantity = soldData.quantity - returnedQuantity;
      const purchaseRate = purchaseRateMap.get(key) || 0;

      if (returnableQuantity > 0) {
        returnableQuantities.push({
          itemName: soldData.itemName,
          batch: soldData.batch,
          soldQuantity: soldData.quantity, // Total sold to this specific party
          returnedQuantity: returnedQuantity, // Total returned by this specific party
          returnableQuantity: returnableQuantity, // What they can still return
          mrp: soldData.mrp,
          purchaseRate: purchaseRate,
          discount: soldData.discount,
          gstPercentage: soldData.gstPercentage
        });
      }
    });
    console.log('Returnable quantities:', returnableQuantities.length);

    // Sort by item name and batch
    returnableQuantities.sort((a, b) => {
      if (a.itemName.toLowerCase() === b.itemName.toLowerCase()) {
        return a.batch.localeCompare(b.batch);
      }
      return a.itemName.toLowerCase().localeCompare(b.itemName.toLowerCase());
    });

    let finalReturnableQuantities = returnableQuantities;
    if (billItems) {
      const billItemKeys = new Set(billItems.map(item => `${item.itemName.toLowerCase()}-${item.batch}`));
      finalReturnableQuantities = returnableQuantities.filter(item => 
        billItemKeys.has(`${item.itemName.toLowerCase()}-${item.batch}`)
      );
    }

    res.json({
      partyName: actualPartyName,
      items: finalReturnableQuantities
    });
  } catch (error) {
    console.error('Error getting returnable quantities:', error);
    res.status(500).json({ message: 'Error getting returnable quantities', error: error.message });
  }
});

// Get invoices for a specific party/customer/invoice
router.get('/party-invoices/:searchTerm', isAuthenticated, async (req, res) => {
  try {
    const email = req.user?.email || req.query.email;
    const { searchTerm } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanSearchTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
    const searchRegex = new RegExp(`^\\s*${cleanSearchTerm}\\s*$`, 'i');

    const invoices = await SaleBill.find({
      email,
      $or: [
        { partyName: searchRegex },
        { saleInvoiceNumber: searchRegex },
        { receiptNumber: searchRegex },
        { customerName: searchRegex } // Just in case customerName is used instead of partyName
      ]
    }).sort({ date: -1 });

    res.json({ invoices });
  } catch (error) {
    console.error('Error fetching party invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
});

export default router;