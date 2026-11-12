import express from 'express';
import multer from 'multer';
import { ocrBillUpload } from '../controllers/ocrBillController.js';

const router = express.Router();

// Use in-memory storage for speed, security, and zero disk leaks
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum
  },
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'application/pdf'
    ];
    if (allowedMime.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) or PDF documents are supported for OCR.'));
    }
  }
});

// POST /api/ocr-bill
router.post('/', upload.single('file'), ocrBillUpload);

export default router;
