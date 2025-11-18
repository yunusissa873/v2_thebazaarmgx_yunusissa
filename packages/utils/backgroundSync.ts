/**
 * Background Sync Utilities
 * 
 * Handles syncing cart and wishlist data when coming back online
 * Uses localStorage to queue operations that need to sync
 */

interface SyncQueueItem {
  type: 'cart' | 'wishlist';
  action: 'add' | 'remove' | 'update';
  data: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'bazaar_sync_queue';

/**
 * Add an item to the sync queue
 */
export function queueSyncOperation(
  type: 'cart' | 'wishlist',
  action: 'add' | 'remove' | 'update',
  data: any
): void {
  try {
    const queue = getSyncQueue();
    const item: SyncQueueItem = {
      type,
      action,
      data,
      timestamp: Date.now(),
    };
    queue.push(item);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to queue sync operation:', error);
  }
}

/**
 * Get all queued sync operations
 */
export function getSyncQueue(): SyncQueueItem[] {
  try {
    const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return [];
    return JSON.parse(queueJson);
  } catch (error) {
    console.error('Failed to get sync queue:', error);
    return [];
  }
}

/**
 * Clear the sync queue
 */
export function clearSyncQueue(): void {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear sync queue:', error);
  }
}

/**
 * Process sync queue when coming back online
 * This should be called when the app detects it's back online
 */
export async function processSyncQueue(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Still offline, cannot process sync queue');
    return;
  }

  const queue = getSyncQueue();
  if (queue.length === 0) {
    console.log('No sync operations to process');
    return;
  }

  console.log(`Processing ${queue.length} queued sync operations...`);

  try {
    // TODO: When Supabase is integrated, process each queue item
    // For now, we just log them and clear the queue
    // In production, you would:
    // 1. Call Supabase APIs for each operation
    // 2. Handle errors and retry failures
    // 3. Remove successful operations from queue
    // 4. Keep failed operations for retry later

    queue.forEach((item) => {
      console.log(`Processing ${item.type} ${item.action}:`, item.data);
      // Simulate API call
      // await syncToSupabase(item);
    });

    // Clear queue after processing
    clearSyncQueue();
    console.log('Sync queue processed and cleared');
  } catch (error) {
    console.error('Error processing sync queue:', error);
    // Keep queue items for retry later
  }
}

/**
 * Setup automatic sync when coming back online
 */
export function setupBackgroundSync(): void {
  window.addEventListener('online', () => {
    console.log('Connection restored, processing sync queue...');
    processSyncQueue();
  });

  // Also try to process on page load if online
  if (navigator.onLine) {
    processSyncQueue();
  }
}

