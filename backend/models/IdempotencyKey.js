import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  responseStatus: {
    type: Number,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete after 24 hours (86400 seconds)
  }
});

const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencyKeySchema);
export default IdempotencyKey;
