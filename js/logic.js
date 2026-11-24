import { EX } from './plan.js';

// ---------- daty ----------
export const pad = n => String(n).padStart(2, '0');
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); };
export const dayKeyOf = d => ['ndz', 'pon', 'wt', 'sr', 'czw', 'pt', 'sob'][d.getDay()];
export function weekNumber(startKey, d = new Date()) {
  const s = mondayOf(parseKey(startKey));
  const m = mondayOf(d);
  return Math.max(1, Math.floor(Math.round((m - s) / 86400000) / 7) + 1);
}
const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
export const fmtDate = d => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const fmtShort = d => `${['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'][d.getDay()]} ${d.getDate()}.${pad(d.getMonth() + 1)}`;

// ---------- liczby ----------
export const fmtNum = (n, dec = 0) => {
  if (n === null || n === undefined || isNaN(n)) return '–';
  const v = Number(n).toFixed(dec);
  const [a, b] = v.split('.');
  const withSpace = a.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return b && Number(b) !== 0 ? `${withSpace},${b}` : withSpace;
};
export const fmtKg = n => fmtNum(n, Number.isInteger(n) ? 0 : (Math.round(n * 10) % 10 === 0 ? 0 : (Math.round(n * 100) % 10 === 0 ? 1 : 2)));
export const fmtMin = m => (m == null ? '–' : `${Math.floor(m / 60)}:${pad(m % 60)}`);
export const fmtClock = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };

// ---------- trening ----------
export const FEEL = {
  easy: { label: 'Łatwo', sub: 'zostało 3+ powt.', rir: 3 },
  ok:   { label: 'W sam raz', sub: 'zostały 2 powt.', rir: 2 },
  hard: { label: 'Ciężko', sub: '0–1 w zapasie', rir: 0 },
};

export function e1rm(set, unit) {
  if (unit === 'kg') return set.kg > 0 ? set.kg * (1 + set.reps / 30) : set.reps;
  return set.reps;
}

export function lastSetsFor(exId, sessions) {
  for (const s of sessions) { // posortowane od najnowszej
    const e = (s.exercises || []).find(x => x.ex === exId && x.sets && x.sets.length);
    if (e) return { sets: e.sets, target: e.target, date: s.date };
  }
  return null;
}

// Cel na dziś: wylicza się z ostatniego razu i z tego, jak było (Łatwo / W sam raz / Ciężko).
// Tygodnie 1–2 (powrót): lekko. Ciężar nie rośnie, a pierwszy raz startujesz od 80% wagi startowej.
export function targetFor(item, sessions, week = 99) {
  const ex = EX[item.ex];
  const light = week <= 2;
  const last = lastSetsFor(item.ex, sessions);
  if (!last) {
    if (ex.unit === 'kg') return { kg: ex.start == null ? null : light ? round2(ex.start * 0.8, ex.inc || 2.5) : ex.start, reps: item.reps, reason: 'first', first: true };
    return { kg: null, reps: item.reps, reason: 'first', first: true };
  }
  const sets = last.sets;
  const lastSet = sets[sets.length - 1];
  const wanted = last.target?.reps ?? item.reps;
  const allGood = sets.every(s => s.reps >= wanted && s.feel !== 'hard');
  const manyLow = sets.filter(s => s.reps < wanted - 1).length >= 2;
  if (ex.unit === 'kg') {
    const kg = lastSet.kg;
    if (allGood && !light) return { kg: round(kg + (ex.inc || 2.5)), reps: item.reps, reason: 'up', prevKg: kg };
    if (manyLow) return { kg: Math.max(0, round(kg - (ex.inc || 2.5))), reps: item.reps, reason: 'down', prevKg: kg };
    return { kg, reps: item.reps, reason: 'hold', prevKg: kg };
  }
  const step = ex.unit === 's' ? 5 : 1;
  const best = Math.max(...sets.map(s => s.reps));
  if (allGood) return { kg: null, reps: Math.min(best + step, item.reps + (ex.unit === 's' ? 30 : 6)), reason: 'up' };
  return { kg: null, reps: Math.max(item.reps, wanted), reason: 'hold' };
}
const round = n => Math.round(n * 4) / 4;
const round2 = (n, inc) => Math.round(n / inc) * inc;

export function bestSet(exId, sessions) {
  const unit = EX[exId]?.unit;
  let best = null;
  for (const s of sessions) for (const e of s.exercises || []) if (e.ex === exId) for (const st of e.sets || []) {
    const v = e1rm(st, unit);
    if (!best || v > best.v) best = { v, set: st, date: s.date };
  }
  return best;
}

// ---------- jedzenie ----------
export function macros(entry) {
  const f = (entry.grams || 0) / 100;
  const p = entry.per100 || {};
  return { kcal: (p.kcal || 0) * f, p: (p.p || 0) * f, c: (p.c || 0) * f, f: (p.f || 0) * f };
}
export function sumMacros(entries) {
  return entries.reduce((a, e) => { const m = macros(e); a.kcal += m.kcal; a.p += m.p; a.c += m.c; a.f += m.f; return a; }, { kcal: 0, p: 0, c: 0, f: 0 });
}
