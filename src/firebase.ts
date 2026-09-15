import { api, socket } from './lib/api';

export const db = "postgres";
export const auth = { currentUser: null };

export function collection(db: any, path: string) { return { path }; }
export function doc(db: any, ...pathSegments: string[]) {
  const path = pathSegments.slice(0, -1).join('/');
  const id = pathSegments[pathSegments.length - 1];
  return { path, id };
}

export async function getDocs(queryObj: any) {
  const data = await api.get(`/${queryObj.path}`);
  return {
    docs: data.map((d: any) => ({
      id: d.id,
      data: () => d
    })),
    forEach: (cb: any) => {
      data.forEach((d: any) => cb({ id: d.id, data: () => d }));
    }
  };
}

export async function addDoc(collectionPath: any, data: any) {
  const path = typeof collectionPath === 'string' ? collectionPath : collectionPath.path;
  const result = await api.post(`/${path}`, data);
  return { id: result.id };
}

export async function updateDoc(docRef: { path: string, id: string }, data: any) {
  await api.put(`/${docRef.path}/${docRef.id}`, data);
}

export async function deleteDoc(docRef: { path: string, id: string }) {
  await api.delete(`/${docRef.path}/${docRef.id}`);
}

export function onSnapshot(queryObj: any, callback: any) {
  // initial load
  api.get(`/${queryObj.path}`).then(data => {
    callback({
      docs: data.map((d: any) => ({ id: d.id, data: () => d }))
    });
  }).catch(() => {});

  // socket io updates
  const handleUpdate = (data: any) => {
    callback({
      docs: data.map((d: any) => ({ id: d.id, data: () => d }))
    });
  };
  socket.on(queryObj.path, handleUpdate);

  return () => {
    socket.off(queryObj.path, handleUpdate);
  };
}

export function query(collectionPath: any, ...args: any[]) {
  const path = typeof collectionPath === 'string' ? collectionPath : collectionPath.path;
  // For simplicity, just store the path and args to be handled in the API or getDocs
  return { path, args };
}
export function orderBy(field: string, direction: string) { return { type: 'orderBy', field, direction }; }
export function where(field: string, op: string, value: any) { return { type: 'where', field, op, value }; }
export function limit(num: number) { return { type: 'limit', num }; }

export async function signInWithEmailAndPassword(auth: any, email: string, pass: string) {
  const data = await api.post('/auth/login', { email, password: pass });
  localStorage.setItem('striqo_token', data.token);
  localStorage.setItem('striqo_user', JSON.stringify(data.user));
  return { user: data.user };
}
export async function createUserWithEmailAndPassword(auth: any, email: string, pass: string) {
  const data = await api.post('/auth/register', { email, password: pass, username: email.split('@')[0] });
  localStorage.setItem('striqo_token', data.token);
  localStorage.setItem('striqo_user', JSON.stringify(data.user));
  return { user: data.user };
}
export async function signOut(auth: any) {
  localStorage.removeItem('striqo_token');
  localStorage.removeItem('striqo_user');
  return true;
}
export const GoogleAuthProvider = class {};
export async function signInWithPopup(auth: any, provider: any) {
  return { user: { email: "user@striqo.com" } };
}


export async function getDoc(docRef: { path: string, id: string }) {
  const data = await api.get(`/${docRef.path}/${docRef.id}`);
  return {
    id: data.id,
    exists: () => !!data.id,
    data: () => data
  };
}

export async function setDoc(docRef: { path: string, id: string }, data: any, options?: any) {
  if (options?.merge) {
    await api.put(`/${docRef.path}/${docRef.id}`, data);
  } else {
    // Treat as post/put
    await api.post(`/${docRef.path}`, { id: docRef.id, ...data });
  }
}

export function serverTimestamp() { return new Date().toISOString(); }
export function increment(n: number) { return { __increment: n }; }

export function onAuthStateChanged(auth: any, callback: any) {
  // Mock current user
  const saved = localStorage.getItem('striqo_user');
  const token = localStorage.getItem('striqo_token');
  if (saved && token) {
    try {
      callback(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      callback(null);
    }
  } else {
    callback(null);
  }
  return () => {};
}

export const storage = {};
export function getStorage() { return storage; }
export function ref(storage: any, path: string) { return path; }
export function uploadBytesResumable(storageRef: string, file: any) {
  let callbacks: any = {};
  setTimeout(() => {
    if (callbacks['state_changed']) {
      callbacks['state_changed']({ bytesTransferred: 100, totalBytes: 100 });
    }
  }, 100);

  return {
    on: (event: string, progress: any, error: any, complete: any) => {
      callbacks[event] = progress;
      setTimeout(() => {
        if (complete) complete();
      }, 200);
    },
    snapshot: { ref: { file } } // custom property to pass the file to getDownloadURL
  };
}
export async function getDownloadURL(ref: any): Promise<string> {
  return new Promise((resolve) => {
    if (ref.file) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(ref.file);
    } else {
      resolve("https://placehold.co/600x400/0a0a1f/00e5ff?text=Uploaded+Image");
    }
  });
}
export async function deleteObject(ref: any) {
  return true;
}
