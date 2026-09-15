import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudOff, Cloud, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { offlineSync } from '../lib/offlineSync';

export default function SyncStatus() {
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');

  const loadQueue = async () => {
    const queue = await offlineSync.getSyncQueue();
    setSyncQueue(queue);
    if (queue.length > 0 && !showStatus) {
      setShowStatus(true);
    }
  };

  useEffect(() => {
    loadQueue();

    const handleOnline = () => {
      setSyncing(true);
      setMessage('Syncing pending requests...');
      setSyncStatus('idle');
      // Sync process will be handled by OfflineSyncManager, we just watch the queue
    };

    const handleOffline = () => {
      loadQueue();
    };

    const handleSyncSuccess = (e: any) => {
      setSyncing(false);
      setSyncStatus('success');
      setMessage(`Successfully synced: ${e.detail.endpoint}`);
      loadQueue();
      
      setTimeout(() => {
        setSyncStatus('idle');
        if (syncQueue.length === 0) {
          setShowStatus(false);
        }
      }, 3000);
    };

    const handleSyncFailed = (e: any) => {
      setSyncing(false);
      setSyncStatus('failed');
      setMessage(`Failed to sync: ${e.detail.error}`);
      loadQueue();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync-success', handleSyncSuccess);
    window.addEventListener('sync-failed', handleSyncFailed);

    // Poll queue occasionally if offline
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        loadQueue();
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-success', handleSyncSuccess);
      window.removeEventListener('sync-failed', handleSyncFailed);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      offlineSync.processSyncQueue();
      setSyncing(true);
      setMessage('Retrying sync...');
    } else {
      setMessage('Cannot retry while offline');
      setSyncStatus('failed');
    }
  };

  const handleClear = async () => {
    await offlineSync.clearFailedSyncs();
    loadQueue();
    if (syncQueue.length === 0) setShowStatus(false);
  };

  if (!showStatus && syncQueue.length === 0) return null;

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: -50 }}
          className="fixed bottom-4 left-4 z-50 rounded-lg shadow-lg overflow-hidden border border-white/10"
          style={{ backdropFilter: 'blur(10px)', background: 'rgba(10, 10, 31, 0.9)', minWidth: '300px' }}
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {syncing ? (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : syncStatus === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : syncStatus === 'failed' ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : !navigator.onLine ? (
                <CloudOff className="w-4 h-4 text-yellow-400" />
              ) : (
                <Cloud className="w-4 h-4 text-gray-400" />
              )}
              <h3 className="font-bold text-sm text-white">Sync Status</h3>
            </div>
            <button 
              onClick={() => setShowStatus(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-xs text-gray-300 mb-2">
              {message || (
                syncQueue.length > 0 
                  ? `${syncQueue.length} pending request${syncQueue.length > 1 ? 's' : ''}`
                  : 'All data synced'
              )}
            </p>
            
            {syncQueue.length > 0 && (
              <div className="space-y-2 mt-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {syncQueue.map((req) => (
                  <div key={req.id} className="text-xs flex items-center justify-between bg-white/5 p-2 rounded">
                    <span className="truncate max-w-[150px] font-mono text-gray-400">
                      {req.method} {req.endpoint}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      req.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      req.status === 'processing' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 flex justify-end space-x-2">
              {syncQueue.some(r => r.status === 'failed') && (
                <button 
                  onClick={handleClear}
                  className="px-3 py-1 text-xs text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors"
                >
                  Clear Failed
                </button>
              )}
              {navigator.onLine && syncQueue.length > 0 && !syncing && (
                <button 
                  onClick={handleRetry}
                  className="px-3 py-1 text-xs text-cyan-400 border border-cyan-400/30 rounded hover:bg-cyan-400/10 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Sync</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
