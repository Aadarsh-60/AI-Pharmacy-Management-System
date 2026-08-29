import IdempotencyKey from '../models/IdempotencyKey.js';

export const withIdempotency = async (req, res, next) => {
  const idempotencyKey = req.header('Idempotency-Key');
  const email = req.user?.email || req.body?.email;

  // If no key is provided, just proceed normally (optional, but good for backward compatibility)
  if (!idempotencyKey) {
    return next();
  }

  if (!email) {
    return res.status(400).json({ message: 'Email is required for idempotency check' });
  }

  try {
    // 1. Check if the key already exists
    const existingKey = await IdempotencyKey.findOne({ key: idempotencyKey, email });

    if (existingKey) {
      // If it exists and has a response, return the cached response immediately
      if (existingKey.responseStatus && existingKey.responseBody) {
        console.log(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
        return res.status(existingKey.responseStatus).json(existingKey.responseBody);
      }
      
      // If it exists but no response yet, it means the previous request is still processing
      console.log(`[Idempotency] Concurrent request detected for key: ${idempotencyKey}`);
      return res.status(409).json({ message: 'A request with this Idempotency-Key is already being processed.' });
    }

    // 2. Register the new key
    const newKeyRecord = new IdempotencyKey({
      key: idempotencyKey,
      email: email,
      path: req.originalUrl || req.path
    });
    
    await newKeyRecord.save();
    console.log(`[Idempotency] Registered new key: ${idempotencyKey}`);

    // 3. Intercept the response to save it once the controller finishes
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful responses (2xx) to allow retries on validation errors
      if (res.statusCode >= 200 && res.statusCode < 300) {
        IdempotencyKey.findOneAndUpdate(
          { key: idempotencyKey, email },
          { 
            responseBody: body,
            responseStatus: res.statusCode 
          }
        ).catch(err => console.error('[Idempotency] Error updating key with response:', err));
      } else {
        // Delete the key if the request failed so the user can try again
        IdempotencyKey.findOneAndDelete({ key: idempotencyKey, email })
          .catch(err => console.error('[Idempotency] Error deleting failed key:', err));
      }

      // Call the original res.json
      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error('[Idempotency] Middleware error:', error);
    // If it's a duplicate key error from MongoDB (race condition on creation)
    if (error.code === 11000) {
        return res.status(409).json({ message: 'A request with this Idempotency-Key is already being processed.' });
    }
    // For other errors, proceed normally to not break the flow, just log it
    next();
  }
};
