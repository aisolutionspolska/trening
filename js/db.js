// Prosta warstwa IndexedDB: wszystkie dane zostają w telefonie / komputerze.
const DB_NAME = 'trening';
const DB_VER = 1;
const STORES = ['kv', 'days', 'sessions', 'food', 'products'];
let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('days')) db.createObjectStore('days');
      if (!db.objectStoreNames.contains('sessions')) {
        const s = db.createObjectStore('sessions', { keyPath: 'id' });
        s.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('food')) {
        const f = db.createObjectStore('food', { keyPath: 'id' });
        f.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const os = t.objectStore(store);
    let out;
    const r = fn(os);
    if (r && 'onsuccess' in r) r.onsuccess = () => { out = r.result; };
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
  }));
}

// raw: bez synchronizacji (używa jej sync.js). db: każda zmiana treningu idzie też do repozytorium.
export const raw = {
  get: (store, key) => tx(store, 'readonly', os => os.get(key)),
  put: (store, value, key) => tx(store, 'readwrite', os => key === undefined ? os.put(value) : os.put(value, key)),
  del: (store, key) => tx(store, 'readwrite', os => os.delete(key)),
  all: (store) => tx(store, 'readonly', os => os.getAll()),
};
let sessionHook = null;
export const setSessionHook = f => { sessionHook = f; };

export const db = {
  get: (store, key) => tx(store, 'readonly', os => os.get(key)),
  put: async (store, value, key) => {
    if (store === 'sessions') value.updatedAt = Date.now();
    const r = await tx(store, 'readwrite', os => key === undefined ? os.put(value) : os.put(value, key));
    if (store === 'sessions') sessionHook?.(value.id, false);
    return r;
  },
  del: async (store, key) => {
    const r = await tx(store, 'readwrite', os => os.delete(key));
    if (store === 'sessions') sessionHook?.(key, true);
    return r;
  },
  all: (store) => tx(store, 'readonly', os => os.getAll()),
  keys: (store) => tx(store, 'readonly', os => os.getAllKeys()),
  clear: (store) => tx(store, 'readwrite', os => os.clear()),
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Kopia zapasowa: wszystko do jednego pliku JSON i z powrotem.
export async function exportAll() {
  const out = { app: 'trening', version: 1, exportedAt: new Date().toISOString() };
  for (const s of STORES) {
    if (s === 'kv' || s === 'days') {
      const keys = await db.keys(s);
      const vals = await db.all(s);
      out[s] = keys.map((k, i) => [k, vals[i]]);
    } else {
      out[s] = await db.all(s);
    }
  }
  return out;
}

export async function importAll(data) {
  if (!data || data.app !== 'trening') throw new Error('To nie jest kopia tej aplikacji.');
  for (const s of STORES) {
    if (!data[s]) continue;
    await db.clear(s);
    if (s === 'kv' || s === 'days') {
      for (const [k, v] of data[s]) await db.put(s, v, k);
    } else {
      for (const v of data[s]) await db.put(s, v);
    }
  }
}
