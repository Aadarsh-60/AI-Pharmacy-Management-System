import { GoogleGenAI } from '@google/genai';
import Inventory from '../models/Inventory.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured in backend/.env' });
    }

    // Fetch current available inventory to give context to the AI
    const availableInventory = await Inventory.find({ currentQuantity: { $gt: 0 } }).select('medicineName batchNumber expiryDate currentQuantity mrp -_id');

    // Create a context prompt
    const systemInstruction = `
You are a helpful, professional, and knowledgeable AI assistant for a pharmacy management system.
Your goal is to assist the pharmacist. 
If a requested medicine is out of stock or not mentioned, suggest generic substitutes or alternatives based on the active ingredients.
Always be concise and prioritize patient safety.

Here is the current available inventory of the pharmacy (JSON format):
${JSON.stringify(availableInventory, null, 2)}

If the pharmacist asks for a medicine and it is in the inventory, let them know it is available. 
If it is NOT in the inventory, check if there is an alternative available in the inventory and suggest it. If no alternative is in the inventory, suggest a general generic alternative.
Keep your responses professional, concise, and formatted in Markdown.
`;

    console.log("Using model: gemini-3.5-flash");
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
            { role: 'user', parts: [{ text: message }] }
        ],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.3,
        }
    });

    res.status(200).json({ success: true, response: response.text });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process chat message' });
  }
};
