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
const TEST_EMAIL = 'vikramaadarsh1999@gmail.com';
const TEST_PASSWORD = '12345';
const TEST_NAME = 'Aadarsh vikram';
const TEST_GST = '789456123';

// ───── Helper: random date in range ─────
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ───── Expanded Medicine data pool (45 medicines) ─────
const medicines = [
  // Antibiotics
  { name: 'Paracetamol 500mg', pack: '10x10', gst: 12, prRange: [8, 15], mrpRange: [18, 30] },
  { name: 'Amoxicillin 250mg', pack: '10x10', gst: 12, prRange: [25, 40], mrpRange: [55, 80] },
  { name: 'Amoxicillin 500mg', pack: '1x10', gst: 12, prRange: [35, 55], mrpRange: [75, 110] },
  { name: 'Azithromycin 500mg', pack: '1x3', gst: 12, prRange: [45, 70], mrpRange: [90, 140] },
  { name: 'Azithromycin 250mg', pack: '1x6', gst: 12, prRange: [35, 55], mrpRange: [70, 110] },
  { name: 'Ciprofloxacin 500mg', pack: '10x10', gst: 12, prRange: [22, 38], mrpRange: [50, 80] },
  { name: 'Augmentin 625mg', pack: '1x10', gst: 12, prRange: [80, 120], mrpRange: [180, 250] },
  { name: 'Cefixime 200mg', pack: '1x10', gst: 12, prRange: [45, 70], mrpRange: [100, 150] },
  { name: 'Metronidazole 400mg', pack: '10x10', gst: 12, prRange: [10, 18], mrpRange: [25, 40] },
  { name: 'Doxycycline 100mg', pack: '1x10', gst: 12, prRange: [20, 35], mrpRange: [45, 70] },

  // Pain & Fever
  { name: 'Dolo 650mg', pack: '10x15', gst: 12, prRange: [12, 20], mrpRange: [28, 42] },
  { name: 'Crocin Advance', pack: '1x15', gst: 12, prRange: [10, 16], mrpRange: [25, 38] },
  { name: 'Disprin Tablet', pack: '1x10', gst: 12, prRange: [4, 8], mrpRange: [12, 20] },
  { name: 'Combiflam Tablet', pack: '1x20', gst: 12, prRange: [15, 25], mrpRange: [35, 55] },
  { name: 'Ibuprofen 400mg', pack: '10x10', gst: 12, prRange: [8, 14], mrpRange: [20, 32] },
  { name: 'Diclofenac 50mg', pack: '10x10', gst: 12, prRange: [6, 12], mrpRange: [15, 28] },
  { name: 'Aceclofenac 100mg', pack: '10x10', gst: 12, prRange: [12, 20], mrpRange: [28, 45] },

  // Gastro
  { name: 'Omeprazole 20mg', pack: '10x10', gst: 12, prRange: [15, 25], mrpRange: [35, 55] },
  { name: 'Pantoprazole 40mg', pack: '10x10', gst: 12, prRange: [18, 30], mrpRange: [42, 65] },
  { name: 'Pan-D Capsule', pack: '10x10', gst: 12, prRange: [25, 40], mrpRange: [60, 90] },
  { name: 'Ranitidine 150mg', pack: '10x10', gst: 12, prRange: [8, 15], mrpRange: [20, 35] },
  { name: 'Domperidone 10mg', pack: '10x10', gst: 12, prRange: [10, 18], mrpRange: [25, 40] },
  { name: 'Ondansetron 4mg', pack: '1x10', gst: 12, prRange: [18, 30], mrpRange: [40, 65] },

  // Allergy & Respiratory
  { name: 'Cetirizine 10mg', pack: '10x10', gst: 12, prRange: [5, 10], mrpRange: [15, 25] },
  { name: 'Montair LC', pack: '1x10', gst: 12, prRange: [55, 85], mrpRange: [120, 170] },
  { name: 'Allegra 120mg', pack: '1x10', gst: 12, prRange: [60, 90], mrpRange: [140, 195] },
  { name: 'Levocetirizine 5mg', pack: '10x10', gst: 12, prRange: [8, 15], mrpRange: [20, 35] },
  { name: 'Montelukast 10mg', pack: '1x10', gst: 12, prRange: [40, 65], mrpRange: [90, 140] },
  { name: 'Salbutamol Inhaler', pack: '1x1', gst: 12, prRange: [50, 80], mrpRange: [110, 160] },

  // Diabetes & Heart
  { name: 'Metformin 500mg', pack: '10x10', gst: 5, prRange: [10, 18], mrpRange: [25, 40] },
  { name: 'Metformin 1000mg', pack: '10x10', gst: 5, prRange: [18, 28], mrpRange: [40, 60] },
  { name: 'Glimepiride 2mg', pack: '1x10', gst: 5, prRange: [15, 25], mrpRange: [35, 55] },
  { name: 'Atorvastatin 10mg', pack: '10x10', gst: 12, prRange: [20, 35], mrpRange: [50, 75] },
  { name: 'Atorvastatin 20mg', pack: '10x10', gst: 12, prRange: [30, 45], mrpRange: [65, 95] },
  { name: 'Amlodipine 5mg', pack: '10x10', gst: 12, prRange: [10, 18], mrpRange: [25, 40] },
  { name: 'Telmisartan 40mg', pack: '1x10', gst: 12, prRange: [20, 35], mrpRange: [45, 70] },
  { name: 'Losartan 50mg', pack: '1x10', gst: 12, prRange: [18, 30], mrpRange: [40, 65] },
  { name: 'Ecosprin 75mg', pack: '1x14', gst: 12, prRange: [5, 10], mrpRange: [15, 25] },
  { name: 'Clopidogrel 75mg', pack: '1x10', gst: 12, prRange: [25, 40], mrpRange: [55, 85] },

  // Vitamins & Supplements
  { name: 'Shelcal 500mg', pack: '1x15', gst: 5, prRange: [40, 60], mrpRange: [95, 135] },
  { name: 'B-Complex Forte', pack: '10x10', gst: 5, prRange: [8, 14], mrpRange: [22, 35] },
  { name: 'Zincovit Tablet', pack: '1x15', gst: 5, prRange: [45, 65], mrpRange: [100, 145] },
  { name: 'Limcee 500mg', pack: '1x15', gst: 5, prRange: [10, 18], mrpRange: [26, 40] },
  { name: 'Supradyn Tablet', pack: '1x15', gst: 5, prRange: [50, 75], mrpRange: [110, 160] },
  { name: 'Becosules Capsule', pack: '1x20', gst: 5, prRange: [25, 40], mrpRange: [55, 85] },
  { name: 'Calcimax Forte', pack: '1x15', gst: 5, prRange: [55, 80], mrpRange: [120, 170] },
];

