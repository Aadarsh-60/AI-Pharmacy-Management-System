<p align="center">
  <h1 align="center">💊 Pharmacy Management System</h1>
  <p align="center">
    A full-stack web application for managing pharmacy inventory, billing, purchase returns, expiry tracking, and sales analytics — built with React and Node.js.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <strong>🔴 Live Demo:</strong> <a href="https://pharmacy-frontend-zw64.onrender.com">https://pharmacy-frontend-zw64.onrender.com</a>
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧾 About

**Pharmacy Management System** is a comprehensive solution designed for pharmacies to digitally manage their day-to-day operations. It handles everything from inventory tracking and purchase/sale billing to expiry management and detailed sales analytics — all in real-time with WebSocket-powered live updates.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration with **email OTP verification**
- Secure login with **JWT-based authentication**
- Protected routes and session management
- Rate limiting and request throttling

### 📦 Inventory Management
- Add, edit, and delete medicines
- Track medicines by **batch number, expiry date, quantity, and MRP**
- Batch-level quantity tracking
- Search and filter inventory by medicine name, party/supplier
- **Inventory locking mechanism** to prevent concurrent modifications

### 🧾 Billing System
- **Purchase Bills** — Record new stock purchases from suppliers
- **Sale Bills** — Generate customer sale invoices with auto-calculated totals
- **Auto-incrementing invoice numbers**
- **PDF invoice generation** (downloadable)
- Party-wise invoice search

### 🔄 Returns Management
- **Purchase Returns** — Return damaged/expired stock to suppliers
- **Sale Returns** — Process customer return requests
- **Client Expiry Returns** — Handle expired medicine returns from clients
- Search and track all return bills

### ⏰ Expiry Tracking
- **Expiry alerts** for medicines nearing expiry
- **Client expiry bill generation** — Bill expired stock returned by clients
- **Supplier expiry bill generation** — Forward expiry returns to suppliers
- Batch-wise expiry monitoring

### 📊 Reports & Analytics
- **Dashboard** with key metrics (total inventory value, sales, purchases)
- **Medicine sales summary** with date-range filtering
- Purchase history with advanced search
- Party/supplier-wise analytics

### ⚡ Real-Time Updates
- **Socket.io integration** for live inventory, billing, and expiry updates
- Multi-user real-time synchronization

### 🤖 AI Integrations (Powered by Gemini)
- **AI Pharmacist Chatbot** — An intelligent floating assistant that suggests generic alternatives and substitutes for out-of-stock medicines by reading real-time inventory.
- **Smart Demand Forecasting** — AI analyzes the last 30 days of sales data to predict future demand and suggests optimal auto-reorder quantities.

### 📝 OCR (Experimental)
- **Google Cloud Vision OCR** for scanning and digitizing physical bills

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI Library |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP requests |
| Socket.io Client | Real-time communication |
| jsPDF + AutoTable | Client-side PDF generation |
| Lucide React & React Icons | Icons |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | WebSocket server |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Nodemailer | Email OTP verification |
| PDFKit | Server-side PDF generation |
| Multer | File upload handling |
| Google Cloud Vision | OCR processing |
| Google Gen AI SDK | AI Chatbot & Forecasting |
| express-rate-limit | Rate limiting |

---

## 📁 Project Structure

