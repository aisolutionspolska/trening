// Synchronizacja treningów z prywatnym repozytorium na GitHubie (aisolutionspolska/trening-dane).
// Każdy trening to plik sesje/<id>.json. Zegarek zapisuje tam to samo, więc oba widzą wszystko.
// Usunięcie = plik z { id, deleted: true, updatedAt }. Wygrywa nowszy updatedAt.
import { raw } from './db.js';

const API = (() => { try { return localStorage.getItem('syncApi'); } catch (e) { return null; } })()
  || 'https://api.github.com/repos/aisolutionspolska/trening-dane/contents/sesje';
let token = null;
let running = null;
let again = false;
let timer = null;
let retryLeft = 2;
let onChange = () => { };
export const status = { ok: null, at: null, err: null };

export async function initSync(cb) {
  onChange = cb;
  token = (await raw.get('kv', 'sync.token')) || null;
}
export const hasToken = () => !!token;
export async function setToken(t) {
  token = (t || '').trim() || null;
  await raw.put('kv', token, 'sync.token');
  await raw.put('kv', {}, 'sync.shas');
  if (token) {
    // pierwszy raz: wszystkie lokalne treningi idą do repozytorium
    const dirty = (await raw.get('kv', 'sync.dirty')) || {};
    for (const s of await raw.all('sessions')) dirty[s.id] = true;
    await raw.put('kv', dirty, 'sync.dirty');
  }
}

// Wołane przez db.js przy każdej zmianie w 'sessions'.
export async function markDirty(id, deleted) {
  const dirty = (await raw.get('kv', 'sync.dirty')) || {};
  dirty[id] = deleted ? { deleted: true, updatedAt: Date.now() } : true;
  await raw.put('kv', dirty, 'sync.dirty');
  clearTimeout(timer); timer = setTimeout(() => syncNow(), 1500);
}

function headers(extra = {}) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...extra };
}
const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const fromB64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), c => c.charCodeAt(0)));

export function syncNow() {
  if (!token) return Promise.resolve(false);
  if (running) { again = true; return running; }
  running = run().finally(() => { running = null; if (again) { again = false; syncNow(); } });
  return running;
}

async function run() {
  let changed = false;
  try {
    const shas = (await raw.get('kv', 'sync.shas')) || {};
    // 1. lista plików
    const r = await fetch(API, { headers: headers(), cache: 'no-store' });
    if (r.status === 401 || r.status === 403) throw new Error('Klucz nie działa albo wygasł.');
    const list = r.status === 404 ? [] : await r.json();
    if (!Array.isArray(list)) throw new Error('GitHub: ' + (list.message || r.status));
    // 2. pobierz nowe i zmienione
    for (const f of list) {
      if (!f.name.endsWith('.json') || shas[f.name] === f.sha) continue;
      const fr = await fetch(`${API}/${encodeURIComponent(f.name)}`, { headers: headers(), cache: 'no-store' });
      if (!fr.ok) continue;
      const rec = JSON.parse(fromB64((await fr.json()).content));
      const local = await raw.get('sessions', rec.id);
      const lu = local?.updatedAt || local?.endedAt || 0;
      const ru = rec.updatedAt || rec.endedAt || 0;
      if (rec.deleted) { if (local && lu <= ru) { await raw.del('sessions', rec.id); changed = true; } }
      else if (!local || lu < ru) { delete rec.deleted; await raw.put('sessions', rec); changed = true; }
      shas[f.name] = f.sha;
    }
    // 3. wyślij lokalne zmiany
    const dirty = (await raw.get('kv', 'sync.dirty')) || {};
    for (const id of Object.keys(dirty)) {
      const name = `${id}.json`;
      const local = await raw.get('sessions', id);
      const body = local ? { ...local, updatedAt: local.updatedAt || local.endedAt || Date.now() }
        : dirty[id] === true ? null : { id, deleted: true, updatedAt: dirty[id].updatedAt };
      if (!body) { delete dirty[id]; continue; }
      const pr = await fetch(`${API}/${encodeURIComponent(name)}`, {
        method: 'PUT', headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message: `${body.deleted ? 'Usunięty' : 'Trening'} ${body.date || id} (telefon)`, content: b64(JSON.stringify(body, null, 1)), ...(shas[name] ? { sha: shas[name] } : {}) }),
      });
      if (pr.ok) { shas[name] = (await pr.json()).content.sha; delete dirty[id]; }
      else if ((pr.status === 409 || pr.status === 422) && retryLeft > 0) { retryLeft--; delete shas[name]; again = true; }
      else throw new Error('Wysyłanie: ' + pr.status);
    }
    await raw.put('kv', dirty, 'sync.dirty');
    await raw.put('kv', shas, 'sync.shas');
    if (!again) retryLeft = 2;
    Object.assign(status, { ok: true, at: Date.now(), err: null });
  } catch (e) {
    Object.assign(status, { ok: false, at: Date.now(), err: e.message || String(e) });
  }
  onChange(changed);
  return changed;
}
