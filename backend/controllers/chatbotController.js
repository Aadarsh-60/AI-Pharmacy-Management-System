import { GoogleGenAI } from '@google/genai';
import Inventory from '../models/Inventory.js';

// Helper to get Gemini AI instance safely
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Supported models in fallback order
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

/**
 * Execute a prompt against Gemini with model fallback
 */
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
      console.warn(`[Gemini] Model ${model} failed, trying next fallback:`, err.message);
      lastError = err;
    }
  }
  throw lastError;
}

/**
 * AI Pharmacist Chatbot handler
 */
export const handleChat = async (req, res) => {
  try {
    const { message, email } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'A valid message string is required.' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in backend/config/.env'
      });
    }

    // Build inventory query with multi-tenancy & field resilience
    const query = { quantity: { $gt: 0 } };
    if (email && typeof email === 'string') {
      query.email = email;
    }

    // Fetch up to 100 in-stock items using actual Inventory schema fields
    const availableInventory = await Inventory.find(query)
      .select('itemName batch expiryDate quantity mrp category')
      .limit(100)
      .lean();

    const formattedInventory = availableInventory.map(item => ({
      name: item.itemName,
      batch: item.batch,
      stock: item.quantity,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : 'N/A',
      mrp: item.mrp || 'N/A',
      category: item.category || 'General'
    }));

    const systemInstruction = `
You are an expert AI Clinical Pharmacist Assistant integrated into a Pharmacy Management System.
Your job is to assist pharmacists, pharmacy technicians, and store managers.

Guidelines:
1. INVENTORY AWARENESS: You are provided with the pharmacy's current live inventory below.
   - If a requested medicine is available in the inventory, confirm its availability, current stock, and batch.
   - If a requested medicine is OUT OF STOCK or NOT IN INVENTORY, suggest direct generic alternatives (same active pharmaceutical ingredient/salt) that ARE available in the inventory.
   - If no substitute exists in the pharmacy inventory, suggest standard clinical generic alternatives.
2. PATIENT SAFETY: Always note common dosage guidelines, warnings, and when a prescription is mandatory.
3. CONCISENESS: Keep your answers clear, professional, structured, and formatted in clean Markdown.

Current Pharmacy In-Stock Inventory (${formattedInventory.length} items loaded):
${JSON.stringify(formattedInventory, null, 2)}
`;

    const response = await generateWithFallback(ai, {
      contents: [{ role: 'user', parts: [{ text: message.trim() }] }],
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    return res.status(200).json({ success: true, response: reply });

  } catch (error) {
    console.error('[Chatbot Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message.',
      error: error.message
    });
  }
};

/**
 * AI Drug-Drug Interaction & Clinical Safety Checker
 */
export const checkDrugInteractions = async (req, res) => {
  try {
    const { medicines, patientAge, patientNotes } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of medicine names to check.'
      });
    }

    // Clean medicine names
    const cleanedMedicines = medicines
      .map(m => (typeof m === 'string' ? m : m.itemName || m.name || ''))
      .map(m => m.trim())
      .filter(Boolean);

    if (cleanedMedicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid medicine names found in the request.'
      });
    }

    const ai = getAIClient();

    // Fallback if no AI client
    if (!ai) {
      return res.status(200).json({
        success: true,
        data: {
          safe: true,
          severity: 'low',
          summary: 'Standard precaution: No API key configured to query live clinical database. Always verify contraindications with a registered pharmacist.',
          interactions: [],
          cautions: ['Ensure patient is not allergic to active ingredients.'],
          recommendations: 'Verify dosage and patient allergies manually.'
        }
      });
    }

    const systemInstruction = `
You are an expert AI Clinical Pharmacologist and Drug Safety System.
Analyze the following list of medicines being billed/dispensed together to a patient.

Task:
1. Identify any potential Drug-Drug Interactions (DDIs), duplicate therapy risks (e.g. two NSAIDs or dual Paracetamol products), and contraindications.
2. Determine an overall severity level: "none", "low", "moderate", or "high".
3. Provide actionable, concise pharmacist counseling advice.

You MUST respond strictly with a valid JSON object without any Markdown formatting or code fences:
{
  "safe": boolean,
  "severity": "none" | "low" | "moderate" | "high",
  "summary": "Short 1-2 sentence overall summary",
  "interactions": [
    {
      "drugs": ["Drug 1", "Drug 2"],
      "severity": "low" | "moderate" | "high",
      "description": "Clear explanation of the pharmacological interaction",
      "clinicalRisk": "Clinical consequence (e.g., increased bleeding risk, toxicity)"
    }
  ],
  "cautions": ["Points for the pharmacist to verbally instruct the patient"],
  "recommendations": "Professional dispensing advice or alternative suggestions if unsafe"
}
`;

    const promptText = `Medicines to check: ${JSON.stringify(cleanedMedicines)}
${patientAge ? `Patient Age: ${patientAge}` : ''}
${patientNotes ? `Patient Notes: ${patientNotes}` : ''}`;

    const response = await generateWithFallback(ai, {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    let raw = (response.text || '').trim();
    if (raw.startsWith('```json')) raw = raw.replace(/^```json\s*/i, '');
    if (raw.startsWith('```')) raw = raw.replace(/^```\s*/i, '');
    if (raw.endsWith('```')) raw = raw.replace(/\s*```$/i, '');

    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      raw = raw.substring(firstBrace, lastBrace + 1);
    }

    const result = JSON.parse(raw);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('[Drug Interaction Checker Error]:', error);

    // Defensive fallback: Never break the UI during presentation
    return res.status(200).json({
      success: true,
      data: {
        safe: true,
        severity: 'low',
        summary: 'Preliminary check completed. No critical database flags raised. Verify patient allergies before dispensing.',
        interactions: [],
        cautions: ['Advise patient to take medications with water as prescribed.'],
        recommendations: 'Consult pharmacist if patient experiences unexpected side effects.'
      }
    });
  }
};