```
pharmacy-management-system/
├── backend/
│   ├── config/
│   │   ├── .env              # Environment variables
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── billController.js
│   │   ├── expiryBillController.js
│   │   ├── InventoryController.js
│   │   ├── ocrBillController.js
│   │   └── purchaseReturnController.js
│   ├── middleware/
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Bill.js
│   │   ├── Inventory.js
│   │   ├── User.js
│   │   ├── SaleBillModel.js
│   │   ├── ExpiryBill.js
│   │   ├── PurchaseReturnBill.js
│   │   ├── ReturnBillModel.js
│   │   ├── CustomerPurchase.js
│   │   ├── ClientExpiryReturn.js
│   │   └── InventoryLock.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── billRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── expiryBillRoutes.js
│   │   ├── expiryRoutes.js
│   │   ├── purchaseReturnRoutes.js
│   │   └── ocrBillRoutes.js
│   ├── services/
│   │   └── inventoryService.js
│   ├── cronJobs/
│   ├── utils/
│   ├── uploads/
│   ├── pdfs/                  # Generated PDF invoices
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Inventory.js
│   │   │   ├── ViewInventory.js
│   │   │   ├── AddMedicine.js
│   │   │   ├── InventoryForm.js
│   │   │   ├── MedicineList.js
│   │   │   ├── SellBillForm.js
│   │   │   ├── PurchaseBillForm.js
│   │   │   ├── SaleReturnForm.js
│   │   │   ├── PurchaseReturnForm.js
│   │   │   ├── PurchaseReturnSearch.js
│   │   │   ├── PurchaseHistory.jsx
│   │   │   ├── ClientExpiryBillGenerator.js
│   │   │   ├── ClientExpiryReturnForm.js
│   │   │   ├── SupplierExpiryBillGenerator.js
│   │   │   ├── ExpiryBillForm.js
│   │   │   ├── Report.js
│   │   │   ├── Alerts.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Layout.js
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── SocketContext.js
│   │   ├── utils/
│   │   │   ├── axios.js       # Centralized Axios instance
│   │   │   └── socketUtils.js
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+
- **MongoDB Atlas** account (or local MongoDB instance)
- **Gmail account** (for email OTP — requires App Password)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/pharmacy-management-system.git
cd pharmacy-management-system
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create the environment file at `backend/config/.env`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server:

```bash
npm run dev    # Development (with hot-reload)
npm start      # Production
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

The app will be available at `http://localhost:3000`.

---

## 🔑 Environment Variables

### Backend (`backend/config/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ |
| `PORT` | Server port (default: 5000) | ✅ |
| `JWT_SECRET` | Secret key for JWT token signing | ✅ |
| `EMAIL_USER` | Gmail address for sending OTP emails | ✅ |
| `EMAIL_PASS` | Gmail App Password | ✅ |
| `GEMINI_API_KEY` | Google Gemini API Key for AI features | ✅ |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API base URL | ✅ |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | User login |
| POST | `/api/users/verify-email` | Verify email with OTP |
| POST | `/api/users/resend-verification` | Resend OTP |
| GET | `/api/users/profile` | Get user profile |
| GET | `/api/users/batch-details` | Get batch details |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get all inventory items |
| POST | `/api/inventory` | Add new medicine |
| PUT | `/api/inventory/:id` | Update medicine details |
| DELETE | `/api/inventory/:id` | Delete medicine |
| GET | `/api/inventory/available` | Get available stock |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bills/purchase` | Create purchase bill |
| POST | `/api/bills/sale` | Create sale bill |
| POST | `/api/bills/return` | Create return bill |
| GET | `/api/bills/next-invoice-number` | Get next invoice number |
| GET | `/api/bills/party-invoices/:party` | Get party-wise invoices |
| GET | `/api/bills/medicine-sales` | Get medicine sales summary |

### Expiry Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expiry` | Get expiry alerts |
| POST | `/api/expiry-bills` | Create expiry bill |
| GET | `/api/expiry-bills` | Get all expiry bills |

### Purchase Returns
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/purchase-returns` | Create purchase return |
| GET | `/api/purchase-returns` | Get all purchase returns |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot` | Chat with AI Pharmacist |
| GET | `/api/forecast` | Get demand forecast & reorder suggestions |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api` | API info |
| GET | `/api/status` | Server status |

---

## 🌐 Deployment

### Backend — [Render](https://render.com)
- **Runtime**: Node.js
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- Set all environment variables in Render Dashboard

### Frontend — [Render](https://render.com)
- **Live URL**: [https://pharmacy-frontend-zw64.onrender.com](https://pharmacy-frontend-zw64.onrender.com)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- Set `REACT_APP_API_URL` to your deployed backend URL

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ by <strong>Pratik Pradhan</strong>
</p>
