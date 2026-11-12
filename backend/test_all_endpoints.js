import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config/.env') });

// Import server.js which connects to DB and listens on PORT=5000
import './server.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const TEST_EMAIL = 'vikramaadarsh2001@gmail.com';

const testToken = jwt.sign(
    { id: '6a651b1f909c0dab693b3b49', email: TEST_EMAIL },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
);

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${testToken}`
};

const results = [];

async function runTest(name, fn) {
    process.stdout.write(`⏳ Running: ${name} ... `);
    const start = Date.now();
    try {
        const detail = await fn();
        const duration = Date.now() - start;
        console.log(`✅ PASS (${duration}ms)`);
        results.push({ name, status: 'PASS', duration, detail });
    } catch (err) {
        const duration = Date.now() - start;
        console.log(`❌ FAIL (${duration}ms) - ${err.message}`);
        results.push({ name, status: 'FAIL', duration, error: err.message });
    }
}

async function start() {
    console.log('===============================================================');
    console.log('🏥 PHARMACY MANAGEMENT SYSTEM - ENDPOINT VERIFICATION SUITE');
    console.log('===============================================================\n');

    // Wait 2 seconds for MongoDB connection to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`📡 Testing against server on ${BASE_URL}\n`);

    try {
        // 1. Health check
        await runTest('GET /health (Server Health & Uptime)', async () => {
            const res = await fetch(`${BASE_URL}/health`);
            if (res.status !== 200) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            return `Status: ${data.status}`;
        });

        // 2. API Info
        await runTest('GET /api (System Meta Info)', async () => {
            const res = await fetch(`${BASE_URL}/api`);
            if (res.status !== 200) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            return `Version: ${data.version}`;
        });

        // 3. Inventory available endpoint with exact hyphenated batch
        await runTest('GET /api/inventory/available (Starpress with hyphenated batch)', async () => {
            const res = await fetch(`${BASE_URL}/api/inventory/available?email=${TEST_EMAIL}&itemName=Starpress-XL 100mg Tablets`, { headers });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Expected at least one batch in available list');
            return `Found ${data.length} batch(es), Batch: ${data[0].batch}, Available: ${data[0].availableQuantity}`;
        });

        // 4. Inventory available endpoint with non-existent item (Verify 200 [] instead of 404 crash)
        await runTest('GET /api/inventory/available (Non-existent item returns 200 [])', async () => {
            const res = await fetch(`${BASE_URL}/api/inventory/available?email=${TEST_EMAIL}&itemName=NonExistentMedicine999`, { headers });
            if (res.status !== 200) throw new Error(`Expected 200 with empty array, got status ${res.status}`);
            const data = await res.json();
            if (!Array.isArray(data) || data.length !== 0) throw new Error('Expected empty array');
            return `Gracefully returned empty array []`;
        });

        // 5. Inventory search endpoint
        await runTest('GET /api/inventory/search (Search by keyword)', async () => {
            const res = await fetch(`${BASE_URL}/api/inventory/search?email=${TEST_EMAIL}&itemName=Starpress`, { headers });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Expected search results');
            return `Found ${data.length} matching inventory records`;
        });

        // 6. Test Sales Bill creation with hyphenated batch (BAT-U1-1415)
        const timestamp = Date.now();
        const testInvoice1 = `INV-T1-${timestamp.toString().slice(-5)}`;
        await runTest(`POST /api/bills/sale (Sale with exact hyphenated batch BAT-U1-1415)`, async () => {
            const payload = {
                saleInvoiceNumber: testInvoice1,
                date: new Date().toISOString(),
                receiptNumber: `REC-T1-${timestamp.toString().slice(-5)}`,
                partyName: 'Aadarsh Retail Customer',
                email: TEST_EMAIL,
                gstNumber: 'UNREGISTERED',
                items: [
                    {
                        itemName: 'Starpress-XL 100mg Tablets',
                        batch: 'BAT-U1-1415',
                        quantity: 1,
                        mrp: 127,
                        purchaseRate: 78.74,
                        discount: 10,
                        gstPercentage: 12,
                        totalGst: 13.72,
                        netAmount: 128.02,
                        expiryDate: '2028-06-23'
                    }
                ],
                totalAmount: 127,
                discountAmount: 12.7,
                sgstAmount: 6.86,
                cgstAmount: 6.86,
                igstAmount: 0,
                totalGstAmount: 13.72,
                netAmount: 128.02
            };

            const res = await fetch(`${BASE_URL}/api/bills/sale`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            if (res.status !== 201) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Created Bill ID: ${data.data?._id || data._id || 'OK'}`;
        });

        // 7. Test Sales Bill creation with SANITIZED batch BATU11415 (User Image Case!)
        const testInvoice2 = `INV-T2-${timestamp.toString().slice(-5)}`;
        await runTest(`POST /api/bills/sale (Sale with sanitized batch BATU11415 - Resolves User Error)`, async () => {
            const payload = {
                saleInvoiceNumber: testInvoice2,
                date: new Date().toISOString(),
                receiptNumber: `REC-T2-${timestamp.toString().slice(-5)}`,
                partyName: 'Sonu Retail Customer',
                email: TEST_EMAIL,
                gstNumber: 'UNREGISTERED',
                items: [
                    {
                        itemName: 'Starpress-XL 100mg Tablets',
                        batch: 'BATU11415', // Sanitized batch without hyphen (as in user screenshot)
                        quantity: 1,
                        mrp: 127,
                        purchaseRate: 78.74,
                        discount: 10,
                        gstPercentage: 12,
                        totalGst: 13.72,
                        netAmount: 128.02,
                        expiryDate: '2028-06-23'
                    }
                ],
                totalAmount: 127,
                discountAmount: 12.7,
                sgstAmount: 6.86,
                cgstAmount: 6.86,
                igstAmount: 0,
                totalGstAmount: 13.72,
                netAmount: 128.02
            };

            const res = await fetch(`${BASE_URL}/api/bills/sale`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            if (res.status !== 201) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Successfully resolved sanitized batch! Bill ID: ${data.data?._id || data._id || 'OK'}`;
        });

        // 8. Fetch sales bills / medicine sales details
        await runTest('GET /api/bills/medicine-sales (Fetch Sales Details)', async () => {
            const res = await fetch(`${BASE_URL}/api/bills/medicine-sales?email=${TEST_EMAIL}`, { headers });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Fetched sales summary: ${Array.isArray(data) ? data.length + ' records' : 'OK'}`;
        });

        // 9. Fetch purchase history
        await runTest('GET /api/bills/purchase-history (Fetch Purchase History)', async () => {
            const res = await fetch(`${BASE_URL}/api/bills/purchase-history?email=${TEST_EMAIL}`, { headers });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Fetched purchase history records: ${Array.isArray(data) ? data.length : 'OK'}`;
        });

        // 10. Purchase Returns list (Authenticated)
        await runTest('GET /api/purchase-returns/bills (Fetch Purchase Returns)', async () => {
            const res = await fetch(`${BASE_URL}/api/purchase-returns/bills?email=${TEST_EMAIL}`, { headers });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Fetched ${data.length} purchase returns`;
        });

        // 11. AI Clinical Drug Safety & Interaction Checker
        await runTest('POST /api/chatbot/check-interactions (AI Drug Safety)', async () => {
            const res = await fetch(`${BASE_URL}/api/chatbot/check-interactions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    medicines: ['Aspirin 75mg', 'Warfarin 5mg']
                })
            });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Risk Level: ${data.riskLevel || 'Analyzed'}, Interactions: ${data.interactions?.length || 0}`;
        });

        // 12. AI Demand Forecasting
        await runTest('GET /api/forecast (AI Demand Forecasting)', async () => {
            const res = await fetch(`${BASE_URL}/api/forecast?email=${TEST_EMAIL}&itemName=Starpress-XL 100mg Tablets`, { headers });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Engine: ${data.engine}, Recommended Restock: ${data.forecast?.recommendedRestock || 0}`;
        });

        // 13. AI Chatbot
        await runTest('POST /api/chatbot (AI Pharmacy Assistant)', async () => {
            const res = await fetch(`${BASE_URL}/api/chatbot`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: 'Do we have any Starpress-XL in stock?',
                    email: TEST_EMAIL
                })
            });
            if (res.status !== 200) throw new Error(`Status ${res.status}: ${await res.text()}`);
            const data = await res.json();
            return `Response preview: "${data.reply?.slice(0, 60)}..."`;
        });

    } finally {
        await mongoose.disconnect();
    }

    console.log('\n===============================================================');
    console.log('📊 TEST SUMMARY');
    console.log('===============================================================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`Total Tests : ${results.length}`);
    console.log(`Passed      : ${passed}`);
    console.log(`Failed      : ${failed}`);
    console.log(`Success Rate: ${Math.round((passed / results.length) * 100)}%\n`);

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

start().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
