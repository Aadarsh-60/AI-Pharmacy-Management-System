import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bill from './models/Bill.js';
import SaleBill from './models/SaleBillModel.js';
import PurchaseReturnBill from './models/PurchaseReturnBill.js';
import connectDB from './config/db.js';

dotenv.config({ path: './config/.env' });

async function run() {
  await connectDB();
  const email = 'vikramaadarsh1999@gmail.com';
  const supplierName = 'Cipla Distributors';
  
  const purchaseBills = await Bill.find({ email, partyName: supplierName });
  console.log('Purchase Bills:', purchaseBills.length);
  
  const returnBills = await PurchaseReturnBill.find({ email, supplierName });
  console.log('Return Bills:', returnBills.length);
  
  const saleBills = await SaleBill.find({ email });
  console.log('Sale Bills:', saleBills.length);
  
  process.exit(0);
}
run();
