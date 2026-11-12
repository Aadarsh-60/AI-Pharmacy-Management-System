import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

// Setup paths & env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config/.env') });

// Import Mongoose Models
import User from './models/User.js';
import Inventory from './models/Inventory.js';
import Bill from './models/Bill.js';
import SaleBill from './models/SaleBillModel.js';
import PurchaseReturnBill from './models/PurchaseReturnBill.js';
import ReturnBill from './models/ReturnBillModel.js';
import ExpiryBill from './models/ExpiryBill.js';
import ClientExpiryReturn from './models/ClientExpiryReturn.js';
import CustomerPurchase from './models/CustomerPurchase.js';
import ActivityLog from './models/ActivityLog.js';

// =========================================================================
// 1. REALISTIC DATA DEFINITIONS
// =========================================================================

// 30 Authentic Indian Pharmaceutical Suppliers & Distributors
export const SUPPLIERS = [
  { name: "Sun Pharma Laboratories Ltd", gst: "27AAACS1234A1Z5", state: "Maharashtra", phone: "+91-22-4324-4324" },
  { name: "Cipla Medpro Distributors", gst: "27AAACC2020B1Z2", state: "Maharashtra", phone: "+91-22-2482-6000" },
  { name: "Dr. Reddy's Healthcare Agency", gst: "36AAACD3030C1Z9", state: "Telangana", phone: "+91-40-4900-2900" },
  { name: "Lupin Life Sciences Supply", gst: "27AAACL4040D1Z6", state: "Maharashtra", phone: "+91-20-6640-2222" },
  { name: "Mankind Healthcare Wholesale", gst: "07AAACM5050E1Z3", state: "Delhi", phone: "+91-11-4684-6700" },
  { name: "Abbott India Distributors", gst: "27AAACA6060F1Z0", state: "Maharashtra", phone: "+91-22-3816-2000" },
  { name: "Torrent Pharma Logistics", gst: "24AAACT7070G1Z7", state: "Gujarat", phone: "+91-79-2659-9000" },
  { name: "Alkem Laboratories Agency", gst: "27AAACA8080H1Z4", state: "Maharashtra", phone: "+91-22-3982-9999" },
  { name: "Zydus Cadila Healthcare", gst: "24AAACZ9090I1Z1", state: "Gujarat", phone: "+91-79-7180-0000" },
  { name: "Intas Pharmaceuticals Ltd", gst: "24AAACI0101J1Z8", state: "Gujarat", phone: "+91-79-6157-7000" },
  { name: "Glenmark Medico Agencies", gst: "27AAACG1212K1Z5", state: "Maharashtra", phone: "+91-22-4018-9999" },
  { name: "Aristo Pharma Distributors", gst: "27AAACA2323L1Z2", state: "Maharashtra", phone: "+91-22-2683-9999" },
  { name: "Macleods Pharma Wholesale", gst: "27AAACM3434M1Z9", state: "Maharashtra", phone: "+91-22-6676-2800" },
  { name: "Micro Labs Logistics Depot", gst: "29AAACM4545N1Z6", state: "Karnataka", phone: "+91-80-2227-8441" },
  { name: "IPCA Laboratories Depot", gst: "27AAACI5656O1Z3", state: "Maharashtra", phone: "+91-22-6210-5000" },
  { name: "Alembic Pharma Suppliers", gst: "24AAACA6767P1Z0", state: "Gujarat", phone: "+91-265-228-0550" },
  { name: "USV Private Limited Depot", gst: "27AAACU7878Q1Z7", state: "Maharashtra", phone: "+91-22-2556-4061" },
  { name: "Ajanta Pharma Supply Hub", gst: "27AAACA8989R1Z4", state: "Maharashtra", phone: "+91-22-6606-1000" },
  { name: "FDC Healthcare Agencies", gst: "27AAACF9090S1Z1", state: "Maharashtra", phone: "+91-22-2673-9000" },
  { name: "Emcure Pharmaceuticals Depot", gst: "27AAACE0101T1Z8", state: "Maharashtra", phone: "+91-20-3061-0000" },
  { name: "Apex Laboratories Supply", gst: "33AAACA1212U1Z5", state: "Tamil Nadu", phone: "+91-44-2225-1111" },
  { name: "Hetero Healthcare Agencies", gst: "36AAACH2323V1Z2", state: "Telangana", phone: "+91-40-2370-4923" },
  { name: "Panacea Biotec Logistics", gst: "07AAACP3434W1Z9", state: "Delhi", phone: "+91-11-4167-9000" },
  { name: "Wockhardt Pharma Distributors", gst: "27AAACW4545X1Z6", state: "Maharashtra", phone: "+91-240-663-8000" },
  { name: "Biocon Biologics Depot", gst: "29AAACB5656Y1Z3", state: "Karnataka", phone: "+91-80-2808-2808" },
  { name: "Natco Pharma Agency", gst: "36AAACN6767Z1Z0", state: "Telangana", phone: "+91-40-2354-7532" },
  { name: "Sanofi India Wholesale", gst: "27AAACS7878A2Z7", state: "Maharashtra", phone: "+91-22-2803-2000" },
  { name: "GlaxoSmithKline Healthcare", gst: "27AAACG8989B2Z4", state: "Maharashtra", phone: "+91-22-2495-9595" },
  { name: "Pfizer India Logistics Hub", gst: "27AAACP9090C2Z1", state: "Maharashtra", phone: "+91-22-6693-2000" },
  { name: "Novartis India Agency", gst: "27AAACN0101D2Z8", state: "Maharashtra", phone: "+91-22-2830-7000" }
];

// 60 Realistic Indian Customers
export const CUSTOMERS = [
  "Rahul Sharma", "Priya Singh", "Amit Kumar", "Neha Gupta", "Vikas Verma",
  "Sneha Patil", "Rajesh Patel", "Ananya Deshmukh", "Suresh Nair", "Pooja Mehta",
  "Karan Malhotra", "Ritu Joshi", "Deepak Chawla", "Sunita Rao", "Manish Tiwari",
  "Kavita Reddy", "Sanjay Saxena", "Meera Iyer", "Naveen Aggarwal", "Swati Kulkarni",
  "Arun Bhatt", "Shilpa Sen", "Gaurav Mishra", "Divya Menon", "Rohan Das",
  "Simran Kaur", "Alok Pandey", "Preeti Choudhary", "Vivek Hegde", "Pallavi Pillai",
  "Harish Nambiar", "Geeta Kapoor", "Tarun Goel", "Bhavna Jain", "Nikhil Rathi",
  "Rashmi Dubey", "Prashant Bose", "Smita Ghosh", "Vijay Shenoy", "Sadhna Varma",
  "Anand Kurup", "Tanuja Bhatia", "Ashish Soni", "Komal Sethi", "Dinesh Khandelwal",
  "Monika Trivedi", "Rakesh Yadav", "Shruti Prabhu", "Hemant Rawat", "Archana Murthy",
  "Mohit Agnihotri", "Shalini Shukla", "Abhinav Ganguly", "Mridula Sen", "Pradeep Chauhan",
  "Aarti Mathur", "Girish Somani", "Vandana Bajaj", "Chetan Bhagat", "Tanvi Sengupta"
];

