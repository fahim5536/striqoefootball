import { io } from "socket.io-client";
import { offlineSync } from "./offlineSync";

export const socket = io(window.location.origin, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('connect', () => {

  const token = localStorage.getItem('striqo_token');
  if (token) {
    socket.emit('authenticate', { token });
  }
});

socket.on('disconnect', (reason) => {

  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

// Heartbeat
setInterval(() => {
  if (socket.connected) {
    socket.emit('heartbeat');
  }
}, 25000);

const getHeaders = () => {
  const token = localStorage.getItem('striqo_token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": "Bearer " + token } : {})
  };
};

export const api = {
  get: async (endpoint: string) => {
    // Try to get from cache first if offline
    if (!navigator.onLine) {
      const cached = await offlineSync.getCache(endpoint);
      if (cached) return cached;
    }

    try {
      const res = await fetch(`/api${endpoint}`, { headers: getHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      // Update cache
      offlineSync.setCache(endpoint, data);
      
      return data;
    } catch (err) {
      if (!navigator.onLine) {
        const cached = await offlineSync.getCache(endpoint);
        if (cached) return cached;
      }
      throw err;
    }
  },
  
  post: async (endpoint: string, data: any) => {
    if (!navigator.onLine) {
      await offlineSync.enqueueRequest(endpoint, 'POST', data);
      return { success: true, queued: true, message: "You are offline. Request queued for sync." };
    }

    try {
      const res = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch (err: any) {
      // Auto queue on network failure
      if (err.message === 'Failed to fetch') {
        await offlineSync.enqueueRequest(endpoint, 'POST', data);
        return { success: true, queued: true, message: "Network error. Request queued for sync." };
      }
      throw err;
    }
  },
  
  put: async (endpoint: string, data: any) => {
    if (!navigator.onLine) {
      await offlineSync.enqueueRequest(endpoint, 'PUT', data);
      return { success: true, queued: true, message: "You are offline. Request queued for sync." };
    }

    try {
      const res = await fetch(`/api${endpoint}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        await offlineSync.enqueueRequest(endpoint, 'PUT', data);
        return { success: true, queued: true, message: "Network error. Request queued for sync." };
      }
      throw err;
    }
  },
  
  delete: async (endpoint: string) => {
    if (!navigator.onLine) {
      await offlineSync.enqueueRequest(endpoint, 'DELETE');
      return { success: true, queued: true, message: "You are offline. Request queued for sync." };
    }

    try {
      const res = await fetch(`/api${endpoint}`, { method: "DELETE", headers: getHeaders() });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        await offlineSync.enqueueRequest(endpoint, 'DELETE');
        return { success: true, queued: true, message: "Network error. Request queued for sync." };
      }
      throw err;
    }
  }
};
