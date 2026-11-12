import InventoryLock from '../models/InventoryLock.js';

const LOCK_DURATION_MINUTES = 20;

function escapeRegex(str) {
  return (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildBatchQuery(batchStr) {
  if (!batchStr) return { $regex: /.*/ };
  const trimmed = batchStr.trim();
  const escaped = escapeRegex(trimmed);
  const alphanumeric = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (alphanumeric.length > 0) {
    const flexible = alphanumeric.split('').join('[-_\\s/]?');
    return { $regex: new RegExp(`^(${escaped}|${flexible})$`, 'i') };
  }
  return { $regex: new RegExp(`^${escaped}$`, 'i') };
}

// Lock inventory for a specific item/batch/user/type
export async function lockInventory({ itemName, batch, quantity, lockedBy, lockType, email }) {
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
  const lock = new InventoryLock({
    itemName,
    batch,
    quantity,
    lockedBy,
    lockType,
    email,
    expiresAt
  });
  await lock.save();
  return lock;
}

// Unlock inventory for a specific lock (by id or by params)
export async function unlockInventory({ itemName, batch, lockedBy, lockType, email }) {
  const batchRegex = buildBatchQuery(batch);
  const itemRegex = itemName ? new RegExp(`^${escapeRegex(itemName.trim())}$`, 'i') : { $regex: /.*/ };
  await InventoryLock.deleteMany({ itemName: itemRegex, batch: batchRegex, lockedBy, lockType, email });
}

// Check if enough inventory is available (considering locks), and lock if possible
export async function checkAndLockInventory({ itemName, batch, quantity, lockedBy, lockType, email, InventoryModel }) {
  const itemRegex = new RegExp(`^${escapeRegex((itemName || '').trim())}$`, 'i');
  const batchRegex = buildBatchQuery(batch);

  // Get current inventory with case-insensitive and flexible batch matching
  const inventoryItem = await InventoryModel.findOne({
    itemName: itemRegex,
    batch: batchRegex,
    email
  });
  if (!inventoryItem) throw new Error(`Inventory item not found for ${itemName} (Batch: ${batch})`);

  const canonicalBatch = inventoryItem.batch;
  const canonicalItemName = inventoryItem.itemName;

  // Sum all locked quantities for this canonical item/batch/email
  const activeLocks = await InventoryLock.aggregate([
    { $match: { itemName: canonicalItemName, batch: canonicalBatch, email, expiresAt: { $gt: new Date() } } },
    { $group: { _id: null, totalLocked: { $sum: "$quantity" } } }
  ]);
  const totalLocked = activeLocks[0]?.totalLocked || 0;

  const available = inventoryItem.quantity - totalLocked;
  if (available < quantity) throw new Error(`Insufficient available quantity (locked: ${totalLocked}, available: ${available})`);

  // Lock the quantity with canonical identifiers
  return lockInventory({ itemName: canonicalItemName, batch: canonicalBatch, quantity, lockedBy, lockType, email });
}

// Cleanup expired locks (optional, as TTL index will auto-remove)
export async function cleanupExpiredLocks() {
  await InventoryLock.deleteMany({ expiresAt: { $lte: new Date() } });
} 