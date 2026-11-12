import express from 'express';
import {
    getReturnableQuantities,
    createPurchaseReturnBill,
    getPurchaseReturnBills
} from '../controllers/purchaseReturnController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { withIdempotency } from '../middleware/idempotencyMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get returnable quantities for a supplier
router.get('/returnable-quantities', isAuthenticated, getReturnableQuantities);

// Create a purchase return bill
router.post('/create', isAuthenticated, withIdempotency, createPurchaseReturnBill);

// Get all purchase return bills
router.get('/bills', isAuthenticated, getPurchaseReturnBills);

// Download PDF route
router.get('/download/pdf/:filename', isAuthenticated, (req, res) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const pdfPath = path.join(__dirname, '..', 'pdfs', req.params.filename);
        
        res.download(pdfPath, req.params.filename, (err) => {
            if (err) {
                console.error('Error downloading PDF:', err);
                res.status(404).json({ 
                    success: false, 
                    message: 'PDF file not found',
                    error: err.message 
                });
            }
        });
    } catch (error) {
        console.error('Error in download route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error downloading PDF',
            error: error.message 
        });
    }
});

export default router; 