// ───── Expanded Suppliers (15) ─────
const suppliers = [
  'MedPlus Distributors',
  'Apollo Pharma Supply',
  'Sun Pharma Ltd.',
  'Cipla Distributors',
  'Zydus Healthcare',
  'Lupin Pharmaceuticals',
  'Ranbaxy Supplies',
  "Dr. Reddy's Labs",
  'Mankind Pharma',
  'Torrent Pharmaceuticals',
  'Alkem Laboratories',
  'Glenmark Pharma',
  'Biocon Limited',
  'Cadila Healthcare',
  'Hetero Drugs Ltd.',
];

// ───── Expanded Customers (25) ─────
const customers = [
  'Ramesh Kumar', 'Sunita Sharma', 'Amit Patel', 'Priya Singh',
  'Rajesh Gupta', 'Neha Verma', 'Suresh Joshi', 'Kavita Mishra',
  'Anil Desai', 'Pooja Reddy', 'Vikram Chauhan', 'Deepa Nair',
  'Sanjay Mehta', 'Ritu Agarwal', 'Manoj Tiwari', 'Anjali Das',
  'Karan Malhotra', 'Swati Pandey', 'Rohit Saxena', 'Meera Iyer',
  'Dinesh Yadav', 'Lakshmi Rao', 'Gaurav Bhatt', 'Nisha Kapoor',
  'Prakash Sinha',
];

