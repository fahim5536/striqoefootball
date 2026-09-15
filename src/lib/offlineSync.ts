import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface StriqoDB extends DBSchema {
  syncQueue: {
    key: string;
    value: {
      id: string;
      endpoint: string;
      method: 'POST' | 'PUT' | 'DELETE';
      data?: any;
      timestamp: number;
      retries: number;
      status: 'pending' | 'failed' | 'processing';
      error?: string;
    };
    indexes: { 'by-timestamp': number, 'by-status': string };
  };
  cacheStore: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      version: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'striqo-offline-db';
const DB_VERSION = 1;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

class OfflineSyncManager {
  private dbPromise: Promise<IDBPDatabase<StriqoDB>>;
  private syncInProgress = false;

  constructor() {
    this.dbPromise = openDB<StriqoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('by-timestamp', 'timestamp');
          queueStore.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('cacheStore')) {
          const cacheStore = db.createObjectStore('cacheStore', { keyPath: 'key' });
          cacheStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });

    this.setupListeners();
    this.cleanupOldCache();
  }

  private setupListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {

        this.processSyncQueue();
      });
    }
  }

  // === CACHE MANAGEMENT ===

  async getCache<T>(key: string): Promise<T | null> {
    const db = await this.dbPromise;
    const entry = await db.get('cacheStore', key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      await db.delete('cacheStore', key);
      return null;
    }
    return entry.data as T;
  }

  async setCache(key: string, data: any) {
    const db = await this.dbPromise;
    await db.put('cacheStore', {
      key,
      data,
      timestamp: Date.now(),
      version: 1
    });
  }

  async cleanupOldCache() {
    const db = await this.dbPromise;
    const tx = db.transaction('cacheStore', 'readwrite');
    const index = tx.store.index('by-timestamp');
    let cursor = await index.openCursor();
    
    const expiryTime = Date.now() - CACHE_EXPIRY;
    while (cursor) {
      if (cursor.value.timestamp < expiryTime) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  // === BACKGROUND SYNC QUEUE ===

  async enqueueRequest(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data?: any) {
    const db = await this.dbPromise;
    
    // Deduplication logic for identical requests
    const tx = db.transaction('syncQueue', 'readwrite');
    const existing = await tx.store.getAll();
    const isDuplicate = existing.some(
      req => req.endpoint === endpoint && req.method === method && JSON.stringify(req.data) === JSON.stringify(data) && req.status === 'pending'
    );
    
    if (isDuplicate) {

      return;
    }

    const id = crypto.randomUUID();
    await tx.store.put({
      id,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
    await tx.done;

    // Register Background Sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-striqo-api');

      } catch (err) {
        console.error('[OfflineSync] Background Sync registration failed:', err);
      }
    }

    // Try processing immediately just in case
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  async getSyncQueue() {
    const db = await this.dbPromise;
    return db.getAllFromIndex('syncQueue', 'by-timestamp');
  }

  async processSyncQueue() {
    if (this.syncInProgress || !navigator.onLine) return;
    this.syncInProgress = true;

    const db = await this.dbPromise;
    const tx = db.transaction('syncQueue', 'readwrite');
    const queue = await tx.store.getAll();
    await tx.done;

    for (const req of queue) {
      if (req.status === 'processing') continue;
      
      try {
        // Mark as processing
        const txUpdate = db.transaction('syncQueue', 'readwrite');
        await txUpdate.store.put({ ...req, status: 'processing' });
        await txUpdate.done;

        // Make API call
        const token = localStorage.getItem('striqo_token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const response = await fetch(`/api${req.endpoint}`, {
          method: req.method,
          headers,
          body: req.data ? JSON.stringify(req.data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Success - remove from queue
        const txSuccess = db.transaction('syncQueue', 'readwrite');
        await txSuccess.store.delete(req.id);
        await txSuccess.done;
        

        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('sync-success', { detail: { id: req.id, endpoint: req.endpoint } }));

      } catch (err: any) {
        console.error(`[OfflineSync] Sync failed for ${req.id}:`, err);
        
        // Conflict resolution strategy: After 3 retries, mark as failed and keep for user review
        const retries = req.retries + 1;
        const status = retries >= 3 ? 'failed' : 'pending';
        
        const txFail = db.transaction('syncQueue', 'readwrite');
        await txFail.store.put({ 
          ...req, 
          retries, 
          status,
          error: err.message
        });
        await txFail.done;

        if (status === 'failed') {
          window.dispatchEvent(new CustomEvent('sync-failed', { detail: { id: req.id, endpoint: req.endpoint, error: err.message } }));
        }
      }
    }

    this.syncInProgress = false;
  }
  
  async clearFailedSyncs() {
    const db = await this.dbPromise;
    const tx = db.transaction('syncQueue', 'readwrite');
    const index = tx.store.index('by-status');
    let cursor = await index.openCursor(IDBKeyRange.only('failed'));
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}

export const offlineSync = new OfflineSyncManager();
