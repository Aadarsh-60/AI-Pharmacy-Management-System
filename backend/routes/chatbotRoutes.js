import express from 'express';
import { handleChat, checkDrugInteractions } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/', handleChat);
router.post('/check-interactions', checkDrugInteractions);

export default router;
