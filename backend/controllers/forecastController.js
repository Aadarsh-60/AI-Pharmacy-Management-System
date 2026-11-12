import { GoogleGenAI } from '@google/genai';
import SaleBill from '../models/SaleBillModel.js';
import Inventory from '../models/Inventory.js';
import moment from 'moment';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

async function generateWithFallback(ai, options) {
  let lastError = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...options,
        model
      });
      return response;
    } catch (err) {
      console.warn(`[Forecast] Model ${model} failed, trying next fallback:`, err.message);
      lastError = err;
    }
  }
  throw lastError;
}

/**
 * Statistical Time-Series & Safety Stock Heuristic (Fallback & Baseline)
 */
function computeStatisticalForecast(combinedData) {
  return combinedData.map(item => {
    // Lead time demand + safety buffer calculation
    const dailyDemand = item.past30DaysSales / 30;
    const forecastedDemand = Math.max(1, Math.round(dailyDemand * 30 * 1.05)); // 5% growth factor
    const safetyBuffer = Math.max(2, Math.round(forecastedDemand * 0.25)); // 25% safety stock
    const needed = (forecastedDemand + safetyBuffer) - item.currentStock;
    const suggestedReorder = Math.max(0, Math.round(needed));

    let reason = 'Balanced inventory level';
    if (item.currentStock === 0) {
      reason = 'CRITICAL: Stockout detected';
    } else if (suggestedReorder > item.currentStock) {
      reason = 'High velocity reorder needed';
    } else if (item.currentStock > forecastedDemand * 2) {
      reason = 'Adequate reserve stock';
    }

    return {
      medicineName: item.medicineName,
      currentStock: item.currentStock,
      past30DaysSales: item.past30DaysSales,
      forecastedNext30DaysDemand: forecastedDemand,
      suggestedReorderQuantity: suggestedReorder,
      reason
    };
  });
}

export const generateForecast = async (req, res) => {
  try {
    const { email } = req.query;

    // 1. Fetch Sales Data for the last 30 days
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const salesQuery = { date: { $gte: thirtyDaysAgo } };
    if (email) salesQuery.email = email;

    const sales = await SaleBill.find(salesQuery).lean();

    // Aggregate sales by medicine name (case-insensitive)
    const salesData = {};
    sales.forEach(bill => {
      if (!Array.isArray(bill.items)) return;
      bill.items.forEach(item => {
        const rawName = item.itemName || item.name || item.medicineName;
        if (!rawName) return;
        const key = rawName.toLowerCase().trim();
        if (!salesData[key]) {
          salesData[key] = { name: rawName, quantitySold: 0 };
        }
        salesData[key].quantitySold += (Number(item.quantity) || 0);
      });
    });

    // 2. Fetch inventory
    const inventoryQuery = {};
    if (email) inventoryQuery.email = email;
    const inventory = await Inventory.find(inventoryQuery).lean();

    // Aggregate inventory by medicine name
    const inventoryData = {};
    inventory.forEach(item => {
      const rawName = item.itemName || item.medicineName;
      if (!rawName) return;
      const key = rawName.toLowerCase().trim();
      if (!inventoryData[key]) {
        inventoryData[key] = { name: rawName, currentStock: 0 };
      }
      inventoryData[key].currentStock += (Number(item.quantity ?? item.currentQuantity) || 0);
    });

    // 3. Combine Sales + Inventory Data
    const allKeys = new Set([...Object.keys(salesData), ...Object.keys(inventoryData)]);
    const combinedData = [];

    allKeys.forEach(key => {
      const name = salesData[key]?.name || inventoryData[key]?.name;
      combinedData.push({
        medicineName: name,
        past30DaysSales: salesData[key]?.quantitySold || 0,
        currentStock: inventoryData[key]?.currentStock || 0
      });
    });

    // If no sales and no inventory found, return empty set
    if (combinedData.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Sort by sales descending, limit top 50 to optimize response latency
    combinedData.sort((a, b) => b.past30DaysSales - a.past30DaysSales);
    const topData = combinedData.slice(0, 50);

    const ai = getAIClient();

    // If Gemini API is not configured, seamlessly return statistical forecast
    if (!ai) {
      console.log('[Forecast] Gemini API not configured, using statistical baseline.');
      return res.status(200).json({
        success: true,
        data: computeStatisticalForecast(topData),
        engine: 'statistical-fallback'
      });
    }

    // 4. Send to Gemini for intelligent ML Demand Forecasting
    const systemInstruction = `
You are an expert AI demand forecasting system for a pharmaceutical supply chain.
Analyze the provided JSON array containing medicines, their past 30 days sales, and current stock.

Predict:
1. Demand for the next 30 days (considering seasonal trends, disease patterns, and velocity).
2. Suggested reorder quantity with an optimal safety buffer (only > 0 if current stock is insufficient).
3. A short, professional explanation (max 10 words).

You MUST respond strictly with a valid JSON array of objects. Do not wrap in markdown or backticks:
[
  {
    "medicineName": "string",
    "currentStock": number,
    "past30DaysSales": number,
    "forecastedNext30DaysDemand": number,
    "suggestedReorderQuantity": number,
    "reason": "string"
  }
]
`;

    try {
      const response = await generateWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(topData, null, 2) }] }],
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      let raw = (response.text || '').trim();
      if (raw.startsWith('```json')) raw = raw.replace(/^```json\s*/i, '');
      if (raw.startsWith('```')) raw = raw.replace(/^```\s*/i, '');
      if (raw.endsWith('```')) raw = raw.replace(/\s*```$/i, '');

      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        raw = raw.substring(start, end + 1);
      }

      const parsedForecast = JSON.parse(raw);
      return res.status(200).json({
        success: true,
        data: parsedForecast,
        engine: 'gemini-ai'
      });

    } catch (aiError) {
      console.warn('[Forecast AI Error, using statistical fallback]:', aiError.message);
      return res.status(200).json({
        success: true,
        data: computeStatisticalForecast(topData),
        engine: 'statistical-fallback'
      });
    }

  } catch (error) {
    console.error('Forecast Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate forecast',
      error: error.message
    });
  }
};