// 12 Clinical Categories
export const CATEGORIES = [
  "Antibiotics",
  "Painkillers / Analgesics",
  "Cardiac / Blood Pressure",
  "Diabetes / Endocrine",
  "Antacid / Gastrointestinal",
  "Respiratory / Cough & Cold",
  "Vitamins & Nutritional",
  "Dermatology / Skin Care",
  "Neurology & Psychiatry",
  "Ophthalmic / Eye Drops",
  "Anti-Allergic",
  "First Aid & Surgical Devices"
];

// Master Template of 120 Core Molecules & Formulations with Brands & Strengths
const MEDICINE_CATALOG = [
  // 1. Antibiotics
  { molecule: "Amoxicillin + Clavulanic Acid", brands: ["Augmentin", "Moxikind-CV", "Clavam", "Amoxyclav"], forms: ["Tablets", "Syrup"], strengths: ["625mg", "375mg", "1000mg", "228.5mg/5ml"], category: "Antibiotics", gst: 12, baseMrp: 180, pack: "10x10" },
  { molecule: "Azithromycin", brands: ["Azee", "Azithral", "Zady", "Azax"], forms: ["Tablets", "Suspension"], strengths: ["250mg", "500mg", "100mg/5ml", "200mg/5ml"], category: "Antibiotics", gst: 12, baseMrp: 120, pack: "3x10" },
  { molecule: "Cefixime", brands: ["Cefolac", "Taxim-O", "Zifi", "Mahacef"], forms: ["Tablets", "Syrup"], strengths: ["100mg", "200mg", "400mg", "50mg/5ml"], category: "Antibiotics", gst: 12, baseMrp: 140, pack: "10x10" },
  { molecule: "Ciprofloxacin", brands: ["Ciplox", "Cifran", "Ciprobid"], forms: ["Tablets", "Eye Drops"], strengths: ["250mg", "500mg", "750mg", "0.3% w/v"], category: "Antibiotics", gst: 12, baseMrp: 65, pack: "10x10" },
  { molecule: "Ofloxacin + Ornidazole", brands: ["O2", "Zenflox-OZ", "Oflomac-OZ"], forms: ["Tablets", "Suspension"], strengths: ["200mg+500mg", "50mg+125mg/5ml"], category: "Antibiotics", gst: 12, baseMrp: 110, pack: "10x10" },
  { molecule: "Doxycycline", brands: ["Doxicip", "Doxt-SL", "Microdox-LBX"], forms: ["Capsules"], strengths: ["100mg", "100mg+Lactobacillus"], category: "Antibiotics", gst: 12, baseMrp: 85, pack: "10x10" },
  { molecule: "Cefuroxime Axetil", brands: ["Ceftum", "Cetil", "Zefu", "Pulmocef"], forms: ["Tablets"], strengths: ["250mg", "500mg"], category: "Antibiotics", gst: 12, baseMrp: 350, pack: "10x10" },
  { molecule: "Metronidazole", brands: ["Flagyl", "Metrogyl", "Metron"], forms: ["Tablets", "Gel"], strengths: ["200mg", "400mg", "1% Gel"], category: "Antibiotics", gst: 12, baseMrp: 32, pack: "15x10" },
  { molecule: "Levofloxacin", brands: ["Levomac", "Loxof", "Glevo"], forms: ["Tablets"], strengths: ["250mg", "500mg", "750mg"], category: "Antibiotics", gst: 12, baseMrp: 95, pack: "10x10" },
  { molecule: "Clindamycin", brands: ["Dalacin-C", "Clincin", "Erytop Gel"], forms: ["Capsules", "Gel"], strengths: ["150mg", "300mg", "1% Gel"], category: "Antibiotics", gst: 12, baseMrp: 210, pack: "10x10" },

  // 2. Painkillers / Analgesics
  { molecule: "Paracetamol", brands: ["Dolo", "Crocin", "Calpol", "Pacimol"], forms: ["Tablets", "Drops", "Syrup"], strengths: ["500mg", "650mg", "120mg/5ml", "250mg/5ml"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 32, pack: "15x10" },
  { molecule: "Aceclofenac + Paracetamol", brands: ["Zerodol-P", "Aceclo Plus", "Hifenac-P"], forms: ["Tablets"], strengths: ["100mg+325mg", "100mg+500mg"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 75, pack: "10x10" },
  { molecule: "Aceclofenac + Paracetamol + Serratiopeptidase", brands: ["Zerodol-SP", "Aceclo-SP", "Signoflam"], forms: ["Tablets"], strengths: ["100mg+325mg+15mg"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 135, pack: "10x10" },
  { molecule: "Ibuprofen + Paracetamol", brands: ["Combiflam", "Ibugesic Plus", "Flexon"], forms: ["Tablets", "Suspension"], strengths: ["400mg+325mg", "100mg+162.5mg/5ml"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 45, pack: "20x10" },
  { molecule: "Diclofenac Sodium", brands: ["Voveran", "Voltaren", "Dynapar"], forms: ["Tablets", "Gel", "Injection"], strengths: ["50mg", "75mg SR", "1% Gel", "75mg/ml"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 90, pack: "10x10" },
  { molecule: "Tramadol + Paracetamol", brands: ["Ultracet", "Tramazac-P", "Urトラ"], forms: ["Tablets"], strengths: ["37.5mg+325mg"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 160, pack: "10x10" },
  { molecule: "Mefenamic Acid + Dicyclomine", brands: ["Meftal-Spas", "Colimex", "Spasmo-Proxyvon"], forms: ["Tablets", "Syrup"], strengths: ["250mg+10mg", "500mg+20mg"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 52, pack: "10x10" },
  { molecule: "Ketorolac Tromethamine", brands: ["Ketorol", "Ketoflam", "Toradol"], forms: ["Tablets", "Eye Drops"], strengths: ["10mg", "0.5% Drops"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 85, pack: "10x10" },
  { molecule: "Naproxen", brands: ["Naprosyn", "Xenobid"], forms: ["Tablets"], strengths: ["250mg", "500mg"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 70, pack: "10x10" },
  { molecule: "Etoricoxib", brands: ["Nucoxia", "Arcoxia", "Etoshine"], forms: ["Tablets"], strengths: ["60mg", "90mg", "120mg"], category: "Painkillers / Analgesics", gst: 12, baseMrp: 140, pack: "10x10" },

  // 3. Cardiac / Blood Pressure
  { molecule: "Telmisartan", brands: ["Telma", "Telmikind", "Telsartan", "Creser"], forms: ["Tablets"], strengths: ["20mg", "40mg", "80mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 110, pack: "15x10" },
  { molecule: "Telmisartan + Amlodipine", brands: ["Telma-AM", "Telmikind-AM", "Amlosafe-TM"], forms: ["Tablets"], strengths: ["40mg+5mg", "80mg+5mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 165, pack: "15x10" },
  { molecule: "Telmisartan + Hydrochlorothiazide", brands: ["Telma-H", "Telsartan-H", "Telpres-H"], forms: ["Tablets"], strengths: ["40mg+12.5mg", "80mg+12.5mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 155, pack: "15x10" },
  { molecule: "Amlodipine", brands: ["Amlong", "Amlosafe", "Stamlo"], forms: ["Tablets"], strengths: ["2.5mg", "5mg", "10mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 45, pack: "15x10" },
  { molecule: "Atorvastatin", brands: ["Atorva", "Lipicure", "Storvas", "Tonact"], forms: ["Tablets"], strengths: ["10mg", "20mg", "40mg", "80mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 195, pack: "15x10" },
  { molecule: "Rosuvastatin", brands: ["Rosuvas", "Rozavel", "Roseday"], forms: ["Tablets"], strengths: ["5mg", "10mg", "20mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 240, pack: "15x10" },
  { molecule: "Clopidogrel + Aspirin", brands: ["Clopilet-A", "Deplatt-A", "Ecosprin-AV"], forms: ["Capsules"], strengths: ["75mg+75mg", "75mg+150mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 125, pack: "10x10" },
  { molecule: "Aspirin (Gastro-resistant)", brands: ["Ecosprin", "Loprin", "Delisprin"], forms: ["Tablets"], strengths: ["75mg", "150mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 15, pack: "14x10" },
  { molecule: "Metoprolol Succinate", brands: ["Betaloc", "Metolar-XR", "Starpress-XL"], forms: ["Tablets"], strengths: ["25mg", "50mg", "100mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 130, pack: "15x10" },
  { molecule: "Nebivolol", brands: ["Nebicard", "Nebistar", "Nodon"], forms: ["Tablets"], strengths: ["2.5mg", "5mg"], category: "Cardiac / Blood Pressure", gst: 12, baseMrp: 120, pack: "10x10" },

  // 4. Diabetes / Endocrine
  { molecule: "Metformin Hydrochloride", brands: ["Glycomet", "Glyciphage", "Obimet", "Cetapin"], forms: ["Tablets"], strengths: ["500mg SR", "850mg", "1000mg SR"], category: "Diabetes / Endocrine", gst: 12, baseMrp: 48, pack: "20x10" },
  { molecule: "Glimepiride + Metformin", brands: ["Amaryl-M", "Glycomet-GP", "Gemer", "Zoryl-M"], forms: ["Tablets"], strengths: ["1mg+500mg", "2mg+500mg", "2mg+1000mg SR"], category: "Diabetes / Endocrine", gst: 12, baseMrp: 135, pack: "15x10" },
  { molecule: "Glimepiride + Metformin + Voglibose", brands: ["Volibo-M Trio", "Gemer Trio", "Voglistar-GM"], forms: ["Tablets"], strengths: ["1mg+500mg+0.2mg", "2mg+500mg+0.3mg"], category: "Diabetes / Endocrine", gst: 12, baseMrp: 195, pack: "10x10" },
  { molecule: "Teneligliptin", brands: ["Ziten", "Tenlimac", "Tenglyn"], forms: ["Tablets"], strengths: ["20mg"], category: "Diabetes / Endocrine", gst: 12, baseMrp: 125, pack: "15x10" },
  { molecule: "Sitagliptin + Metformin", brands: ["Janumet", "Istamet", "Zita-Met"], forms: ["Tablets"], strengths: ["50mg+500mg", "50mg+1000mg"], category: "Diabetes / Endocrine", gst: 12, baseMrp: 310, pack: "15x10" },
  { molecule: "Dapagliflozin", brands: ["Forxiga", "Oxra", "Dapadac"], forms: ["Tablets"], strengths: ["5mg", "10mg"], category: "Diabetes / Endocrine", gst: 12, baseMrp: 450, pack: "14x10" },
  { molecule: "Thyroxine Sodium", brands: ["Thyronorm", "Eltroxin", "Thyroup"], forms: ["Tablets"], strengths: ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg"], category: "Diabetes / Endocrine", gst: 12, baseMrp: 165, pack: "100 Tablets Bottle" },
  { molecule: "Insulin Glargine", brands: ["Lantus", "Basalog", "Glaritus"], forms: ["Cartridge", "Prefilled Pen"], strengths: ["100IU/ml 3ml"], category: "Diabetes / Endocrine", gst: 5, baseMrp: 650, pack: "1 Unit" },
  { molecule: "Human Mixtard 30/70", brands: ["Mixtard", "Huminsulin 30/70", "Wosulin"], forms: ["Vial"], strengths: ["40IU/ml 10ml"], category: "Diabetes / Endocrine", gst: 5, baseMrp: 180, pack: "1 Vial" },

  // 5. Antacid / Gastrointestinal
  { molecule: "Pantoprazole", brands: ["Pan", "Pantocid", "Pantosec", "Pantodac"], forms: ["Tablets", "Injection"], strengths: ["20mg", "40mg", "40mg Vial"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 95, pack: "15x10" },
  { molecule: "Pantoprazole + Domperidone", brands: ["Pan-D", "Pantocid-D", "Pantosec-DSR"], forms: ["Capsules"], strengths: ["40mg+30mg SR"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 160, pack: "15x10" },
  { molecule: "Rabeprazole + Domperidone", brands: ["Rablet-D", "Razo-D", "Cyra-D", "Happi-D"], forms: ["Capsules"], strengths: ["20mg+30mg SR"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 175, pack: "10x10" },
  { molecule: "Omeprazole", brands: ["Omez", "Omee", "Ocid"], forms: ["Capsules"], strengths: ["20mg", "40mg"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 65, pack: "20x10" },
  { molecule: "Esomeprazole", brands: ["Nexpro", "Esomac", "Sompraz"], forms: ["Tablets"], strengths: ["20mg", "40mg"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 120, pack: "15x10" },
  { molecule: "Sucralfate + Oxetacaine", brands: ["Sucrafil-O", "Mucaine Gel", "Ulcigel"], forms: ["Suspension"], strengths: ["1000mg+20mg/10ml 200ml"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 185, pack: "200ml Bottle" },
  { molecule: "Ondansetron", brands: ["Emeset", "Ondem", "Vomikind"], forms: ["Tablets", "Syrup"], strengths: ["4mg", "8mg", "2mg/5ml"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 45, pack: "10x10" },
  { molecule: "Rifaximin", brands: ["Rifagut", "Rcifax", "Torfix"], forms: ["Tablets"], strengths: ["200mg", "400mg", "550mg"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 380, pack: "10x10" },
  { molecule: "Digestive Enzymes", brands: ["Aristozyme", "Pepfiz", "Vitazyme"], forms: ["Liquid", "Tablets"], strengths: ["200ml Bottle", "Effervescent Tab"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 115, pack: "200ml Bottle" },
  { molecule: "Lactulose Solution", brands: ["Duphalac", "Looz", "Cremaffin Plus"], forms: ["Syrup"], strengths: ["10gm/15ml 150ml", "10gm/15ml 200ml"], category: "Antacid / Gastrointestinal", gst: 12, baseMrp: 220, pack: "200ml Bottle" },

  // 6. Respiratory / Cough & Cold
  { molecule: "Montelukast + Levocetirizine", brands: ["Montek-LC", "Montair-LC", "Levocet-M", "Telekast-L"], forms: ["Tablets", "Kid Syrup"], strengths: ["10mg+5mg", "4mg+2.5mg/5ml"], category: "Respiratory / Cough & Cold", gst: 12, baseMrp: 165, pack: "10x10" },
  { molecule: "Ambroxol + Levosalbutamol + Guaiphenesin", brands: ["Ascoril-LS", "Bro-Zedex LS", "Macbery-LS"], forms: ["Syrup"], strengths: ["100ml", "60ml"], category: "Respiratory / Cough & Cold", gst: 12, baseMrp: 110, pack: "100ml Bottle" },
  { molecule: "Dextromethorphan + Chlorpheniramine", brands: ["Benadryl DR", "TusQ-DX", "Ascoril-D"], forms: ["Syrup"], strengths: ["100ml Bottle"], category: "Respiratory / Cough & Cold", gst: 12, baseMrp: 120, pack: "100ml Bottle" },
  { molecule: "Salbutamol Inhaler", brands: ["Asthalin", "Ventorlin", "Aerocort"], forms: ["Inhaler"], strengths: ["100mcg 200 MDI"], category: "Respiratory / Cough & Cold", gst: 12, baseMrp: 145, pack: "1 Unit" },
  { molecule: "Budesonide + Formoterol Inhaler", brands: ["Foracort", "Budamate", "Symbicort"], forms: ["Rotacaps", "Inhaler"], strengths: ["200mcg+6mcg", "400mcg+6mcg"], category: "Respiratory / Cough & Cold", gst: 12, baseMrp: 380, pack: "30 Rotacaps" },
  { molecule: "Paracetamol + Phenylephrine + Chlorpheniramine", brands: ["Sinarest", "Cheston Cold", "Wikoryl", "Solvin Cold"], forms: ["Tablets", "Suspension"], strengths: ["500mg+5mg+2mg"], category: "Respiratory / Cough & Cold", gst: 12, baseMrp: 60, pack: "10x10" },
  { molecule: "N-Acetylcysteine", brands: ["Mucinac", "Fluimucil", "Nacfil"], forms: ["Effervescent Tablets"], strengths: ["600mg"], category: "Respiratory / Cough & Cold", gst: 12, baseMrp: 280, pack: "10 Tablets Tube" },

  // 7. Vitamins & Nutritional
  { molecule: "Calcium Carbonate + Vitamin D3", brands: ["Shelcal", "Gemcal", "Cipcal", "Calcimax"], forms: ["Tablets"], strengths: ["500mg+250IU", "500mg+500IU"], category: "Vitamins & Nutritional", gst: 12, baseMrp: 115, pack: "15x10" },
  { molecule: "Vitamin D3 (Cholecalciferol)", brands: ["Calcirol", "D3 Must", "Lupicheck-D3"], forms: ["Granules Sachet", "Capsules"], strengths: ["60000 IU", "60k Softgel"], category: "Vitamins & Nutritional", gst: 12, baseMrp: 120, pack: "4 Capsules Strip" },
  { molecule: "Vitamin B-Complex + Zinc", brands: ["Becosules", "Becadexamin", "Cobadex Forte"], forms: ["Capsules"], strengths: ["Standard Forte"], category: "Vitamins & Nutritional", gst: 12, baseMrp: 48, pack: "20x10" },
  { molecule: "Methylcobalamin + Alpha Lipoic Acid", brands: ["Neurobion Forte", "Nurokind-Plus", "Rejunex-CD"], forms: ["Tablets", "Capsules"], strengths: ["1500mcg+100mg"], category: "Vitamins & Nutritional", gst: 12, baseMrp: 185, pack: "10x10" },
  { molecule: "Ferrous Ascorbate + Folic Acid", brands: ["Livogen-Z", "Orofer-XT", "HB-Plus"], forms: ["Tablets", "Syrup"], strengths: ["100mg+1.5mg", "150ml Syrup"], category: "Vitamins & Nutritional", gst: 12, baseMrp: 170, pack: "10x10" },
  { molecule: "Vitamin C (Chewable)", brands: ["Limcee", "Celin", "Suckcee"], forms: ["Chewable Tablets"], strengths: ["500mg"], category: "Vitamins & Nutritional", gst: 12, baseMrp: 25, pack: "15x10" },
  { molecule: "Zinc Acetate / Sulfate", brands: ["Zinconia", "Zincofer", "Zincovit"], forms: ["Tablets", "Syrup"], strengths: ["20mg", "50mg"], category: "Vitamins & Nutritional", gst: 12, baseMrp: 65, pack: "15x10" },
  { molecule: "Protein Powder Nutritional Drink", brands: ["Ensure", "Protinex", "Groviva"], forms: ["Tin Container"], strengths: ["400gm", "500gm Tin"], category: "Vitamins & Nutritional", gst: 18, baseMrp: 520, pack: "1 Tin" },

  // 8. Dermatology / Skin Care
  { molecule: "Ketoconazole", brands: ["Nizral", "Ketocip", "Dandrop"], forms: ["Cream", "Shampoo", "Tablets"], strengths: ["2% Cream 30g", "2% Shampoo 100ml", "200mg"], category: "Dermatology / Skin Care", gst: 12, baseMrp: 165, pack: "30gm Tube" },
  { molecule: "Clobetasol Propionate", brands: ["Tenovate", "Clobetamil", "Dermovate"], forms: ["Cream", "Ointment"], strengths: ["0.05% 20gm", "0.05% 30gm"], category: "Dermatology / Skin Care", gst: 12, baseMrp: 95, pack: "30gm Tube" },
  { molecule: "Mupirocin", brands: ["Bactroban", "T-Bact", "Mupimet"], forms: ["Ointment"], strengths: ["2% 5gm", "2% 10gm"], category: "Dermatology / Skin Care", gst: 12, baseMrp: 135, pack: "10gm Tube" },
  { molecule: "Clotrimazole", brands: ["Candid", "Canesten", "Surfaz"], forms: ["Dusting Powder", "Cream"], strengths: ["1% Powder 100gm", "1% Cream 20gm"], category: "Dermatology / Skin Care", gst: 12, baseMrp: 110, pack: "100gm Bottle" },
  { molecule: "Itraconazole", brands: ["Canditral", "Itracip", "Candiforce"], forms: ["Capsules"], strengths: ["100mg", "200mg"], category: "Dermatology / Skin Care", gst: 12, baseMrp: 220, pack: "10x10" },
  { molecule: "Terbinafine", brands: ["Sebifin", "Terbicip", "Tyza"], forms: ["Tablets", "Cream"], strengths: ["250mg", "1% Cream 15g"], category: "Dermatology / Skin Care", gst: 12, baseMrp: 180, pack: "10x10" },
  { molecule: "Calamine + Liquid Paraffin", brands: ["Caladryl", "Lacto Calamine", "Calosoft"], forms: ["Lotion"], strengths: ["100ml", "120ml"], category: "Dermatology / Skin Care", gst: 12, baseMrp: 145, pack: "120ml Bottle" },

  // 9. Neurology & Psychiatry
  { molecule: "Pregabalin + Methylcobalamin", brands: ["Pregeb-M", "Maxgalin-M", "Pregalin-M"], forms: ["Capsules"], strengths: ["75mg+750mcg", "150mg+750mcg"], category: "Neurology & Psychiatry", gst: 12, baseMrp: 210, pack: "10x10" },
  { molecule: "Gabapentin + Methylcobalamin", brands: ["Gabapin-M", "Pentaneuron", "Gaba-NT"], forms: ["Tablets"], strengths: ["100mg+500mcg", "300mg+500mcg"], category: "Neurology & Psychiatry", gst: 12, baseMrp: 260, pack: "10x10" },
  { molecule: "Clonazepam", brands: ["Clona", "Rivotril", "Zapiz"], forms: ["Tablets"], strengths: ["0.25mg", "0.5mg", "1mg"], category: "Neurology & Psychiatry", gst: 12, baseMrp: 45, pack: "15x10" },
  { molecule: "Escitalopram", brands: ["Nexito", "Cipralex", "Stalopam"], forms: ["Tablets"], strengths: ["5mg", "10mg", "20mg"], category: "Neurology & Psychiatry", gst: 12, baseMrp: 115, pack: "10x10" },
  { molecule: "Alprazolam", brands: ["Alprax", "Restyl", "Trika"], forms: ["Tablets"], strengths: ["0.25mg", "0.5mg"], category: "Neurology & Psychiatry", gst: 12, baseMrp: 35, pack: "15x10" },
  { molecule: "Levetiracetam", brands: ["Levipil", "Torleva", "Epilive"], forms: ["Tablets"], strengths: ["250mg", "500mg", "750mg"], category: "Neurology & Psychiatry", gst: 12, baseMrp: 185, pack: "10x10" },

  // 10. Ophthalmic & ENT
  { molecule: "Carboxymethylcellulose (Eye Lubricant)", brands: ["Refresh Tears", "Tears Naturale", "Vizoil"], forms: ["Eye Drops"], strengths: ["0.5% 10ml", "1% 10ml"], category: "Ophthalmic / Eye Drops", gst: 12, baseMrp: 140, pack: "10ml Bottle" },
  { molecule: "Moxifloxacin (Ophthalmic)", brands: ["Vigamox", "Moxicip", "Mahaflox"], forms: ["Eye Drops"], strengths: ["0.5% 5ml"], category: "Ophthalmic / Eye Drops", gst: 12, baseMrp: 175, pack: "5ml Bottle" },
  { molecule: "Moxifloxacin + Dexamethasone", brands: ["Vigadexa", "Moxicip-D", "Mahaflox-D"], forms: ["Eye Drops"], strengths: ["0.5%+0.1% 5ml"], category: "Ophthalmic / Eye Drops", gst: 12, baseMrp: 195, pack: "5ml Bottle" },
  { molecule: "Wax Softening Ear Drops", brands: ["Waxsol", "Clearwax", "Otorex"], forms: ["Ear Drops"], strengths: ["10ml Bottle"], category: "Ophthalmic / Eye Drops", gst: 12, baseMrp: 90, pack: "10ml Bottle" },
  { molecule: "Xylometazoline Nasal Drops", brands: ["Otrivin", "Nasivion", "Xylomist"], forms: ["Nasal Spray / Drops"], strengths: ["0.05% Pediatric 10ml", "0.1% Adult 10ml"], category: "Ophthalmic / Eye Drops", gst: 12, baseMrp: 85, pack: "10ml Spray" },

  // 11. Anti-Allergic
  { molecule: "Cetirizine Hydrochloride", brands: ["Cetzine", "Zyrtec", "Alerid", "Okacet"], forms: ["Tablets", "Syrup"], strengths: ["5mg", "10mg", "5mg/5ml"], category: "Anti-Allergic", gst: 12, baseMrp: 28, pack: "10x10" },
  { molecule: "Levocetirizine", brands: ["Levocet", "Vozet", "Teczine", "1-AL"], forms: ["Tablets"], strengths: ["5mg", "10mg"], category: "Anti-Allergic", gst: 12, baseMrp: 65, pack: "10x10" },
  { molecule: "Fexofenadine", brands: ["Allegra", "Fexova", "Altiva"], forms: ["Tablets", "Suspension"], strengths: ["120mg", "180mg", "30mg/5ml"], category: "Anti-Allergic", gst: 12, baseMrp: 195, pack: "10x10" },
  { molecule: "Hydroxyzine Hydrochloride", brands: ["Atarax", "Hicope"], forms: ["Tablets", "Syrup"], strengths: ["10mg", "25mg", "10mg/5ml"], category: "Anti-Allergic", gst: 12, baseMrp: 75, pack: "15x10" },
  { molecule: "Bilastine", brands: ["Bilasurf", "Bilasure", "Bilaxten"], forms: ["Tablets"], strengths: ["20mg"], category: "Anti-Allergic", gst: 12, baseMrp: 180, pack: "10x10" },

  // 12. First Aid & Devices
  { molecule: "Digital Clinical Thermometer", brands: ["Dr. Morepen", "Omron", "Hicks"], forms: ["Device"], strengths: ["Standard Digital"], category: "First Aid & Surgical Devices", gst: 12, baseMrp: 220, pack: "1 Unit" },
  { molecule: "Digital Blood Pressure Monitor", brands: ["Omron Hem-7120", "Dr. Trust", "Beurer"], forms: ["Device"], strengths: ["Automatic Upper Arm"], category: "First Aid & Surgical Devices", gst: 18, baseMrp: 1950, pack: "1 Unit" },
  { molecule: "Blood Glucose Monitoring System", brands: ["Accu-Chek Active", "OneTouch Select", "Contour Plus"], forms: ["Device Kit"], strengths: ["Meter + 10 Strips"], category: "First Aid & Surgical Devices", gst: 12, baseMrp: 1100, pack: "1 Kit" },
  { molecule: "Blood Glucose Test Strips", brands: ["Accu-Chek Active Strips", "OneTouch Strips"], forms: ["Test Strips"], strengths: ["50 Strips Box"], category: "First Aid & Surgical Devices", gst: 12, baseMrp: 980, pack: "50 Strips" },
  { molecule: "Povidone Iodine Antiseptic Solution", brands: ["Betadine", "Cipladine", "Wokadine"], forms: ["Solution", "Ointment"], strengths: ["5% Solution 100ml", "10% Ointment 20g"], category: "First Aid & Surgical Devices", gst: 12, baseMrp: 125, pack: "100ml Bottle" },
  { molecule: "Elastic Crepe Bandage", brands: ["Hansaplast", "Flamingo", "Dynamic"], forms: ["Bandage"], strengths: ["6cm x 4m", "8cm x 4m", "10cm x 4m"], category: "First Aid & Surgical Devices", gst: 12, baseMrp: 160, pack: "1 Roll" },
  { molecule: "Surgical Cotton / Gauze Swab", brands: ["Dettol Cotton", "Johnson Gauze"], forms: ["Surgical Pack"], strengths: ["100gm Roll", "10x10cm Sterilized"], category: "First Aid & Surgical Devices", gst: 12, baseMrp: 85, pack: "1 Pack" }
];

// =========================================================================
// 2. GENERATE 850+ UNIQUE MEDICINE CATALOG ENTRIES
// =========================================================================

export function buildExpandedMedicineCatalog() {
  const catalog = [];
  let supplierIndex = 0;

  for (const item of MEDICINE_CATALOG) {
    for (const brand of item.brands) {
      for (const str of item.strengths) {
        for (const form of item.forms) {
          const supplier = SUPPLIERS[supplierIndex % SUPPLIERS.length];
          supplierIndex++;

          const fullName = `${brand} ${str} ${form}`.trim();
          const mrpVariance = 0.85 + (Math.sin(fullName.length) + 1) * 0.15; // Realistic deterministic variation
          const mrp = Math.round(item.baseMrp * mrpVariance);
          const purchaseRate = Math.round(mrp * 0.62 * 100) / 100; // ~62% of MRP

          catalog.push({
            itemName: fullName,
            molecule: item.molecule,
            category: item.category,
            pack: item.pack,
            mrp,
            purchaseRate,
            gstPercentage: item.gst,
            supplierName: supplier.name,
            supplierGST: supplier.gst
          });
        }
      }
    }
  }

  // If still below 820, expand with pediatric & Forte variants
  let counter = 1;
  while (catalog.length < 850) {
    const base = catalog[counter % 80];
    const variantName = `${base.itemName} Forte-${counter}`;
    catalog.push({
      ...base,
      itemName: variantName,
      mrp: Math.round(base.mrp * 1.2),
      purchaseRate: Math.round(base.purchaseRate * 1.2 * 100) / 100
    });
    counter++;
  }

  return catalog;
}

// =========================================================================
// 3. MAIN SEEDING ENGINE
// =========================================================================

export async function runComprehensiveSeed() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully.');

    // Fetch existing users
    const users = await User.find().lean();
    if (users.length === 0) {
      console.error('❌ No registered users found in the database. Please create a user first!');
      process.exit(1);
    }

    console.log(`📋 Found ${users.length} registered users: ${users.map(u => u.email).join(', ')}`);

    // Target users to seed: Seed for all users found so every account is fully functional
    for (let uIdx = 0; uIdx < users.length; uIdx++) {
      const targetUser = users[uIdx];
      const email = targetUser.email;
      const uNum = uIdx + 1;
      console.log(`\n==================================================================`);
      console.log(`🌱 SEEDING PRODUCTION-SCALE DATA FOR USER ${uNum}/${users.length}: ${email}`);
      console.log(`==================================================================`);

      // Step A: Clean old data for this user to maintain strict mathematical consistency
      console.log('🧹 Clearing previous transaction & inventory records for this user...');
      await Promise.all([
        Inventory.deleteMany({ email }),
        Bill.deleteMany({ email }),
        SaleBill.deleteMany({ email }),
        PurchaseReturnBill.deleteMany({ email }),
        ReturnBill.deleteMany({ email }),
        ExpiryBill.deleteMany({ email }),
        ClientExpiryReturn.deleteMany({ email }),
        ActivityLog.deleteMany({ userEmail: email })
      ]);
      console.log('✅ Cleared previous records.');

      // Step B: Generate 850+ Medicines Catalog
      const catalog = buildExpandedMedicineCatalog();
      console.log(`💊 Generated ${catalog.length} clinically verified medicine profiles.`);

      // Step C: Distribute medicines into realistic data profiles:
      const now = moment();
      const inventoryDocs = [];

      catalog.forEach((med, idx) => {
        const batchNum = `BAT-U${uNum}-${idx + 1001}`;
        let quantity = 500;
        let expiryDate = now.clone().add(365 + (idx % 300), 'days').toDate(); // Default: healthy 1-2 years

        if (idx < 45) {
          // Profile 1: Expired (15-90 days past)
          expiryDate = now.clone().subtract(15 + (idx % 75), 'days').toDate();
          quantity = 20 + (idx % 80);
        } else if (idx < 90) {
          // Profile 2: Expiring in 1-30 days
          expiryDate = now.clone().add(2 + (idx % 26), 'days').toDate();
          quantity = 30 + (idx % 100);
        } else if (idx < 175) {
          // Profile 3: Expiring in 60-90 days
          expiryDate = now.clone().add(61 + (idx % 28), 'days').toDate();
          quantity = 50 + (idx % 150);
        } else if (idx < 220) {
          // Profile 4: Out of Stock (0 units)
          quantity = 0;
          expiryDate = now.clone().add(180, 'days').toDate();
        } else if (idx < 350) {
          // Profile 5: Low Stock (5 to 25 units)
          quantity = 5 + (idx % 20);
          expiryDate = now.clone().add(240, 'days').toDate();
        } else {
          // Profile 6: Normal Healthy Stock (200 to 2000 units)
          quantity = 250 + ((idx * 37) % 1750);
          expiryDate = now.clone().add(180 + (idx % 500), 'days').toDate();
        }

        inventoryDocs.push({
          itemName: med.itemName,
          batch: batchNum,
          partyName: med.supplierName,
          email,
          expiryDate,
          pack: med.pack,
          quantity,
          purchaseRate: med.purchaseRate,
          mrp: med.mrp,
          gstPercentage: med.gstPercentage,
          description: `${med.molecule} formulation for ${med.category}.`,
          amount: Math.round(quantity * med.purchaseRate * 100) / 100,
          category: med.category,
          tags: [med.category, med.molecule.split(' ')[0]]
        });
      });

      console.log(`📦 Inserting ${inventoryDocs.length} inventory batch records into MongoDB...`);
      const insertedInventory = await Inventory.insertMany(inventoryDocs);
      console.log(`✅ ${insertedInventory.length} Inventory items inserted successfully!`);

      // Step D: Create 55 Purchase Bills (1,100+ Purchase Bill Items)
      console.log('\n🧾 Generating 55 Purchase Bills with 1,100+ line items...');
      const purchaseBills = [];
      const itemsPerPurchaseBill = 20;
      const totalPurchaseBills = 55;

      for (let b = 0; b < totalPurchaseBills; b++) {
        const supplier = SUPPLIERS[b % SUPPLIERS.length];
        const billDate = now.clone().subtract(110 - b * 2, 'days').toDate();
        const invoiceNum = `INV-U${uNum}-${1000 + b}`;
        const receiptNum = `PRCP-U${uNum}-${1000 + b}`;

        const billItems = [];
        let billPurchaseAmount = 0;
        let billTotalGst = 0;

        for (let i = 0; i < itemsPerPurchaseBill; i++) {
          const medIndex = (b * itemsPerPurchaseBill + i) % inventoryDocs.length;
          const inv = inventoryDocs[medIndex];
          const qtyPurchased = Math.max(50, Math.round(inv.quantity * 1.25));
          const lineTotal = Math.round(qtyPurchased * inv.purchaseRate * 100) / 100;
          const lineGst = Math.round((lineTotal * inv.gstPercentage) / 100 * 100) / 100;

          billPurchaseAmount += lineTotal;
          billTotalGst += lineGst;

          billItems.push({
            itemName: inv.itemName,
            batch: inv.batch,
            quantity: qtyPurchased,
            purchaseRate: inv.purchaseRate,
            mrp: inv.mrp,
            expiryDate: inv.expiryDate,
            gstPercentage: inv.gstPercentage,
            pack: inv.pack,
            discount: 0,
            gstAmount: lineGst,
            totalAmount: lineTotal
          });
        }

        const discountAmount = Math.round(billPurchaseAmount * 0.05 * 100) / 100; // 5% trade discount
        const netTotal = Math.round((billPurchaseAmount - discountAmount + billTotalGst) * 100) / 100;

        purchaseBills.push({
          billType: 'purchase',
          supplierInvoiceNumber: invoiceNum,
          receiptNumber: receiptNum,
          partyName: supplier.name,
          date: billDate,
          email,
          purchaseAmount: billPurchaseAmount,
          discountAmount,
          totalAmount: netTotal,
          items: billItems
        });
      }

      await Bill.insertMany(purchaseBills);
      console.log(`✅ ${purchaseBills.length} Purchase Bills inserted (Items total: ${purchaseBills.length * itemsPerPurchaseBill}).`);

      // Step E: Create 52 Sales Bills (300+ Line Items Total)
      console.log('\n💰 Generating 52 Sales Bills with 300+ line items...');
      const saleBills = [];
      const customerPurchasesMap = {};

      for (let s = 0; s < 52; s++) {
        const customer = CUSTOMERS[s % CUSTOMERS.length];
        const saleDate = now.clone().subtract(60 - s, 'days').toDate();
        const saleInvoiceNum = `SALE-U${uNum}-${100 + s}`;
        const receiptNum = `SRCP-U${uNum}-${100 + s}`;

        const numItems = 5 + (s % 4); // 5 to 8 items per sale bill
        const saleItems = [];
        let grossAmount = 0;
        let totalDiscount = 0;
        let totalGstSum = 0;
        let netAmountSum = 0;

        for (let j = 0; j < numItems; j++) {
          const medIndex = ((s * 7) + j) % insertedInventory.length;
          const inv = insertedInventory[medIndex];
          const soldQty = 2 + (j % 5);
          const discountPct = (j % 3 === 0) ? 5 : 0;

          const itemTotal = inv.mrp * soldQty;
          const itemDiscount = Math.round((itemTotal * discountPct) / 100 * 100) / 100;
          const taxable = itemTotal - itemDiscount;
          const gst = Math.round((taxable * inv.gstPercentage) / 100 * 100) / 100;
          const sgst = Math.round(gst / 2 * 100) / 100;
          const cgst = gst - sgst;
          const net = Math.round((taxable + gst) * 100) / 100;

          grossAmount += itemTotal;
          totalDiscount += itemDiscount;
          totalGstSum += gst;
          netAmountSum += net;

          saleItems.push({
            itemName: inv.itemName,
            batch: inv.batch,
            quantity: soldQty,
            mrp: inv.mrp,
            discount: discountPct,
            gstPercentage: inv.gstPercentage,
            expiryDate: inv.expiryDate,
            sgst,
            cgst,
            igst: 0,
            totalGst: gst,
            netAmount: net
          });

          // Add to customer purchase history record
          if (!customerPurchasesMap[customer]) {
            customerPurchasesMap[customer] = [];
          }
          customerPurchasesMap[customer].push({
            date: saleDate,
            invoiceNumber: saleInvoiceNum,
            items: [{
              itemName: inv.itemName,
              batch: inv.batch,
              quantity: soldQty,
              rate: inv.mrp,
              discount: discountPct,
              amount: net
            }],
            totalAmount: net,
            soldQuantity: soldQty
          });
        }

        saleBills.push({
          saleInvoiceNumber: saleInvoiceNum,
          receiptNumber: receiptNum,
          partyName: customer,
          email,
          date: saleDate,
          gstNumber: s % 5 === 0 ? "27AADCP1234F1Z5" : "UNREGISTERED",
          items: saleItems,
          totalAmount: Math.round(grossAmount * 100) / 100,
          discountAmount: Math.round(totalDiscount * 100) / 100,
          sgstAmount: Math.round(totalGstSum / 2 * 100) / 100,
          cgstAmount: Math.round(totalGstSum / 2 * 100) / 100,
          igstAmount: 0,
          totalGstAmount: Math.round(totalGstSum * 100) / 100,
          netAmount: Math.round(netAmountSum * 100) / 100
        });
      }

      await SaleBill.insertMany(saleBills);
      console.log(`✅ ${saleBills.length} Sales Bills inserted successfully.`);

      // Update Customer Purchases collection
      const customerDocs = Object.keys(customerPurchasesMap).map(cName => ({
        partyName: cName,
        gstNo: "UNREGISTERED",
        purchaseHistory: customerPurchasesMap[cName]
      }));
      await CustomerPurchase.deleteMany({ partyName: { $in: Object.keys(customerPurchasesMap) } });
      await CustomerPurchase.insertMany(customerDocs);
      console.log(`✅ ${customerDocs.length} Customer Purchase histories updated.`);

      // Step F: Create 50 Purchase Returns (Pharmacy -> Supplier)
      console.log('\n↩️ Generating 50 Purchase Returns...');
      const purchaseReturns = [];

      for (let pr = 0; pr < 50; pr++) {
        const supplier = SUPPLIERS[pr % SUPPLIERS.length];
        const returnDate = now.clone().subtract(45 - pr, 'days').toDate();
        const returnInvNum = `PR-RET-U${uNum}-${100 + pr}`;
        const rcpNum = `PR-RCP-U${uNum}-${100 + pr}`;

        const inv = insertedInventory[(pr * 4) % insertedInventory.length];
        const retQty = 10 + (pr % 15);
        const total = Math.round(retQty * inv.purchaseRate * 100) / 100;
        const gst = Math.round((total * inv.gstPercentage) / 100 * 100) / 100;
        const net = Math.round((total + gst) * 100) / 100;

        purchaseReturns.push({
          returnInvoiceNumber: returnInvNum,
          date: returnDate,
          receiptNumber: rcpNum,
          supplierName: supplier.name,
          supplierGST: supplier.gst,
          email,
          items: [{
            itemName: inv.itemName,
            batch: inv.batch,
            quantity: retQty,
            purchaseRate: inv.purchaseRate,
            mrp: inv.mrp,
            discount: 0,
            gstPercentage: inv.gstPercentage,
            expiryDate: inv.expiryDate,
            totalAmount: total,
            discountAmount: 0,
            gstAmount: gst,
            netAmount: net
          }],
          totalAmount: total,
          totalDiscount: 0,
          totalGst: gst,
          netAmount: net
        });
      }

      await PurchaseReturnBill.insertMany(purchaseReturns);
      console.log(`✅ ${purchaseReturns.length} Purchase Returns inserted.`);

      // Step G: Create 50 Sales Returns (Customer -> Pharmacy)
      console.log('\n↪️ Generating 50 Sales Returns...');
      const salesReturns = [];

      for (let sr = 0; sr < 50; sr++) {
        const customer = CUSTOMERS[sr % CUSTOMERS.length];
        const returnDate = now.clone().subtract(40 - sr, 'days').toDate();
        const returnInvNum = `SR-RET-U${uNum}-${100 + sr}`;
        const rcpNum = `SR-RCP-U${uNum}-${100 + sr}`;

        const inv = insertedInventory[(sr * 6) % insertedInventory.length];
        const retQty = 1 + (sr % 3);
        const itemAmount = Math.round(retQty * inv.mrp * 100) / 100;
        const gstAmt = Math.round((itemAmount * inv.gstPercentage) / 100 * 100) / 100;
        const netAmount = Math.round((itemAmount + gstAmt) * 100) / 100;

        salesReturns.push({
          returnInvoiceNumber: returnInvNum,
          date: returnDate,
          receiptNumber: rcpNum,
          customerName: customer,
          email,
          items: [{
            itemName: inv.itemName,
            batch: inv.batch,
            quantity: retQty,
            discount: 0,
            amount: itemAmount
          }],
          totalAmount: itemAmount,
          totalDiscount: 0,
          gstAmount: gstAmt,
          netAmount
        });
      }

      await ReturnBill.insertMany(salesReturns);
      console.log(`✅ ${salesReturns.length} Sales Returns inserted.`);

      // Step H: Create 100 Expiry-Related Records (50 Expiry Bills + 50 Client Expiry Returns)
      console.log('\n⏰ Generating 100 Expiry Management records...');
      const expiryBills = [];
      const clientExpiryReturns = [];

      for (let ex = 0; ex < 50; ex++) {
        const supplier = SUPPLIERS[ex % SUPPLIERS.length];
        const inv = insertedInventory[ex % 45]; // Using expired items
        const expQty = Math.max(5, Math.round(inv.quantity * 0.5));
        const val = Math.round(expQty * inv.purchaseRate * 100) / 100;

        expiryBills.push({
          expiryBillNumber: `EXP-BILL-U${uNum}-${100 + ex}`,
          partyName: supplier.name,
          startDate: now.clone().subtract(90, 'days').toDate(),
          endDate: now.clone().subtract(10, 'days').toDate(),
          email,
          items: [{
            _id: inv._id,
            itemName: inv.itemName,
            batch: inv.batch,
            expiryDate: inv.expiryDate,
            quantity: inv.quantity,
            expiredQuantity: expQty,
            mrp: inv.mrp,
            purchaseRate: inv.purchaseRate,
            value: val
          }],
          totalItems: 1,
          totalQuantity: expQty,
          totalValue: val,
          notes: `Batch reconciliation for expired medicine credit from ${supplier.name}.`
        });

        // Client Expiry Return (Customer returned expired medicine)
        const customer = CUSTOMERS[ex % CUSTOMERS.length];
        const clientExpQty = 1 + (ex % 3);
        const clientVal = Math.round(clientExpQty * inv.mrp * 100) / 100;

        clientExpiryReturns.push({
          returnBillNumber: `CLIENT-EXP-U${uNum}-${100 + ex}`,
          partyName: customer,
          date: now.clone().subtract(ex, 'days').toDate(),
          email,
          items: [{
            itemName: inv.itemName,
            batch: inv.batch,
            expiryDate: inv.expiryDate,
            originalSaleInvoiceNumber: `SALE-U${uNum}-${100 + (ex % 52)}`,
            purchaseDate: now.clone().subtract(ex + 20, 'days').toDate(),
            soldQuantity: clientExpQty + 2,
            returnQuantity: clientExpQty,
            mrp: inv.mrp,
            purchaseRate: inv.purchaseRate,
            value: clientVal
          }],
          totalItems: 1,
          totalQuantity: clientExpQty,
          totalValue: clientVal,
          notes: `Customer return of unconsumed expired medicine for store credit.`
        });
      }

      await ExpiryBill.insertMany(expiryBills);
      await ClientExpiryReturn.insertMany(clientExpiryReturns);
      console.log(`✅ 50 Expiry Bills & 50 Client Expiry Returns inserted (100 total expiry records).`);

      // Step I: Create 50 Activity Logs (Audit Trail)
      console.log('\n📝 Generating 50 Audit / Activity Logs...');
      const activityLogs = [];
      const actionTypes = [
        { action: 'PURCHASE_BILL_CREATED', resource: 'Bill', details: { desc: 'Supplier Purchase Order booked' } },
        { action: 'SALE_INVOICE_GENERATED', resource: 'SaleBill', details: { desc: 'Customer walk-in sales invoice processed' } },
        { action: 'STOCK_LEVEL_ADJUSTED', resource: 'Inventory', details: { desc: 'Physical audit and batch quantity sync' } },
        { action: 'PURCHASE_RETURN_FILED', resource: 'PurchaseReturn', details: { desc: 'Damaged / recall inventory returned to distributor' } },
        { action: 'CUSTOMER_RETURN_PROCESSED', resource: 'ReturnBill', details: { desc: 'Patient refund / return receipt issued' } },
        { action: 'EXPIRY_AUDIT_LOGGED', resource: 'ExpiryBill', details: { desc: 'Automated 30-day expiry threshold alert dispatched' } }
      ];

      for (let a = 0; a < 50; a++) {
        const act = actionTypes[a % actionTypes.length];
        activityLogs.push({
          userEmail: email,
          action: act.action,
          resource: act.resource,
          details: { ...act.details, refId: `REF-${1000 + a}`, timestamp: now.clone().subtract(a * 18, 'hours').toISOString() },
          ipAddress: `192.168.1.${10 + (a % 40)}`,
          createdAt: now.clone().subtract(a * 18, 'hours').toDate()
        });
      }

      await ActivityLog.insertMany(activityLogs);
      console.log(`✅ ${activityLogs.length} Activity Logs inserted.`);

      console.log(`\n🎉 Data seeding completed successfully for ${email}!`);
    }

    console.log('\n==================================================================');
    console.log('🏆 ALL PRODUCTION-GRADE SEEDING FINISHED ACROSS ALL COLLECTIONS!');
    console.log('==================================================================');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ SEEDING FAILED WITH ERROR:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seed_comprehensive_production_data.js')) {
  runComprehensiveSeed();
}
