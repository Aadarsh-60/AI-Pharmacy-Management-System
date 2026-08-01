import express from 'express';
import { generateForecast } from '../controllers/forecastController.js';

const router = express.Router();

router.get('/', generateForecast);

export default router;