// ═══════════════════════════════════════════════════════
//                    MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════
async function seedDatabase() {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    const users = await User.find({});
    if (users.length === 0) {
      console.error('❌ No users found in database. Cannot seed.');
      process.exit(1);
    }
    
    let totalSavedInventory = 0;
    let totalPurchaseBills = 0;
    let totalSaleBills = 0;
    
    let userIndex = 0;
    for (const user of users) {
      userIndex++;
      const TEST_EMAIL = user.email;
      console.log(`\n==========================================`);
      console.log(`Seeding data for User: ${TEST_EMAIL}`);
      console.log(`==========================================`);
      
      console.log('🧹 Cleaning existing bills/inventory for this user...');
      await Inventory.deleteMany({ email: TEST_EMAIL });
      await Bill.deleteMany({ email: TEST_EMAIL });
      await SaleBill.deleteMany({ email: TEST_EMAIL });
      await ExpiryBill.deleteMany({ email: TEST_EMAIL });
      await PurchaseReturnBill.deleteMany({ email: TEST_EMAIL });
      console.log('   ✅ Old test data cleared for this user\n');

    // ─── 3. Seed Inventory (45 medicines, multiple batches = ~100 items) ───
    console.log('💊 Seeding inventory...');
    const inventoryItems = [];
    const now = new Date();

    for (const med of medicines) {
      const numBatches = rand(2, 4); // More batches per medicine
      for (let b = 0; b < numBatches; b++) {
        const purchaseRate = roundTo(rand(med.prRange[0] * 100, med.prRange[1] * 100) / 100);
        const mrp = roundTo(rand(med.mrpRange[0] * 100, med.mrpRange[1] * 100) / 100);
        const quantity = rand(200, 5000);
        const batchNum = `B${String(rand(1000, 9999))}${String.fromCharCode(65 + rand(0, 5))}`;

        let expiryDate;
        const roll = Math.random();
        if (roll < 0.12) {
          // Already expired (~12%)
          expiryDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 8, 1), new Date(now.getFullYear(), now.getMonth() - 1, 1));
        } else if (roll < 0.28) {
          // Expiring within 3 months - triggers alerts (~16%)
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

    // ─── 4. Seed Purchase Bills (20 bills) ───
    console.log('📦 Seeding purchase bills...');
    const purchaseBills = [];

    for (let i = 0; i < 20; i++) {
      const supplier = suppliers[i % suppliers.length];
      const billDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 6, 1), now);
      const numItems = rand(3, 7);
      const billItems = [];
      let totalPurchase = 0;
      let totalAmount = 0;
      let totalDiscount = 0;

      for (let j = 0; j < numItems; j++) {
        const med = medicines[rand(0, medicines.length - 1)];
        const qty = rand(10, 300);
        const pr = roundTo(rand(med.prRange[0] * 100, med.prRange[1] * 100) / 100);
        const mrpVal = roundTo(rand(med.mrpRange[0] * 100, med.mrpRange[1] * 100) / 100);
        const disc = rand(0, 12);
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
        supplierInvoiceNumber: `SI-${2025}${String(i + 1).padStart(4, '0')}-U${userIndex}`,
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

    // ─── 5. Seed Sale Bills (25 sales) ───
    console.log('🧾 Seeding sale bills...');
    const saleBills = [];

    for (let i = 0; i < 25; i++) {
      const saleDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 5, 1), now);
      const numItems = rand(1, 6);
      const saleItems = [];
      let totalAmt = 0;
      let totalDisc = 0;
      let totalSgst = 0;
      let totalCgst = 0;
      let totalIgst = 0;
      let totalGst = 0;

      for (let j = 0; j < numItems; j++) {
        const med = medicines[rand(0, medicines.length - 1)];
        const qty = rand(1, 40);
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
        saleInvoiceNumber: `SALE-${String(now.getFullYear())}${String(i + 1).padStart(4, '0')}-U${userIndex}`,
        date: saleDate,
        receiptNumber: `SR-${String(rand(10000, 99999))}`,
        partyName: customers[i % customers.length],
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

    // ─── 6. Seed Expiry Bills (3 expiry return bills) ───
    console.log('⚠️  Seeding expiry bills...');
    const expiredItems = savedInventory.filter(item => item.expiryDate < now);
    let expiryBillCount = 0;

    if (expiredItems.length > 0) {
      // Split expired items across 3 bills
      const chunkSize = Math.ceil(expiredItems.length / 3);
      for (let billIdx = 0; billIdx < 3; billIdx++) {
        const chunk = expiredItems.slice(billIdx * chunkSize, (billIdx + 1) * chunkSize);
        if (chunk.length === 0) break;

        const expiryBillItems = chunk.slice(0, Math.min(6, chunk.length)).map(item => ({
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
          expiryBillNumber: `EXP-${now.getFullYear()}${String(billIdx + 1).padStart(4, '0')}-${rand(100,999)}`,
          partyName: suppliers[billIdx % suppliers.length],
          startDate: new Date(now.getFullYear(), now.getMonth() - 6 - billIdx * 2, 1),
          endDate: new Date(now.getFullYear(), now.getMonth() - billIdx * 2, 0),
          items: expiryBillItems,
          totalItems: expiryBillItems.length,
          totalQuantity: totalExpQty,
          totalValue: totalExpVal,
          notes: `Expiry return batch #${billIdx + 1} - seeded data`,
          email: TEST_EMAIL,
        });
        expiryBillCount++;
      }
      console.log(`   ✅ ${expiryBillCount} expiry bills created\n`);
    } else {
      console.log('   ⏭️  No expired items to create expiry bills\n');
    }

    // ─── 7. Seed Purchase Return Bills (5 returns) ───
    console.log('🔄 Seeding purchase return bills...');

    for (let r = 0; r < 5; r++) {
      const returnItems = [];
      const numReturnItems = rand(2, 5);
      let retTotalAmt = 0;
      let retTotalDisc = 0;
      let retTotalGst = 0;

      for (let j = 0; j < numReturnItems; j++) {
        const med = medicines[rand(0, medicines.length - 1)];
        const qty = rand(5, 40);
        const pr = roundTo(rand(med.prRange[0] * 100, med.prRange[1] * 100) / 100);
        const mrpVal = roundTo(rand(med.mrpRange[0] * 100, med.mrpRange[1] * 100) / 100);
        const disc = rand(0, 8);
        const batchNum = `B${String(rand(1000, 9999))}${String.fromCharCode(65 + rand(0, 5))}`;
        const expDate = randomDate(now, new Date(now.getFullYear() + 1, 6, 1));

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
        returnInvoiceNumber: `PR-${now.getFullYear()}${String(r + 1).padStart(4, '0')}-U${userIndex}`,
        date: randomDate(new Date(now.getFullYear(), now.getMonth() - 4, 1), now),
        receiptNumber: `PRR-${rand(10000, 99999)}`,
        supplierName: suppliers[rand(0, suppliers.length - 1)],
        supplierGST: `27AADCS${rand(1000, 9999)}N${rand(1, 9)}Z${rand(1, 9)}`,
        items: returnItems,
        totalAmount: roundTo(retTotalAmt),
        totalDiscount: roundTo(retTotalDisc),
        totalGst: roundTo(retTotalGst),
        netAmount: roundTo(retTotalAmt - retTotalDisc + retTotalGst),
        email: TEST_EMAIL,
      });
    }
    console.log(`   ✅ 5 purchase return bills created\n`);

      totalSavedInventory += savedInventory.length;
      totalPurchaseBills += purchaseBills.length;
      totalSaleBills += saleBills.length;
    } // End of user loop

    // ─── Done ───
    console.log('═══════════════════════════════════════════════');
    console.log('  🎉 DATABASE SEEDED SUCCESSFULLY FOR ALL USERS!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('  📊 Data created:');
    console.log(`     • ${totalSavedInventory} inventory items total`);
    console.log(`     • ${totalPurchaseBills} purchase bills total`);
    console.log(`     • ${totalSaleBills} sale bills total`);
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
