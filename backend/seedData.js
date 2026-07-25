import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';

// Models
import User from './models/User.js';
import Inventory from './models/Inventory.js';
import Bill from './models/Bill.js';
import SaleBill from './models/SaleBillModel.js';
import ExpiryBill from './models/ExpiryBill.js';
import PurchaseReturnBill from './models/PurchaseReturnBill.js';

// Load env
dotenv.config({ path: './config/.env' });

// ───── Test user credentials ─────
const TEST_EMAIL = 'testuser@pharmacy.com';
const TEST_PASSWORD = 'Test@1234';
const TEST_NAME = 'Dr. Pratik Pradhan';
const TEST_GST = '27AABCU9603R1ZM';

// ───── Helper: random date in range ─────
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ───── Medicine data pool ─────
const medicines = [
  { name: 'Paracetamol 500mg', pack: '10x10', gst: 12, prRange: [8, 15], mrpRange: [18, 30] },
  { name: 'Amoxicillin 250mg', pack: '10x10', gst: 12, prRange: [25, 40], mrpRange: [55, 80] },
  { name: 'Azithromycin 500mg', pack: '1x3', gst: 12, prRange: [45, 70], mrpRange: [90, 140] },
  { name: 'Cetirizine 10mg', pack: '10x10', gst: 12, prRange: [5, 10], mrpRange: [15, 25] },
  { name: 'Omeprazole 20mg', pack: '10x10', gst: 12, prRange: [15, 25], mrpRange: [35, 55] },
  { name: 'Metformin 500mg', pack: '10x10', gst: 5, prRange: [10, 18], mrpRange: [25, 40] },
  { name: 'Atorvastatin 10mg', pack: '10x10', gst: 12, prRange: [20, 35], mrpRange: [50, 75] },
  { name: 'Pantoprazole 40mg', pack: '10x10', gst: 12, prRange: [18, 30], mrpRange: [42, 65] },
  { name: 'Ciprofloxacin 500mg', pack: '10x10', gst: 12, prRange: [22, 38], mrpRange: [50, 80] },
  { name: 'Dolo 650mg', pack: '10x15', gst: 12, prRange: [12, 20], mrpRange: [28, 42] },
  { name: 'Crocin Advance', pack: '1x15', gst: 12, prRange: [10, 16], mrpRange: [25, 38] },
  { name: 'Augmentin 625mg', pack: '1x10', gst: 12, prRange: [80, 120], mrpRange: [180, 250] },
  { name: 'Montair LC', pack: '1x10', gst: 12, prRange: [55, 85], mrpRange: [120, 170] },
  { name: 'Pan-D Capsule', pack: '10x10', gst: 12, prRange: [25, 40], mrpRange: [60, 90] },
  { name: 'Shelcal 500mg', pack: '1x15', gst: 5, prRange: [40, 60], mrpRange: [95, 135] },
  { name: 'B-Complex Forte', pack: '10x10', gst: 5, prRange: [8, 14], mrpRange: [22, 35] },
  { name: 'Disprin Tablet', pack: '1x10', gst: 12, prRange: [4, 8], mrpRange: [12, 20] },
  { name: 'Zincovit Tablet', pack: '1x15', gst: 5, prRange: [45, 65], mrpRange: [100, 145] },
  { name: 'Allegra 120mg', pack: '1x10', gst: 12, prRange: [60, 90], mrpRange: [140, 195] },
  { name: 'Limcee 500mg', pack: '1x15', gst: 5, prRange: [10, 18], mrpRange: [26, 40] },
];

