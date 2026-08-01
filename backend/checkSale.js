import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
import SaleBill from './models/SaleBillModel.js';

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const sales = await SaleBill.find({ partyName: { $regex: /rahul sharma/i } });
  console.log('Sales to Rahul Sharma:', JSON.stringify(sales, null, 2));
  process.exit(0);
}
check();
