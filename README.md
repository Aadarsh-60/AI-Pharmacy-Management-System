<p align="center">
  <h1 align="center">💊 MedInventory – Pharmacy & Medical Store Management System</h1>
  <p align="center">
    A full-stack MERN application for managing pharmacy batch inventory, GST billing, supplier & customer returns, expiry tracking, OCR invoice scanning, and AI clinical drug safety checks — synchronized in real time via Socket.IO.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Testing & Seeding](#-testing--seeding)
- [License](#-license)

---

## 🧾 About

**MedInventory** is a full-stack medical store and dispensary management web application built on the **MERN stack (MongoDB, Express.js, React 18, Node.js)**. It brings together fast counter billing, batch-level and First-Expired-First-Out (FEFO) inventory tracking, GST compliance, automated expiry checks, OCR supplier invoice auto-fill, and Google Gemini AI clinical assistance into one responsive platform.

---

## ✨ Key Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- Multi-role accounts for **Medical Store Owner** (`admin`), **Store Manager** (`manager`), and **Billing Staff / Cashier** (`user`) with 1-click demo login support
- Email OTP verification and password reset (`Nodemailer` + Brevo SMTP)
- Stateless JWT session authentication (`jsonwebtoken` + `bcryptjs`)
- Admin-only inventory reset & audit logs (`authorizeRoles('admin')`, `ActivityLog`)
- API rate limiting (`express-rate-limit` + `express-slow-down`) and duplicate invoice protection (`Idempotency-Key`)

### 📦 Batch & FEFO Inventory Management
- Batch-level tracking of medicine name, batch code, supplier party name, quantity, purchase rate, MRP, GST%, pack size, and expiry date
- Store-wide smart search across roles with flexible multi-word matching
- Expiring `InventoryLock` TTL guard to prevent double-selling of active batches
- Live WebSocket stock updates across screens via **Socket.IO**

### 🧾 Automated GST Sales & Purchase Billing
- **Sales Billing (`SellBillForm`)** — Instant medicine autocomplete automatically selects the best in-stock batch, sets `Qty = 1`, fills **MRP (₹)** and **Sale Rate (₹)**, supports two-way `Sale Rate ↔ Discount%` math, calculates CGST/SGST taxes, deducts stock atomically after sale, and generates downloadable customer PDF receipts (with wholesale cost kept private)
- **Purchase Billing (`PurchaseBillForm`)** — Records supplier stock inwarding with automatic batch creation/updates and PDF/image OCR invoice scanning
- Auto-incrementing invoice and receipt numbers

### 🤖 AI Clinical Safety, Forecasting & OCR (Google Gemini AI + Fallbacks)
- **Clinical Drug Safety Check** — Cross-checks active medicines on a sales bill for drug-drug interactions, severity levels (`high`, `moderate`, `low`, `none`), and pharmacist counseling notes
- **Medicine Demand & Stock Reorder Planner** — Analyzes 30-day sales velocity vs. current stock with Google Gemini AI (and falls back seamlessly to local statistical calculation when offline)
- **OCR Purchase Bill Auto-Fill** — Parses uploaded supplier invoice images/PDFs into structured bill rows (with native PDF parser fallback)
- **AI Pharmacy Assistant Chatbot** — Floating assistant widget for stock queries and generic substitutes

### ⏰ Expiry Monitoring, Returns & Analytics
- Daily midnight `node-cron` expiry check creating `ExpiryBill` records automatically
- Customer sales returns (`ReturnBill`), supplier purchase returns (`PurchaseReturnBill`), and client/supplier expiry bills
- Interactive **Dashboard**, **Sales Summary Reports (`Recharts`)**, **Purchase History**, and **Alerts**

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18.2, React Router v6, Tailwind CSS 3.4, Axios, Socket.IO Client 4.8, Recharts, Lucide React, Framer Motion, jsPDF + AutoTable, React Hot Toast |
| **Backend** | Node.js v22, Express 4.21, Mongoose 7.0, Socket.IO 4.8, `jsonwebtoken`, `bcryptjs`, `node-cron`, `multer`, `pdfkit`, `nodemailer`, `express-rate-limit` |
| **Database** | MongoDB Atlas (Compound & TTL Indexes) |
| **AI & OCR** | Google Gemini AI (`@google/genai`), Google Cloud Vision (`@google-cloud/vision`) |

---

## 📁 Project Structure

```
Pharmacy_management/
├── backend/
│   ├── config/
│   │   ├── .env                          # Backend environment variables
│   │   └── db.js                         # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── activityLogController.js
│   │   ├── billController.js
│   │   ├── chatbotController.js
│   │   ├── expiryBillController.js
│   │   ├── forecastController.js
│   │   ├── InventoryController.js
│   │   ├── ocrBillController.js
│   │   └── purchaseReturnController.js
│   ├── cronJobs/
│   │   └── expiryCheck.js                # Daily midnight expiry cron job
│   ├── middleware/
│   │   ├── activityLogger.js
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── idempotencyMiddleware.js
│   │   └── rbacMiddleware.js
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Bill.js
│   │   ├── ClientExpiryReturn.js
│   │   ├── CustomerPurchase.js
│   │   ├── ExpiryBill.js
│   │   ├── IdempotencyKey.js
│   │   ├── Inventory.js
│   │   ├── InventoryLock.js
│   │   ├── PurchaseReturnBill.js
│   │   ├── ReturnBill.js
│   │   ├── ReturnBillModel.js
│   │   ├── ReturnBillSchema.js
│   │   ├── SaleBillModel.js
│   │   └── User.js
│   ├── routes/
│   │   ├── activityLogRoutes.js
│   │   ├── billRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── expiryBillRoutes.js
│   │   ├── expiryRoutes.js
│   │   ├── forecastRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── ocrBillRoutes.js
│   │   ├── purchaseReturnRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── generateToken.js
│   │   ├── inventoryLockUtils.js
│   │   ├── pdfGenerator.js
│   │   ├── socketUtils.js
│   │   └── validators.js
│   ├── pdfs/                             # Runtime generated PDF receipts
│   ├── seed_comprehensive_production_data.js
│   ├── test_all_endpoints.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/                           # Favicons, logos & index.html
│   ├── src/
│   │   ├── components/                   # Dashboard, Billing, Inventory, AI & Return UIs
│   │   ├── context/                      # SocketContext & ThemeContext
│   │   ├── utils/                        # Axios & Socket helpers
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (tested with v22)
- **npm** v9+
- **MongoDB Atlas** URI (or local MongoDB instance)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Pharmacy_management
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev    # Development with nodemon
# or: npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start      # Runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/config/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Backend port (default `5000`) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GEMINI_API_KEY` | Google Gemini API key (optional fallback works offline) |
| `BREVO_SMTP_USER` | SMTP username for OTP & email delivery |
| `BREVO_SMTP_KEY` | SMTP key/password |
| `BREVO_FROM_EMAIL` | Sender email address |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL (e.g., `http://localhost:5000`) |

---

## 📡 API Endpoints

| Area | Base Route | Key Endpoints |
|---|---|---|
| **Users & Auth** | `/api/users` | `POST /register`, `POST /login`, `POST /verify-email`, `POST /forgot-password`, `POST /reset-password`, `GET /profile` |
| **Inventory** | `/api/inventory` | `GET /`, `GET /available`, `GET /search`, `GET /summary`, `POST /add-update`, `POST /reset` (`admin` only) |
| **Bills** | `/api/bills` | `POST /purchase`, `POST /sale`, `POST /return`, `POST /next-invoice-number`, `GET /medicine-sales`, `GET /purchase-history` |
| **Expiry & Returns** | `/api/expiry`, `/api/expiry-bills`, `/api/purchase-returns` | Expiry alerts, client/supplier expiry returns, purchase return bills |
| **AI & OCR** | `/api/chatbot`, `/api/forecast`, `/api/ocr-bill` | `POST /api/chatbot`, `POST /api/chatbot/check-interactions`, `GET /api/forecast`, `POST /api/ocr-bill/scan` |
| **Audit & Utility** | `/api/activity-logs`, `/health`, `/api` | Admin activity logs (`admin` only), health check, PDF download (`/download/pdf/:invoiceNumber`) |

---

## 🧪 Testing & Seeding

From inside `backend/`:

```bash
# Seed 850+ realistic Indian pharmaceutical batches, suppliers & sample bills
npm run seed:production

# Run automated REST API integration verification (13 endpoint checks)
npm run test:endpoints
```

From inside `frontend/`:

```bash
# Verify optimized production build
npm run build
```

---

## 📄 License

This project is licensed under the **ISC License**.
