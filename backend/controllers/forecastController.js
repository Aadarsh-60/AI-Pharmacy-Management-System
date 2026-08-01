import { GoogleGenAI } from '@google/genai';
import SaleBill from '../models/SaleBillModel.js';
import Inventory from '../models/Inventory.js';
import moment from 'moment';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateForecast = async (req, res) => {
  try {
    const { email } = req.query; // pharmacist email to filter

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured in backend/.env' });
    }

    // 1. Fetch Sales Data for the last 30 days
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const sales = await SaleBill.find({
        email: email,
        date: { $gte: thirtyDaysAgo }
    });

    // Aggregate sales by medicine
    const salesData = {};
    sales.forEach(bill => {
        bill.items.forEach(item => {
            if (!item.itemName) return;
            const name = item.itemName.toLowerCase().trim();
            if (!salesData[name]) {
                salesData[name] = { name: item.itemName, quantitySold: 0 };
            }
            salesData[name].quantitySold += item.quantity;
        });
    });

    // 2. Fetch current inventory for this email
    const inventory = await Inventory.find({ email: email });
    const inventoryData = {};
    inventory.forEach(item => {
        if (!item.medicineName) return;
        const name = item.medicineName.toLowerCase().trim();
        if (!inventoryData[name]) {
            inventoryData[name] = { name: item.medicineName, currentStock: 0 };
        }
        inventoryData[name].currentStock += item.currentQuantity;
    });

    // 3. Combine Data
    const combinedData = [];
    // Only process items that have either been sold or are in inventory
    const allNames = new Set([...Object.keys(salesData), ...Object.keys(inventoryData)]);
    
    allNames.forEach(name => {
        combinedData.push({
            medicineName: salesData[name]?.name || inventoryData[name]?.name,
            past30DaysSales: salesData[name]?.quantitySold || 0,
            currentStock: inventoryData[name]?.currentStock || 0
        });
    });

    if (combinedData.length === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    // To prevent token limits, if inventory is huge, slice to top 50 by sales
    combinedData.sort((a, b) => b.past30DaysSales - a.past30DaysSales);
    const topData = combinedData.slice(0, 50);

    // 4. Send to Gemini for Forecasting
    const systemInstruction = `
You are an expert AI demand forecasting system for a pharmacy.
Analyze the provided JSON array containing medicines, their past 30 days sales, and current stock.
Your task is to predict the demand for the next 30 days and suggest an auto-reorder quantity.
Consider a safety stock (buffer) when calculating reorder quantities. 
Only suggest a reorder quantity > 0 if the current stock is not enough to meet the forecasted demand + safety stock.

You MUST respond strictly with a valid JSON array of objects. Do not include markdown code blocks like \`\`\`json or any other text.
The JSON array should have the following format:
[
  {
    "medicineName": "string",
    "currentStock": number,
    "past30DaysSales": number,
    "forecastedNext30DaysDemand": number,
    "suggestedReorderQuantity": number,
    "reason": "Short explanation (max 10 words)"
  }
]
`;

    const promptText = JSON.stringify(topData, null, 2);

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
            { role: 'user', parts: [{ text: promptText }] }
        ],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2, // Low temperature for consistent JSON output
        }
    });

    let resultText = response.text.trim();
    // Clean up potential markdown formatting if AI disobeys
    if (resultText.startsWith('\`\`\`json')) {
        resultText = resultText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    }

    const forecastJSON = JSON.parse(resultText);

    res.status(200).json({ success: true, data: forecastJSON });

  } catch (error) {
    console.error('Forecast Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate forecast', error: error.message });
  }
};