const suppliers = [
  'MedPlus Distributors',
  'Apollo Pharma Supply',
  'Sun Pharma Ltd.',
  'Cipla Distributors',
  'Zydus Healthcare',
  'Lupin Pharmaceuticals',
  'Ranbaxy Supplies',
  'Dr. Reddy\'s Labs',
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ═══════════════════════════════════════════════════════
//                    MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════
async function seedDatabase() {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // ─── 1. Clean existing test data ───
    console.log('🧹 Cleaning existing data for test user...');
    await User.deleteMany({ email: TEST_EMAIL });
    await Inventory.deleteMany({ email: TEST_EMAIL });
    await Bill.deleteMany({ email: TEST_EMAIL });
    await SaleBill.deleteMany({ email: TEST_EMAIL });
    await ExpiryBill.deleteMany({ email: TEST_EMAIL });
    await PurchaseReturnBill.deleteMany({ email: TEST_EMAIL });
    console.log('   ✅ Old test data cleared\n');

    // ─── 2. Create test user (pre-verified, ready to login) ───
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    const user = new User({
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: hashedPassword,
      gstNo: TEST_GST,
      isVerified: true,
      verificationCode: null,
      verificationExpires: null,
    });
    await user.save();
    console.log(`   ✅ User created: ${TEST_EMAIL} / ${TEST_PASSWORD}\n`);

    // ─── 3. Seed Inventory (20 medicines, multiple batches) ───
    console.log('💊 Seeding inventory...');
    const inventoryItems = [];
    const now = new Date();

    for (const med of medicines) {
      const numBatches = rand(1, 3);
      for (let b = 0; b < numBatches; b++) {
        const purchaseRate = roundTo(rand(med.prRange[0] * 100, med.prRange[1] * 100) / 100);
        const mrp = roundTo(rand(med.mrpRange[0] * 100, med.mrpRange[1] * 100) / 100);
        const quantity = rand(20, 500);
        const batchNum = `B${String(rand(1000, 9999))}${String.fromCharCode(65 + rand(0, 5))}`;

        // Some items expiring soon (for alerts), some expired, most future
        let expiryDate;
        const roll = Math.random();
        if (roll < 0.1) {
          // Already expired
          expiryDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 6, 1), new Date(now.getFullYear(), now.getMonth() - 1, 1));
        } else if (roll < 0.25) {
          // Expiring within 3 months (triggers alerts)
          expiryDate = randomDate(now, new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()));
        } else {
          // Normal expiry (6 months to 2 years out)
          expiryDate = randomDate(new Date(now.getFullYear(), now.getMonth() + 6, 1), new Date(now.getFullYear() + 2, now.getMonth(), 1));
        }

        const supplier = suppliers[rand(0, suppliers.length - 1)];

        inventoryItems.push({
          itemName: med.name,
          batch: batchNum,
          partyName: supplier,
          email: TEST_EMAIL,
          expiryDate,
          pack: med.pack,
          quantity,
          purchaseRate,
          mrp,
          gstPercentage: med.gst,
          description: `${med.name} - ${med.pack}`,
          amount: roundTo(quantity * purchaseRate),
        });
      }
    }

    const savedInventory = await Inventory.insertMany(inventoryItems);
    console.log(`   ✅ ${savedInventory.length} inventory items created\n`);

    // ─── 4. Seed Purchase Bills (8 bills from different suppliers) ───
    console.log('📦 Seeding purchase bills...');
    const purchaseBills = [];

    for (let i = 0; i < 8; i++) {
      const supplier = suppliers[i % suppliers.length];
      const billDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), now);
      const numItems = rand(2, 5);
      const billItems = [];
      let totalPurchase = 0;
      let totalAmount = 0;
      let totalDiscount = 0;

      for (let j = 0; j < numItems; j++) {
        const med = medicines[rand(0, medicines.length - 1)];
        const qty = rand(10, 200);
        const pr = roundTo(rand(med.prRange[0] * 100, med.prRange[1] * 100) / 100);
        const mrpVal = roundTo(rand(med.mrpRange[0] * 100, med.mrpRange[1] * 100) / 100);
        const disc = rand(0, 10);
        const batchNum = `B${String(rand(1000, 9999))}${String.fromCharCode(65 + rand(0, 5))}`;
        const expDate = randomDate(new Date(now.getFullYear(), now.getMonth() + 3, 1), new Date(now.getFullYear() + 2, 0, 1));

        const gstAmt = roundTo(qty * pr * (med.gst / 100));
        const itemTotal = roundTo(qty * pr + gstAmt - (qty * pr * disc / 100));

        billItems.push({
          itemName: med.name,
          batch: batchNum,
          quantity: qty,
          purchaseRate: pr,
          mrp: mrpVal,
          expiryDate: expDate,
          gstPercentage: med.gst,
          pack: med.pack,
          description: `${med.name}`,
          discount: disc,
          gstAmount: gstAmt,
          totalAmount: itemTotal,
        });

        totalPurchase += roundTo(qty * pr);
        totalAmount += itemTotal;
        totalDiscount += roundTo(qty * pr * disc / 100);
      }

      purchaseBills.push({
        billType: 'purchase',
        supplierInvoiceNumber: `SI-${2025}${String(i + 1).padStart(4, '0')}`,
        receiptNumber: `REC-${String(rand(10000, 99999))}`,
        partyName: supplier,
        date: billDate,
        items: billItems,
        purchaseAmount: roundTo(totalPurchase),
        totalAmount: roundTo(totalAmount),
        discountAmount: roundTo(totalDiscount),
        email: TEST_EMAIL,
      });
    }

    await Bill.insertMany(purchaseBills);
    console.log(`   ✅ ${purchaseBills.length} purchase bills created\n`);

    // ─── 5. Seed Sale Bills (10 sales to different customers) ───
    console.log('🧾 Seeding sale bills...');
    const saleBills = [];
    const customers = [
      'Ramesh Kumar', 'Sunita Sharma', 'Amit Patel', 'Priya Singh',
      'Rajesh Gupta', 'Neha Verma', 'Suresh Joshi', 'Kavita Mishra',
      'Anil Desai', 'Pooja Reddy',
    ];

    for (let i = 0; i < 10; i++) {
      const saleDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now);
      const numItems = rand(1, 4);
      const saleItems = [];
      let totalAmt = 0;
      let totalDisc = 0;
      let totalSgst = 0;
      let totalCgst = 0;
      let totalIgst = 0;
      let totalGst = 0;

      for (let j = 0; j < numItems; j++) {
        const med = medicines[rand(0, medicines.length - 1)];
        const qty = rand(1, 30);
        const mrpVal = roundTo(rand(med.mrpRange[0] * 100, med.mrpRange[1] * 100) / 100);
        const disc = rand(0, 15);
        const batchNum = `B${String(rand(1000, 9999))}${String.fromCharCode(65 + rand(0, 5))}`;
        const expDate = randomDate(new Date(now.getFullYear(), now.getMonth() + 3, 1), new Date(now.getFullYear() + 2, 0, 1));

        const discAmt = roundTo(qty * mrpVal * disc / 100);
        const afterDisc = roundTo(qty * mrpVal - discAmt);
        const sgst = roundTo(afterDisc * (med.gst / 2) / 100);
        const cgst = roundTo(afterDisc * (med.gst / 2) / 100);
        const igst = 0;
        const itemGst = roundTo(sgst + cgst + igst);
        const netAmt = roundTo(afterDisc + itemGst);

        saleItems.push({
          itemName: med.name,
          batch: batchNum,
          quantity: qty,
          mrp: mrpVal,
          discount: disc,
          gstPercentage: med.gst,
          expiryDate: expDate,
          sgst,
          cgst,
          igst,
          totalGst: itemGst,
          netAmount: netAmt,
        });

        totalAmt += roundTo(qty * mrpVal);
        totalDisc += discAmt;
        totalSgst += sgst;
        totalCgst += cgst;
        totalIgst += igst;
        totalGst += itemGst;
      }

      const netTotal = roundTo(totalAmt - totalDisc + totalGst);

      saleBills.push({
        saleInvoiceNumber: `SALE-${String(now.getFullYear())}${String(i + 1).padStart(4, '0')}`,
        date: saleDate,
        receiptNumber: `SR-${String(rand(10000, 99999))}`,
        partyName: customers[i],
        email: TEST_EMAIL,
        gstNumber: TEST_GST,
        items: saleItems,
        totalAmount: roundTo(totalAmt),
        discountAmount: roundTo(totalDisc),
        sgstAmount: roundTo(totalSgst),
        cgstAmount: roundTo(totalCgst),
        igstAmount: roundTo(totalIgst),
        totalGstAmount: roundTo(totalGst),
        netAmount: netTotal,
      });
    }

    await SaleBill.insertMany(saleBills);
    console.log(`   ✅ ${saleBills.length} sale bills created\n`);

    // ─── 6. Seed Expiry Bill (1 expiry return bill) ───
    console.log('⚠️  Seeding expiry bill...');
    const expiredItems = savedInventory.filter(item => item.expiryDate < now);

    if (expiredItems.length > 0) {
      const expiryBillItems = expiredItems.slice(0, Math.min(5, expiredItems.length)).map(item => ({
        _id: item._id,
        itemName: item.itemName,
        batch: item.batch,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        expiredQuantity: rand(5, Math.min(item.quantity, 50)),
        mrp: item.mrp,
        purchaseRate: item.purchaseRate,
        value: roundTo(rand(5, Math.min(item.quantity, 50)) * item.purchaseRate),
      }));

      const totalExpQty = expiryBillItems.reduce((s, i) => s + i.expiredQuantity, 0);
      const totalExpVal = roundTo(expiryBillItems.reduce((s, i) => s + i.value, 0));

      await ExpiryBill.create({
        expiryBillNumber: `EXP-${now.getFullYear()}0001`,
        partyName: suppliers[0],
        startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        endDate: now,
        items: expiryBillItems,
        totalItems: expiryBillItems.length,
        totalQuantity: totalExpQty,
        totalValue: totalExpVal,
        notes: 'Quarterly expiry return - auto-seeded test data',
        email: TEST_EMAIL,
      });
      console.log(`   ✅ 1 expiry bill created with ${expiryBillItems.length} expired items\n`);
    } else {
      console.log('   ⏭️  No expired items to create expiry bill\n');
    }

    // ─── 7. Seed Purchase Return Bill (1 return) ───
    console.log('🔄 Seeding purchase return bill...');
    const returnItems = [];
    const numReturnItems = 3;
    let retTotalAmt = 0;
    let retTotalDisc = 0;
    let retTotalGst = 0;

    for (let j = 0; j < numReturnItems; j++) {
      const med = medicines[rand(0, medicines.length - 1)];
      const qty = rand(5, 30);
      const pr = roundTo(rand(med.prRange[0] * 100, med.prRange[1] * 100) / 100);
      const mrpVal = roundTo(rand(med.mrpRange[0] * 100, med.mrpRange[1] * 100) / 100);
      const disc = rand(0, 5);
      const batchNum = `B${String(rand(1000, 9999))}${String.fromCharCode(65 + rand(0, 5))}`;
      const expDate = randomDate(now, new Date(now.getFullYear() + 1, 0, 1));

      const itemTotal = roundTo(qty * pr);
      const discAmt = roundTo(itemTotal * disc / 100);
      const gstAmt = roundTo((itemTotal - discAmt) * med.gst / 100);
      const netAmt = roundTo(itemTotal - discAmt + gstAmt);

      returnItems.push({
        itemName: med.name,
        batch: batchNum,
        quantity: qty,
        purchaseRate: pr,
        mrp: mrpVal,
        discount: disc,
        gstPercentage: med.gst,
        expiryDate: expDate,
        totalAmount: itemTotal,
        discountAmount: discAmt,
        gstAmount: gstAmt,
        netAmount: netAmt,
      });

      retTotalAmt += itemTotal;
      retTotalDisc += discAmt;
      retTotalGst += gstAmt;
    }

    await PurchaseReturnBill.create({
      returnInvoiceNumber: `PR-${now.getFullYear()}0001`,
      date: randomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
      receiptNumber: `PRR-${rand(10000, 99999)}`,
      supplierName: suppliers[2],
      supplierGST: '27AADCS0472N1Z8',
      items: returnItems,
      totalAmount: roundTo(retTotalAmt),
      totalDiscount: roundTo(retTotalDisc),
      totalGst: roundTo(retTotalGst),
      netAmount: roundTo(retTotalAmt - retTotalDisc + retTotalGst),
      email: TEST_EMAIL,
    });
    console.log(`   ✅ 1 purchase return bill created\n`);

    // ─── Done ───
    console.log('═══════════════════════════════════════════════');
    console.log('  🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('  📧 Login Email:    testuser@pharmacy.com');
    console.log('  🔑 Login Password: Test@1234');
    console.log('');
    console.log('  📊 Data created:');
    console.log(`     • ${savedInventory.length} inventory items (with some near-expiry & expired)`);
    console.log(`     • ${purchaseBills.length} purchase bills`);
    console.log(`     • ${saleBills.length} sale bills`);
    console.log(`     • 1 expiry bill`);
    console.log(`     • 1 purchase return bill`);
    console.log('');
    console.log('  🚀 Start exploring:');
    console.log('     • Dashboard — overview of your pharmacy');
    console.log('     • Inventory — view/manage all medicines');
    console.log('     • Generate Bill — create purchase/sale bills');
    console.log('     • Return Bill — process purchase/sale returns');
    console.log('     • Alerts — see expiring medicines');
    console.log('     • Reports — view sales summaries');
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
