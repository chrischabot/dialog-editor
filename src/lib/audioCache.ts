/**
 * IndexedDB Audio Cache
 *
 * Persists generated audio blobs with 48-hour expiration.
 */

const DB_NAME = 'dialogue-director-audio-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio';
const EXPIRATION_MS = 48 * 60 * 60 * 1000; // 48 hours

interface CacheEntry {
  key: string;
  blob: Blob;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function resetDbPromise() {
  dbPromise = null;
}

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
      resetDbPromise();
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onblocked = () => {
      const error = new Error('IndexedDB open request was blocked (another tab may be holding an old connection)');
      console.warn(error.message);
      resetDbPromise();
      reject(error);
    };

    request.onerror = () => {
      console.error('Failed to open audio cache DB:', request.error);
      resetDbPromise();
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;

      // If another tab upgrades the DB, close our connection so future calls can reopen.
      db.onversionchange = () => {
        try {
          db.close();
        } finally {
          resetDbPromise();
        }
      };

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Get cached audio by key
 */
export async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > EXPIRATION_MS) {
          // Delete expired entry asynchronously
          void deleteCachedAudio(key);
          resolve(null);
          return;
        }

        resolve(entry.blob);
      };

      request.onerror = () => {
        console.error('Failed to get cached audio:', request.error);
        resolve(null);
      };
    });
  } catch (error) {
    console.error('Audio cache get error:', error);
    return null;
  }
}

/**
 * Store audio in cache
 */
export async function setCachedAudio(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const entry: CacheEntry = {
        key,
        blob,
        timestamp: Date.now(),
      };

      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to cache audio:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Audio cache set error:', error);
  }
}

/**
 * Delete a specific cached audio entry
 */
export async function deleteCachedAudio(key: string): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to delete cached audio:', request.error);
        resolve();
      };
    });
  } catch (error) {
    console.error('Audio cache delete error:', error);
  }
}

/**
 * Clean up expired entries from the cache
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const db = await openDB();
    const expiredBefore = Date.now() - EXPIRATION_MS;
    let deletedCount = 0;

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(expiredBefore);

      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        console.error('Failed to cleanup cache:', request.error);
        resolve(deletedCount);
      };
    });
  } catch (error) {
    console.error('Audio cache cleanup error:', error);
    return 0;
  }
}

/**
 * Clear all cached audio
 */
export async function clearAllCachedAudio(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to clear audio cache:', request.error);
        resolve();
      };
    });
  } catch (error) {
    console.error('Audio cache clear error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ count: number; totalSize: number }> {
  try {
    const db = await openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        const count = entries.length;
        const totalSize = entries.reduce((sum, entry) => sum + entry.blob.size, 0);
        resolve({ count, totalSize });
      };

      request.onerror = () => {
        console.error('Failed to get cache stats:', request.error);
        resolve({ count: 0, totalSize: 0 });
      };
    });
  } catch (error) {
    console.error('Audio cache stats error:', error);
    return { count: 0, totalSize: 0 };
  }
}
