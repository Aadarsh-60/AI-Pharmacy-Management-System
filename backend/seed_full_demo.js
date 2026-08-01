import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

dotenv.config({ path: './config/.env' });

const seedFullDemo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        console.log('Clearing old data (Keeping Users intact)...');
        const collectionsToClear = [
            'bills', 'salebills', 'returnbills', 'purchasereturnbills', 
            'inventories', 'activitylogs', 'customerpurchases'
        ];
        
        for (const collectionName of collectionsToClear) {
            try {
                await mongoose.connection.collection(collectionName).deleteMany({});
            } catch (e) {
                // Ignore if collection does not exist
            }
        }
        console.log('Old data cleared.');

        const users = await User.find();
        if (users.length === 0) {
            console.error('No users found! Cannot seed without an email address.');
            process.exit(1);
        }

        for (const user of users) {
            const email = user.email;
            console.log(`\n==========================================`);
            console.log(`Seeding data for User: ${email}`);
            console.log(`==========================================`);

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role || 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const baseUrl = 'http://localhost:5000/api';
        
        // ==========================================
        // 1. PURCHASE BILLS (Supplier -> Pharmacy)
        // ==========================================
        console.log('1. Creating Purchase Bills (Generating deep inventory)...');
        
        // Purchase Bill 1 - General Medicines
        const pb1 = {
            email, partyName: "MediLife Suppliers", supplierInvoiceNumber: "INV-2024-101", receiptNumber: "PRCP-101",
            date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
            purchaseAmount: 8500, totalAmount: 8500, discountAmount: 0,
            items: [
                { itemName: "Dolo 650mg", batch: "DL-101", quantity: 5000, purchaseRate: 15, mrp: 30, expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "15x10", category: "Painkillers" },
                { itemName: "Paracetamol 500mg", batch: "PA-102", quantity: 10000, purchaseRate: 10, mrp: 20, expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "10x10", category: "Painkillers" },
                { itemName: "Azithromycin 500mg", batch: "AZ-103", quantity: 3000, purchaseRate: 50, mrp: 75, expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "3x10", category: "Antibiotics" },
                { itemName: "Pantoprazole 40mg", batch: "PN-104", quantity: 4000, purchaseRate: 25, mrp: 45, expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "10x10", category: "Antacid" },
                { itemName: "Cetirizine 10mg", batch: "CT-105", quantity: 6000, purchaseRate: 8, mrp: 18, expiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "10x10", category: "Anti-allergic" }
            ]
        };

        // Purchase Bill 2 - Chronic & Supplements
        const pb2 = {
            email, partyName: "PharmaCorp India", supplierInvoiceNumber: "INV-2024-102", receiptNumber: "PRCP-102",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            purchaseAmount: 12500, totalAmount: 12500, discountAmount: 0,
            items: [
                { itemName: "Metformin 500mg", batch: "MF-201", quantity: 8000, purchaseRate: 20, mrp: 40, expiryDate: new Date(Date.now() + 500 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "15x10", category: "Diabetes" },
                { itemName: "Amlodipine 5mg", batch: "AM-202", quantity: 5000, purchaseRate: 15, mrp: 35, expiryDate: new Date(Date.now() + 450 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "10x10", category: "Blood Pressure" },
                { itemName: "Atorvastatin 20mg", batch: "AT-203", quantity: 4000, purchaseRate: 45, mrp: 85, expiryDate: new Date(Date.now() + 600 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "10x10", category: "Cholesterol" },
                { itemName: "Vitamin C 500mg", batch: "VC-204", quantity: 10000, purchaseRate: 12, mrp: 25, expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "15x10", category: "Vitamins" }, // Expiring soon
                { itemName: "B-Complex Forte", batch: "BC-205", quantity: 7000, purchaseRate: 18, mrp: 38, expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "20x10", category: "Vitamins" }
            ]
        };

        // Purchase Bill 3 - Syrups & Drops
        const pb3 = {
            email, partyName: "HealthCare Distributors", supplierInvoiceNumber: "INV-2024-103", receiptNumber: "PRCP-103",
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            purchaseAmount: 6000, totalAmount: 6000, discountAmount: 0,
            items: [
                { itemName: "Cough Syrup (Adulsa)", batch: "CS-301", quantity: 1500, purchaseRate: 50, mrp: 95, expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "100ml Bottle", category: "Syrup" },
                { itemName: "Ibuprofen Suspension", batch: "IS-302", quantity: 2000, purchaseRate: 35, mrp: 70, expiryDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "60ml Bottle", category: "Syrup" },
                { itemName: "Eye Drops (Tears)", batch: "ED-303", quantity: 1000, purchaseRate: 80, mrp: 150, expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "10ml", category: "Drops" },
                { itemName: "Ear Drops (WaxSol)", batch: "ED-304", quantity: 800, purchaseRate: 45, mrp: 90, expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "10ml", category: "Drops" },
                { itemName: "Low Stock Med", batch: "LS-305", quantity: 50, purchaseRate: 100, mrp: 200, expiryDate: new Date(Date.now() + 500 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "1x1", category: "Specialty" } // Low stock trigger
            ]
        };

        // Purchase Bill 4 - Medical Devices
        const pb4 = {
            email, partyName: "Apex Pharma Pvt Ltd", supplierInvoiceNumber: "INV-2024-104", receiptNumber: "PRCP-104",
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            purchaseAmount: 9000, totalAmount: 9000, discountAmount: 0,
            items: [
                { itemName: "Thermometer (Digital)", batch: "TH-401", quantity: 500, purchaseRate: 100, mrp: 200, expiryDate: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "1 Unit", category: "Devices" },
                { itemName: "BP Monitor (Omron)", batch: "BP-402", quantity: 200, purchaseRate: 1200, mrp: 2000, expiryDate: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 18, pack: "1 Unit", category: "Devices" }
            ]
        };

        // Purchase Bill 5 - Skin Care
        const pb5 = {
            email, partyName: "Global Meds Supply", supplierInvoiceNumber: "INV-2024-105", receiptNumber: "PRCP-105",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            purchaseAmount: 4500, totalAmount: 4500, discountAmount: 0,
            items: [
                { itemName: "Ketoconazole Cream", batch: "KC-501", quantity: 1000, purchaseRate: 45, mrp: 85, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "30gm", category: "Skin Care" },
                { itemName: "Moisturizing Lotion", batch: "ML-502", quantity: 1500, purchaseRate: 80, mrp: 150, expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(), gstPercentage: 12, pack: "100ml", category: "Skin Care" }
            ]
        };

        for (const pb of [pb1, pb2, pb3, pb4, pb5]) {
            await fetch(`${baseUrl}/bills/purchase`, { method: 'POST', headers, body: JSON.stringify(pb) });
        }
        console.log('Purchase Bills created. 15 unique medicines added to inventory.');

        // ==========================================
        // 2. SALE BILLS (Pharmacy -> Customers)
        // ==========================================
        console.log('2. Creating Sale Bills (Simulating customer traffic)...');
        
        const sb1 = {
            saleInvoiceNumber: "SALE-101", date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), receiptNumber: "SRCP-101",
            partyName: "Rahul Sharma", email, gstNumber: "UNREGISTERED",
            items: [
                { itemName: "Dolo 650mg", batch: "DL-101", quantity: 10, mrp: 30, discount: 5, gstPercentage: 12, expiryDate: pb1.items[0].expiryDate, sgst: 17.1, cgst: 17.1, igst: 0, totalGst: 34.2, netAmount: 319.2 },
                { itemName: "Vitamin C 500mg", batch: "VC-204", quantity: 20, mrp: 25, discount: 10, gstPercentage: 12, expiryDate: pb2.items[3].expiryDate, sgst: 27, cgst: 27, igst: 0, totalGst: 54, netAmount: 504 }
            ],
            totalAmount: 800, discountAmount: 65, sgstAmount: 44.1, cgstAmount: 44.1, igstAmount: 0, totalGstAmount: 88.2, netAmount: 823.2
        };

        const sb2 = {
            saleInvoiceNumber: "SALE-102", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), receiptNumber: "SRCP-102",
            partyName: "Priya Singh", email, gstNumber: "UNREGISTERED",
            items: [
                { itemName: "Azithromycin 500mg", batch: "AZ-103", quantity: 6, mrp: 75, discount: 0, gstPercentage: 12, expiryDate: pb1.items[2].expiryDate, sgst: 27, cgst: 27, igst: 0, totalGst: 54, netAmount: 504 },
                { itemName: "Cough Syrup (Adulsa)", batch: "CS-301", quantity: 2, mrp: 95, discount: 0, gstPercentage: 12, expiryDate: pb3.items[0].expiryDate, sgst: 11.4, cgst: 11.4, igst: 0, totalGst: 22.8, netAmount: 212.8 }
            ],
            totalAmount: 640, discountAmount: 0, sgstAmount: 38.4, cgstAmount: 38.4, igstAmount: 0, totalGstAmount: 76.8, netAmount: 716.8
        };

        const sb3 = {
            saleInvoiceNumber: "SALE-103", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), receiptNumber: "SRCP-103",
            partyName: "Amit Kumar", email, gstNumber: "UNREGISTERED",
            items: [
                { itemName: "Metformin 500mg", batch: "MF-201", quantity: 30, mrp: 40, discount: 10, gstPercentage: 12, expiryDate: pb2.items[0].expiryDate, sgst: 64.8, cgst: 64.8, igst: 0, totalGst: 129.6, netAmount: 1209.6 },
                { itemName: "Amlodipine 5mg", batch: "AM-202", quantity: 30, mrp: 35, discount: 10, gstPercentage: 12, expiryDate: pb2.items[1].expiryDate, sgst: 56.7, cgst: 56.7, igst: 0, totalGst: 113.4, netAmount: 1058.4 },
                { itemName: "Atorvastatin 20mg", batch: "AT-203", quantity: 30, mrp: 85, discount: 10, gstPercentage: 12, expiryDate: pb2.items[2].expiryDate, sgst: 137.7, cgst: 137.7, igst: 0, totalGst: 275.4, netAmount: 2570.4 }
            ],
            totalAmount: 5300, discountAmount: 530, sgstAmount: 259.2, cgstAmount: 259.2, igstAmount: 0, totalGstAmount: 518.4, netAmount: 4838.4
        };

        const sb4 = {
            saleInvoiceNumber: "SALE-104", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), receiptNumber: "SRCP-104",
            partyName: "Neha Gupta", email, gstNumber: "UNREGISTERED",
            items: [
                { itemName: "Thermometer (Digital)", batch: "TH-401", quantity: 2, mrp: 200, discount: 5, gstPercentage: 12, expiryDate: pb4.items[0].expiryDate, sgst: 22.8, cgst: 22.8, igst: 0, totalGst: 45.6, netAmount: 425.6 },
                { itemName: "Ketoconazole Cream", batch: "KC-501", quantity: 1, mrp: 85, discount: 0, gstPercentage: 12, expiryDate: pb5.items[0].expiryDate, sgst: 5.1, cgst: 5.1, igst: 0, totalGst: 10.2, netAmount: 95.2 }
            ],
            totalAmount: 485, discountAmount: 20, sgstAmount: 27.9, cgstAmount: 27.9, igstAmount: 0, totalGstAmount: 55.8, netAmount: 520.8
        };

        const sb5 = {
            saleInvoiceNumber: "SALE-105", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), receiptNumber: "SRCP-105",
            partyName: "Vikas Verma", email, gstNumber: "UNREGISTERED",
            items: [
                { itemName: "BP Monitor (Omron)", batch: "BP-402", quantity: 1, mrp: 2000, discount: 10, gstPercentage: 18, expiryDate: pb4.items[1].expiryDate, sgst: 162, cgst: 162, igst: 0, totalGst: 324, netAmount: 2124 }
            ],
            totalAmount: 2000, discountAmount: 200, sgstAmount: 162, cgstAmount: 162, igstAmount: 0, totalGstAmount: 324, netAmount: 2124
        };

        const sb6 = {
            saleInvoiceNumber: "SALE-106", date: new Date().toISOString(), receiptNumber: "SRCP-106",
            partyName: "Sneha Patil", email, gstNumber: "UNREGISTERED",
            items: [
                { itemName: "Dolo 650mg", batch: "DL-101", quantity: 5, mrp: 30, discount: 0, gstPercentage: 12, expiryDate: pb1.items[0].expiryDate, sgst: 9, cgst: 9, igst: 0, totalGst: 18, netAmount: 168 }
            ],
            totalAmount: 150, discountAmount: 0, sgstAmount: 9, cgstAmount: 9, igstAmount: 0, totalGstAmount: 18, netAmount: 168
        };

        for (const sb of [sb1, sb2, sb3, sb4, sb5, sb6]) {
            await fetch(`${baseUrl}/bills/sale`, { method: 'POST', headers, body: JSON.stringify(sb) });
        }
        console.log('Sale Bills created. Inventory deducted.');

        // ==========================================
        // 3. SALE RETURNS (Customer -> Pharmacy)
        // ==========================================
        console.log('3. Creating Sale Returns (Customers returning medicine)...');
        
        const sr1 = {
            email, returnInvoiceNumber: "SRET-101", receiptNumber: "RRCP-101", customerName: "Rahul Sharma",
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            items: [
                { itemName: "Dolo 650mg", batch: "DL-101", quantity: 2, discount: 5, amount: 57, purchaseRate: 15, gstPercentage: 12, gstAmount: 6.84 }
            ],
            totalAmount: 60, totalDiscount: 3, gstAmount: 6.84, netAmount: 63.84
        };

        const sr2 = {
            email, returnInvoiceNumber: "SRET-102", receiptNumber: "RRCP-102", customerName: "Priya Singh",
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            items: [
                { itemName: "Azithromycin 500mg", batch: "AZ-103", quantity: 1, discount: 0, amount: 75, purchaseRate: 50, gstPercentage: 12, gstAmount: 9 }
            ],
            totalAmount: 75, totalDiscount: 0, gstAmount: 9, netAmount: 84
        };

        for (const sr of [sr1, sr2]) {
            await fetch(`${baseUrl}/bills/return`, { method: 'POST', headers, body: JSON.stringify(sr) });
        }
        console.log('Sale Returns created. Stock added back to inventory.');

        // ==========================================
        // 4. PURCHASE RETURNS (Pharmacy -> Supplier)
        // ==========================================
        console.log('4. Creating Purchase Returns (Returning to supplier)...');

        const pr1 = {
            email, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            receiptNumber: "PR-RET-101", supplierName: "PharmaCorp India", supplierGST: "27AADCP1234F1Z5",
            items: [
                { itemName: "Vitamin C 500mg", batch: "VC-204", quantity: 50, purchaseRate: 12, mrp: 25, discount: 0, gstPercentage: 12 }
            ]
        };

        await fetch(`${baseUrl}/purchase-returns/create`, { method: 'POST', headers, body: JSON.stringify(pr1) });
        console.log(`Purchase Returns created for ${email}.`);
        }

        console.log('==========================================');
        console.log('✅ ALL Functionalities Seeded Successfully in Depth!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding deep demo data:', error);
        process.exit(1);
    }
};

seedFullDemo();
