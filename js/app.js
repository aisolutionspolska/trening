import { db, uid, exportAll, importAll } from './db.js';
import { EX, dayPlan, baseItems, variantOf, alternatives, phaseFor, DAY_KEYS, DAY_SHORT, COND_VARIANTS, MAIN_LIFTS,
  registerCustom, isBanned, PATTERN_NAMES, DRILLS, rampSets } from './plan.js';
import { dateKey, parseKey, addDays, mondayOf, weekNumber, fmtShort, fmtNum, fmtKg, fmtClock,
  FEEL, targetFor, bestSet, e1rm, macros, sumMacros } from './logic.js';
import { BASE, searchOFF, byBarcode, canScan } from './food.js';

// ---------------- stan ----------------
const DEFAULTS = { kcal: 3050, protein: 155, supps: ['Kreatyna', 'Witamina D', 'Magnez'], theme: 'light', swaps: {}, edits: {}, customEx: {} };
const S = {
  route: 'dzis', p: {}, settings: null, days: {}, sessions: [], food: [], products: [], active: null,
  sheet: null, toast: null, q: '', offResults: [], offState: '', tab: 'ostatnie', g: null, endPain: null,
  progTab: 'sila', dietDate: dateKey(), open: {}, dt: null, gw: 0,
};
const APP_VERSION = '4';
const MEALS = [['sniadanie', 'Śniadanie'], ['obiad', 'Obiad'], ['kolacja', 'Kolacja'], ['przekaski', 'Przekąski']];
const app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const nb = t => esc(t).replace(/(^|[\s(])([aiouwzAIOUWZ])\s/g, '$1$2\u00a0');

async function load() {
  const st = await db.get('kv', 'settings');
  S.settings = { ...DEFAULTS, ...(st || {}) };
  if (!S.settings.startDate) { S.settings.startDate = dateKey(mondayOf(new Date())); await saveSettings(); }
  registerCustom(S.settings.customEx);
  const dk = await db.keys('days'); const dv = await db.all('days');
  S.days = {}; dk.forEach((k, i) => { S.days[k] = dv[i]; });
  S.sessions = (await db.all('sessions')).sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));
  S.food = await db.all('food');
  S.products = await db.all('products');
  S.active = (await db.get('kv', 'active')) || null;
  applyTheme();
}
const saveSettings = () => db.put('kv', S.settings, 'settings');
const saveActive = () => S.active ? db.put('kv', S.active, 'active') : db.del('kv', 'active');
async function saveDay(k) { await db.put('days', S.days[k], k); }
function applyTheme() {
  document.documentElement.dataset.theme = S.settings.theme === 'dark' ? 'dark' : 'light';
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = S.settings.theme === 'dark' ? '#0b0b0b' : '#ffffff';
  try { localStorage.setItem('theme-hint', JSON.stringify(S.settings.theme)); } catch (e) { }
}

// ---------------- ikony ----------------
const P = {
  home: 'M4 11l8-7 8 7v9H4z', train: 'M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12', food: 'M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M16 3c-2 2-2 6 0 8v10',
  prog: 'M4 20V10M10 20V4M16 20v-7M22 20H2', back: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7', arrow: 'M5 12h14M13 6l6 6-6 6',
  plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', check: 'M5 12l5 5 9-10', close: 'M6 6l12 12M18 6L6 18', menu: 'M4 6h16M4 12h16M4 18h16',
  swap: 'M4 8h14l-4-4M20 16H6l4 4', moon: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z', search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',
  up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  scan: 'M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M13 8v8M17 8v8', gear: 'M12 9a3 3 0 100 6 3 3 0 000-6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  sun: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
};
const ic = (n, size = 22, w = 1.6) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="square" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const quads = n => `<span class="q" aria-label="Intensywność ${n} z 3">${[1, 2, 3].map(i => `<i class="${i <= n ? 'f' : ''}"></i>`).join('')}</span>`;
const unitTxt = ex => (ex.repsLabel === 'm' ? ' m' : ex.unit === 's' ? ' s' : '');
const setTxt = (ex, s) => `${ex.unit === 'kg' && s.kg != null ? `${fmtKg(s.kg)} × ` : ''}${s.reps}${unitTxt(ex)}`;

// ---------------- nawigacja ----------------
function go(route, p = {}, replace = false) {
  S.route = route; S.p = p; S.sheet = null; S.open = {};
  const st = { route, p };
  replace ? history.replaceState(st, '') : history.pushState(st, '');
  render(); window.scrollTo(0, 0);
}
window.addEventListener('popstate', e => { if (S.sheet) { S.sheet = null; render(); return; } const st = e.state || { route: 'dzis', p: {} }; S.route = st.route; S.p = st.p || {}; render(); });
function nav(active) {
  const it = (r, i, l) => `<button class="nv ${active === r ? 'on' : ''}" data-a="nav" data-r="${r}">${ic(i)}${l}</button>`;
  return `<nav class="nav" aria-label="Główna nawigacja">${it('dzis', 'home', 'Dziś')}${it('tydzien', 'train', 'Plan')}${it('dieta', 'food', 'Dieta')}${it('postep', 'prog', 'Postęp')}</nav>`;
}
let toastT = null;
function toast(msg, undo = null) { S.toast = { msg, undo }; render(); clearTimeout(toastT); toastT = setTimeout(() => { S.toast = null; render(); }, undo ? 5000 : 2400); }

// ---------------- tydzień jako kolejka ----------------
const today = () => new Date();
const tKey = () => dateKey(today());
const curWeek = () => weekNumber(S.settings.startDate, today());
const cfg = () => ({ swaps: S.settings.swaps, edits: S.settings.edits });
const plan = (w, dk) => dayPlan(w, dk, cfg());
const slotSession = (w, dk) => S.sessions.find(s => s.week === w && s.dayKey === dk);
const isActiveSlot = (w, dk) => S.active && S.active.week === w && S.active.dayKey === dk;
function nextSlot() {
  const w = curWeek(); const q = DAY_KEYS.filter(dk => !slotSession(w, dk) && !isActiveSlot(w, dk));
  if (!q.length) return null;
  const y = dateKey(addDays(today(), -1)); const t = tKey();
  const legsRecently = S.sessions.some(s => (s.date === y || s.date === t) && plan(s.week, s.dayKey)?.legs);
  let pick = q[0];
  if (legsRecently && plan(w, pick).legs) { const alt = q.find(dk => !plan(w, dk).legs); if (alt) pick = alt; }
  return pick;
}
const foodOn = k => S.food.filter(f => f.date === k);

// ---------------- dźwięk, wibracja, ekran ----------------
let actx = null;
function unlockAudio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } else if (actx.state === 'suspended') actx.resume(); }
function beep(times = 2) {
  try { navigator.vibrate?.([200, 100, 200]); } catch (e) { }
  if (!actx) return;
  for (let i = 0; i < times; i++) {
    const o = actx.createOscillator(); const g = actx.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime + i * 0.25; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.start(t); o.stop(t + 0.2);
  }
}
let wakeLock = null;
async function keepScreen(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.active) keepScreen(true); });

// ================= EKRANY =================
const screens = {};
const pct = (a, b) => Math.min(100, Math.round((a / b) * 100));

// ---------- Dziś ----------
screens.dzis = () => {
  const k = tKey(); const w = curWeek();
  const doneToday = S.sessions.filter(s => s.date === k);
  const off = S.days[k]?.off;
  const nx = nextSlot();
  let card;
  if (S.active) {
    card = `<div class="row"><div class="h2">${esc(S.active.title)}</div>${quads(plan(S.active.week, S.active.dayKey).intensity)}</div>
      <button class="pb split mid" data-a="resume">Wróć do treningu ${ic('arrow', 20)}</button>`;
  } else if (off) {
    card = `<div class="h2">Dziś wolne</div><div class="mut sm">${nx ? `Jutro: ${plan(w, nx).title}` : 'Tydzień zrobiony'}</div>
      <button class="sb" data-a="offUndo">Jednak trenuję</button>`;
  } else if (doneToday.length) {
    const s = doneToday[0];
    card = `<div class="row"><div class="h2">${esc(s.title)}</div><span class="int">${ic('check', 16, 2.4)}</span></div>
      <div class="mut sm">${nx ? `Następny: ${plan(w, nx).title}` : 'Tydzień zrobiony'}</div>
      <div class="grid2" style="gap:8px"><button class="sb" data-a="viewSes" data-id="${s.id}">Zapis</button>${nx ? `<button class="sb" data-a="open" data-dk="${nx}" data-w="${w}">Jeszcze jeden</button>` : `<button class="sb" data-a="nav" data-r="tydzien">Tydzień</button>`}</div>`;
  } else if (nx) {
    const pl = plan(w, nx);
    card = `<div class="row"><div class="h2">${pl.title}</div>${quads(pl.intensity)}</div>
      <div class="mut sm">${pl.items ? `${pl.items.length} ćwiczeń · ` : ''}ok. ${pl.minutes}&nbsp;min</div>
      <button class="pb split mid" data-a="open" data-dk="${nx}" data-w="${w}">${pl.type === 'rest' ? 'Otwórz' : 'Zacznij'} ${ic('arrow', 20)}</button>
      <div class="grid2" style="gap:8px"><button class="sb" data-a="dayOff">Dziś wolne</button><button class="sb" data-a="nav" data-r="tydzien">Zrób inny</button></div>`;
  } else {
    card = `<div class="h2">Tydzień zrobiony</div><button class="sb" data-a="nav" data-r="tydzien">Tydzień</button>`;
  }
  const tot = sumMacros(foodOn(k)); const supps = S.days[k]?.supps || {};
  return `<main class="scr has-nav">
    <div class="row">
      <h1>Dziś</h1>
      <div style="display:flex;gap:6px">
        <button class="ib box" data-a="theme" aria-label="${S.settings.theme === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}">${ic(S.settings.theme === 'dark' ? 'sun' : 'moon', 20)}</button>
        <button class="ib box" data-a="settings" aria-label="Ustawienia">${ic('gear', 20)}</button>
      </div>
    </div>
    <section class="sec">${card}</section>
    <section class="sec">
      <div class="row"><span class="lb k">Jedzenie</span><button class="sb sm" data-a="addFood" data-meal="${mealNow()}">${ic('plus', 14, 2)}Posiłek</button></div>
      <div style="display:flex;flex-direction:column;gap:7px"><div class="row" style="align-items:baseline;font-size:14px"><span>Kalorie</span><span><strong class="n" style="font-size:20px">${fmtNum(tot.kcal)}</strong> / ${fmtNum(S.settings.kcal)}</span></div><div class="bar"><i style="width:${pct(tot.kcal, S.settings.kcal)}%"></i></div></div>
      <div style="display:flex;flex-direction:column;gap:7px"><div class="row" style="align-items:baseline;font-size:14px"><span>Białko</span><span><strong class="n" style="font-size:20px">${fmtNum(tot.p)}</strong> / ${fmtNum(S.settings.protein)} g</span></div><div class="bar"><i style="width:${pct(tot.p, S.settings.protein)}%"></i></div></div>
    </section>
    ${S.settings.supps.length ? `<section class="sec" style="gap:0"><span class="lb k" style="margin-bottom:2px">Suplementy</span>
      ${S.settings.supps.map(s => `<button class="chk" data-a="supp" data-s="${esc(s)}" aria-pressed="${!!supps[s]}"><span class="box ${supps[s] ? 'on' : ''}">${supps[s] ? ic('check', 16, 2.6) : ''}</span>${esc(s)}</button>`).join('')}
    </section>` : ''}
  </main>${nav('dzis')}`;
};
function mealNow() { const h = new Date().getHours(); return h < 11 ? 'sniadanie' : h < 16 ? 'obiad' : h < 21 ? 'kolacja' : 'przekaski'; }

// ---------- Trening: siatka mikrocyklu ----------
function squares(n, filled, extra = 0) {
  let h = '';
  for (let i = 0; i < Math.max(n, filled); i++) h += `<i class="${i < filled ? 'f' : ''}${i >= n ? ' x' : ''}"></i>`;
  return `<span class="gsq">${h}</span>`;
}
function setsDoneFor(ses, active, item, i) {
  if (active) return (active.done[i] || []).length;
  if (!ses) return 0;
  const e = (ses.exercises || []).find((x, j) => x.ex === item.ex && (x.idx === undefined || x.idx === i)) || (ses.exercises || []).find(x => x.ex === item.ex);
  return e ? e.sets.length : 0;
}
function drillsDone(ids, map) { return (ids || []).filter(id => map?.[id]).length; }
screens.tydzien = () => {
  const cw = curWeek(); const w = Math.max(1, cw + S.gw); const ph = phaseFor(w); const nx = w === cw ? nextSlot() : null;
  const inBlock = w <= 2 ? [w, 2] : w <= 6 ? [w - 2, 4] : w <= 11 ? [w - 6, 5] : [1, 1];
  const blocks = DAY_KEYS.map(dk => {
    const pl = plan(w, dk); const ses = slotSession(w, dk); const act = isActiveSlot(w, dk) ? S.active : null;
    const tag = ses ? ic('check', 18, 2.4) : act ? '<span class="pill">Teraz</span>' : dk === nx ? '<span class="pill">Następny</span>' : quads(pl.intensity);
    let grid = '';
    const wRow = pl.warm ? `<div class="grow"><span>Rozgrzewka</span>${squares(pl.warm.length, drillsDone(pl.warm, act ? act.warm : ses?.warm))}</div>` : '';
    const cRow = pl.cool ? `<div class="grow"><span>Rozciąganie</span>${squares(pl.cool.length, drillsDone(pl.cool, act ? act.cool : ses?.cool))}</div>` : '';
    if (pl.items) {
      grid = pl.items.map((it, i) => { const ex = EX[it.ex]; const t = targetFor(it, S.sessions, w);
        return `<div class="grow"><span>${esc(ex.name)}<small>${it.sets} × ${t.reps}${unitTxt(ex)}${ex.unit === 'kg' && t.kg != null ? ` · ${fmtKg(t.kg)} kg` : ''}</small></span>${squares(it.sets, setsDoneFor(ses, act, it, i))}</div>`; }).join('');
      if (pl.cond) { const v = COND_VARIANTS[pl.cond]; const r = (act?.cond?.doneRounds) ?? ses?.cond?.rounds ?? 0; grid += `<div class="grow"><span>${v.name}</span>${squares(v.rounds, r)}</div>`; }
    } else {
      const chk = ses?.checklist || {}; const list = pl.checklist || [];
      grid = list.length ? `<div class="grow"><span>Do odhaczenia</span>${squares(list.length, list.filter(c => chk[c.id]).length)}</div>` : '';
      if (pl.condChoice) { const v = COND_VARIANTS[ses?.cond?.variant || pl.condChoice[0]]; const r = act?.cond?.doneRounds ?? ses?.cond?.rounds ?? 0; grid = `<div class="grow"><span>Interwały${ses?.cond ? ` · ${v.name}` : ''}</span>${squares(v.rounds, r)}</div>` + grid; }
    }
    grid = wRow + grid + cRow;
    return `<button class="gday ${dk === nx && !ses ? 'nx' : ''}" data-a="slot" data-dk="${dk}" data-w="${w}">
      <div class="row ghead"><span><b>${DAY_SHORT[dk]}</b>${esc(pl.title)}</span>${tag}</div>${grid}</button>`;
  }).join('');
  return `<main class="scr has-nav">
    <div class="row" style="align-items:center"><h1>Tydzień ${w}</h1>
      <div style="display:flex;gap:4px"><button class="ib box" data-a="gw" data-d="-1" aria-label="Poprzedni tydzień" ${w <= 1 ? 'disabled style="opacity:.3"' : ''}>${ic('back', 20)}</button><button class="ib box" data-a="gw" data-d="1" aria-label="Następny tydzień">${ic('next', 20)}</button></div></div>
    <div class="row" style="margin-top:-8px"><span class="n" style="font-size:15px">${ph.name}</span>${w !== cw ? `<button class="lnk" style="height:28px" data-a="gw0">Ten tydzień</button>` : ''}</div>
    <div class="segs">${Array.from({ length: inBlock[1] }, (_, i) => `<span class="${i + 1 < inBlock[0] ? 'd' : i + 1 === inBlock[0] ? 'c' : ''}"></span>`).join('')}</div>
    <div class="gweek">${blocks}</div>
  </main>${nav('tydzien')}`;
};

// ---------- Podgląd dnia (i edycja planu) ----------
screens.podglad = () => {
  const { dk } = S.p; const w = Number(S.p.w); const pl = plan(w, dk);
  const ses = slotSession(w, dk);
  const head = `<div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button>${pl.items ? `<button class="tb" data-a="editMode">${S.p.edit ? 'Gotowe' : 'Edytuj plan'}</button>` : ''}</div>
    <div class="row"><h1 style="font-size:30px">${pl.title}</h1>${ses ? `<span class="int">${ic('check', 16, 2.4)}Zrobiony</span>` : quads(pl.intensity)}</div>`;
  if (pl.items) {
    const ed = S.p.edit;
    const list = pl.items.map((it, i) => {
      const ex = EX[it.ex]; const t = targetFor(it, S.sessions, w);
      const tg = `${it.sets} × ${t.reps}${unitTxt(ex)}${ex.unit === 'kg' && t.kg != null ? ` · ${fmtKg(t.kg)} kg` : ''}${t.reason === 'up' && ex.unit === 'kg' ? ` <strong>+${fmtKg(t.kg - t.prevKg)}</strong>` : ''}`;
      return ed
        ? `<div class="li" style="grid-template-columns:1fr auto;min-height:62px"><button style="background:none;border:0;padding:0;text-align:left;font-weight:600;line-height:1.2;font-size:15px" data-a="editItem" data-i="${i}">${esc(ex.name)}<small>${it.sets} × ${it.reps}${unitTxt(ex)} · przerwa ${fmtClock(it.rest)}</small></button>
            <span style="display:flex;gap:4px"><button class="sq" data-a="moveItem" data-i="${i}" data-d="-1" aria-label="W górę">${ic('up', 16, 2)}</button><button class="sq" data-a="moveItem" data-i="${i}" data-d="1" aria-label="W dół">${ic('down', 16, 2)}</button></span></div>`
        : `<div class="li" style="grid-template-columns:28px 1fr;min-height:58px"><span class="mut sm" style="font-weight:600">${String(i + 1).padStart(2, '0')}</span><span style="font-weight:600;line-height:1.2">${esc(ex.name)}<small>${tg}</small></span></div>`;
    }).join('');
    const cond = pl.cond ? `<div class="li" style="grid-template-columns:28px 1fr;min-height:52px"><span class="mut sm" style="font-weight:600">+</span><span style="font-weight:600">${COND_VARIANTS[pl.cond].name}</span></div>` : '';
    const dl = (k, ids) => ids ? `<button class="li" style="grid-template-columns:28px 1fr 20px;min-height:58px" data-a="drillInfo" data-k="${k}"><span class="mut sm" style="font-weight:600">${k === 'warm' ? '↑' : '↓'}</span><span style="font-weight:600;line-height:1.2">${k === 'warm' ? 'Rozgrzewka' : 'Rozciąganie'}<small>${ids.length} ćwiczeń · ok. ${k === 'warm' ? 12 : 10} min</small></span>${ic('next', 18)}</button>` : '';
    const canStart = w === curWeek();
    return `<main class="scr">${head}<div style="border-top:1px solid var(--line2)">${ed ? '' : dl('warm', pl.warm)}${list}${cond}${ed ? '' : dl('cool', pl.cool)}</div>
      ${ed ? `<div class="grid2" style="gap:8px"><button class="sb" data-a="addExOpen" data-ctx="plan">${ic('plus', 14, 2)}Ćwiczenie</button><button class="sb" data-a="resetPlan" ${pl.edited ? '' : 'disabled'}>Przywróć plan</button></div>` : ''}
      <div class="spacer"></div>
      ${ses && !ed ? `<div class="grid2" style="gap:8px"><button class="sb" data-a="viewSes" data-id="${ses.id}">Zapis treningu</button><button class="sb" data-a="unmark" data-id="${ses.id}">Niezrobiony</button></div>` : ''}
      ${!ed && !ses && canStart ? `<button class="pb split" data-a="start" data-dk="${dk}" data-w="${w}">Zacznij ${ic('arrow', 20)}</button>` : ''}</main>`;
  }
  const chk = S.p.chk || ses?.checklist || {};
  const list = (pl.checklist || []).map(c => {
    const v = chk[c.id];
    const mins = c.minutes ? `<span class="chips" style="margin-left:auto">${c.minutes.map(m => `<button class="sb sm" style="${v === m ? 'background:var(--inv-bg);color:var(--inv-ink);border-color:var(--inv-bg)' : ''}" data-a="chkMin" data-id="${c.id}" data-m="${m}">${m}′</button>`).join('')}</span>` : '';
    const open = S.open[c.id];
    return `<div class="dr"><button class="cb" data-a="chk" data-id="${c.id}" aria-label="${esc(c.label)}" aria-pressed="${!!v}"><span class="box ${v ? 'on' : ''}">${v ? ic('check', 16, 2.6) : ''}</span></button>
      ${c.how ? `<button class="drn" data-a="how" data-id="${c.id}" aria-expanded="${!!open}">${nb(c.label)}${ic(open ? 'up' : 'down', 14, 2)}</button>` : `<span class="drn">${nb(c.label)}</span>`}${mins}</div>
      ${open ? `<div class="how">${nb(c.how)}</div>` : ''}`;
  }).join('');
  const cv = S.p.cv || pl.condChoice?.[0];
  const condPick = pl.condChoice ? `<div class="field"><span class="lb k">Interwały</span><div class="tiles" style="grid-template-columns:repeat(${pl.condChoice.length},minmax(0,1fr))">
      ${pl.condChoice.map(v => `<button class="tile ${cv === v ? 'on' : ''}" style="font-size:14px" data-a="pickCond" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="mut sm">${(() => { const c = COND_VARIANTS[cv]; return `${c.rounds} × ${fmtClock(c.work)} / ${fmtClock(c.rest)}`; })()}</div></div>` : '';
  return `<main class="scr">${head}${condPick}
    ${list ? `<div style="border-top:1px solid var(--line2)">${list}</div>` : ''}
    <div class="spacer"></div>
    ${pl.condChoice && !ses && w === curWeek() ? `<button class="pb split" data-a="startCond" data-dk="${dk}" data-w="${w}">${pl.warm ? 'Zacznij od rozgrzewki' : 'Zacznij interwały'} ${ic('arrow', 20)}</button>` : ''}
    ${ses ? `<div class="grid2" style="gap:8px"><button class="sb" data-a="unmark" data-id="${ses.id}">Niezrobiony</button><button class="pb" style="height:48px" data-a="saveLight" data-dk="${dk}" data-w="${w}">Zapisz zmiany</button></div>`
      : w === curWeek() ? `<button class="${pl.condChoice ? 'sb' : 'pb'}" data-a="saveLight" data-dk="${dk}" data-w="${w}">Zapisz dzień</button>` : ''}
  </main>`;
};

// ---------- Seria ----------
function cur() {
  const a = S.active; const it = a.items[a.idx]; const ex = EX[it.ex];
  const done = a.done[a.idx] || []; const last = done[done.length - 1];
  const kg = last ? last.kg : it.target.kg; const reps = it.target.reps;
  return { a, it, ex, done, kg, reps, setNo: done.length + 1 };
}
screens.seria = () => {
  if (!S.active || !S.active.items.length) return screens.dzis();
  const { a, it, ex, done, kg, reps, setNo } = cur();
  const needKg = ex.unit === 'kg' && (kg === null || kg === undefined);
  const over = setNo > it.sets;
  const chips = done.map((s, j) => `<button class="chip" data-a="editSet" data-i="${a.idx}" data-j="${j}">${ic('check', 12, 2.6)}${setTxt(ex, s)} · ${FEEL[s.feel].label}</button>`).join('');
  return `<main class="scr" style="gap:16px">
    <div class="top"><button class="ib" data-a="exList" aria-label="Ćwiczenia">${ic('menu')}</button><span class="clock" data-tick="elapsed">0:00</span><button class="tb" data-a="finish">Zakończ</button></div>
    <div class="segs">${a.items.map((x, i) => `<span class="${(a.done[i] || []).length >= x.sets ? 'd' : i === a.idx ? 'c' : ''}"></span>`).join('')}</div>
    <div><div class="h2" style="font-size:24px">${esc(ex.name)}</div>${chips ? `<div class="chips" style="margin-top:10px">${chips}</div>` : ''}${rampHtml(it, ex, done, kg)}</div>
    <div class="sec" style="align-items:center;text-align:center;padding-top:22px;gap:0">
      <div class="lb k">Seria ${setNo}${over ? '' : ` z ${it.sets}`}</div>
      ${needKg ? `<div class="h2" style="margin:22px 0 6px">Wybierz ciężar</div>`
      : ex.unit === 'kg' ? `<div class="big" style="margin-top:14px">${fmtKg(kg)}<span style="font-size:28px;letter-spacing:0"> kg</span></div><div class="h2" style="font-size:34px;margin-top:4px">× ${reps}${unitTxt(ex)}</div>`
      : `<div class="big" style="margin-top:14px">${reps}<span style="font-size:28px;letter-spacing:0">${ex.unit === 's' ? ' s' : ex.repsLabel === 'm' ? ' m' : ''}</span></div>`}
    </div>
    <div class="row" style="justify-content:center;gap:6px">
      <button class="sb sm" data-a="setCount" data-d="-1" aria-label="Jedna seria mniej">− seria</button>
      <button class="sb sm" data-a="setCount" data-d="1" aria-label="Jedna seria więcej">+ seria</button>
      <button class="sb sm" data-a="restOpen">Przerwa ${fmtClock(it.rest)}</button>
    </div>
    <div class="spacer"></div>
    ${needKg ? `<button class="pb" data-a="other">Wybierz ciężar</button>` : `
    <div style="display:flex;flex-direction:column;gap:8px">
      ${['easy', 'ok', 'hard'].map(f => `<button class="feel ${f === 'ok' ? 'pri' : ''}" data-a="log" data-f="${f}"><b>${FEEL[f].label}</b></button>`).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:16px"><button class="lnk" data-a="other">Zrobiłem inaczej</button><button class="lnk" data-a="skipEx">Pomiń ćwiczenie</button></div>`}
  </main>`;
};

function rampHtml(it, ex, done, kg) {
  if (done.length || !it.main) return '';
  const r = rampSets(it.ex, kg); if (!r.length) return '';
  return `<div class="ramp"><span class="lb k">Rozgrzewka</span>${r.map(x => `<span class="n">${it.ex === 'pullup_w' && !x.kg ? 'bez ciężaru' : fmtKg(x.kg)} × ${x.reps}</span>`).join('')}</div>`;
}

// ---------- Rozgrzewka / rozciąganie ----------
function drillRow(id, on, act = 'drillChk') {
  const d = DRILLS[id]; const open = S.open[id]; const run = S.dt?.id === id;
  return `<div class="dr"><button class="cb" data-a="${act}" data-id="${id}" aria-pressed="${on}" aria-label="${esc(d.name)}"><span class="box ${on ? 'on' : ''}">${on ? ic('check', 16, 2.6) : ''}</span></button>
    <button class="drn" data-a="how" data-id="${id}" aria-expanded="${!!open}">${nb(d.name)}${ic(open ? 'up' : 'down', 14, 2)}<small>${nb(d.dose)}</small></button>
    ${d.t ? `<button class="sb sm tmr ${run ? 'on' : ''}" data-a="drillTimer" data-id="${id}" aria-label="Minutnik ${fmtClock(d.t)}">${run ? `<span data-tick="dt">${fmtClock(Math.max(0, (S.dt.until - Date.now()) / 1000))}</span>` : `▶ ${fmtClock(d.t)}`}</button>` : '<span></span>'}</div>
    ${open ? `<div class="how">${nb(d.how)}</div>` : ''}`;
}
screens.drills = () => {
  const a = S.active; if (!a) return screens.dzis();
  const k = S.p.k === 'cool' ? 'cool' : 'warm';
  const ids = (k === 'warm' ? a.warmList : a.coolList) || []; const done = a[k] || {};
  const n = drillsDone(ids, done);
  const nextLbl = k === 'cool' ? 'Koniec' : a.items.length ? 'Ćwiczenia' : 'Interwały';
  return `<main class="scr">
    <div class="top">${a.items.length ? `<button class="ib" data-a="exList" aria-label="Ćwiczenia">${ic('menu')}</button>` : '<span style="width:44px"></span>'}<span class="clock" data-tick="elapsed">0:00</span><button class="tb" data-a="drillsNext">Pomiń</button></div>
    <div class="row" style="align-items:flex-end"><h1 style="font-size:30px">${k === 'warm' ? 'Rozgrzewka' : 'Rozciąganie'}</h1><span class="n" style="font-size:15px">${n}/${ids.length}</span></div>
    <div class="segs">${ids.map(id => `<span class="${done[id] ? 'd' : ''}"></span>`).join('')}</div>
    <div style="border-top:1px solid var(--line2)">${ids.map(id => drillRow(id, !!done[id])).join('')}</div>
    <div class="spacer"></div>
    <button class="pb split" data-a="drillsNext">${nextLbl} ${ic('arrow', 20)}</button>
  </main>`;
};

// ---------- Przerwa ----------
screens.przerwa = () => {
  if (!S.active) return screens.dzis();
  const a = S.active; const it = a.items[a.idx]; const ex = EX[it.ex]; const done = a.done[a.idx] || [];
  const kg = done.length ? done[done.length - 1].kg : it.target.kg;
  const nextTxt = `Seria ${done.length + 1} · ${setTxt(ex, { kg, reps: it.target.reps })}`;
  const newEx = a.idx !== a.lastIdx;
  return `<main class="scr">
    <div class="top"><button class="ib" data-a="exList" aria-label="Ćwiczenia">${ic('menu')}</button><span class="clock" data-tick="elapsed">0:00</span><button class="tb" data-a="finish">Zakończ</button></div>
    <div class="spacer"></div>
    <div class="sec" style="padding-top:22px;gap:0">
      <div class="lb k">Przerwa</div>
      <div class="huge" style="margin-top:10px" data-tick="rest">${fmtClock(Math.max(0, (a.restUntil - Date.now()) / 1000))}</div>
      <div class="bar t3" style="margin-top:18px"><i data-tick="restbar" style="width:0%"></i></div>
    </div>
    <div class="panel"><div class="n" style="font-size:20px">${newEx ? esc(ex.name) : nextTxt}</div>${newEx ? `<div class="mut sm" style="margin-top:4px">${nextTxt}</div>` : ''}</div>
    <div class="spacer"></div>
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:8px"><button class="sb" style="height:56px;font-size:15px" data-a="plus30">+30 s</button><button class="pb" data-a="skipRest">Pomiń przerwę</button></div>
  </main>`;
};

// ---------- Interwały ----------
screens.interwaly = () => {
  const a = S.active; if (!a || !a.cond) return screens.dzis();
  const c = a.cond; const v = COND_VARIANTS[c.variant];
  if (c.finished) {
    return `<main class="scr"><div class="spacer"></div><h1>Jak ciężko?</h1>
      <div class="tiles" style="grid-template-columns:repeat(5,minmax(0,1fr))">${[6, 7, 8, 9, 10].map(n => `<button class="tile" data-a="rpe" data-n="${n}">${n}</button>`).join('')}</div><div class="spacer"></div></main>`;
  }
  return `<main class="scr">
    <div class="top"><span class="n" style="padding-left:12px;font-size:15px">${v.name}</span><button class="tb" data-a="condEnd">Zakończ</button></div>
    <div class="spacer"></div>
    <div style="display:flex;gap:6px">${Array.from({ length: v.rounds }, (_, i) => `<span style="flex:1;height:${v.rounds > 6 ? 10 : 44}px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:1px solid ${i + 1 === c.round ? 'var(--inv-bg)' : 'var(--line)'};background:${i + 1 < c.round ? 'var(--panel)' : i + 1 === c.round ? 'var(--inv-bg)' : 'none'};color:${i + 1 === c.round ? 'var(--inv-ink)' : 'inherit'}">${v.rounds <= 6 ? i + 1 : ''}</span>`).join('')}</div>
    <div class="sec" style="padding-top:22px;gap:0">
      <span class="tag" style="align-self:flex-start">${c.ph === 'work' ? 'Praca' : c.ph === 'pre' ? 'Start' : 'Przerwa'}</span>
      <div class="huge" style="margin-top:16px" data-tick="cond">${fmtClock(condLeft())}</div>
      <div class="bar t3" style="margin-top:18px"><i class="acc" data-tick="condbar" style="width:0%"></i></div>
    </div>
    <div class="panel"><div class="n" style="font-size:17px;line-height:1.3">${c.ph === 'work' ? v.goal : c.ph === 'pre' ? 'Rozkręć się.' : v.restGoal}</div></div>
    <div class="spacer"></div>
    <div class="grid2" style="gap:8px"><button class="sb" style="height:56px;font-size:15px" data-a="condPause">${c.paused ? 'Wznów' : 'Pauza'}</button><button class="pb" style="font-size:15px" data-a="condNext">Dalej</button></div>
  </main>`;
};
function condLeft() { const c = S.active?.cond; if (!c) return 0; return c.paused ? c.left : Math.max(0, (c.until - Date.now()) / 1000); }

// ---------- Koniec ----------
screens.koniec = () => {
  const a = S.active; if (!a) return screens.dzis();
  const mins = Math.max(1, Math.round((Date.now() - a.startedAt) / 60000));
  const nsets = Object.values(a.done).reduce((n, x) => n + x.length, 0);
  const recs = []; const tips = [];
  a.items.forEach((it, i) => {
    const sets = a.done[i] || []; if (!sets.length) return; const ex = EX[it.ex];
    const before = bestSet(it.ex, S.sessions); const top = sets.reduce((b, s) => (!b || e1rm(s, ex.unit) > e1rm(b, ex.unit) ? s : b), null);
    if (before && e1rm(top, ex.unit) > before.v + 0.01) recs.push(`<div class="li"><span>${esc(ex.name)}</span><strong class="n" style="font-size:15px">${setTxt(ex, top)}</strong></div>`);
    const nt = targetFor(it, [{ exercises: [{ ex: it.ex, sets, target: it.target }] }], a.week);
    if (ex.unit === 'kg' && nt.kg != null && nt.reason !== 'hold') tips.push(`<div class="li" style="min-height:44px"><span>${esc(ex.name)}</span><strong class="n" style="font-size:15px">${fmtKg(nt.kg)} kg</strong></div>`);
  });
  const c = a.cond;
  return `<main class="scr">
    <h1>Koniec</h1>
    <div class="grid3 sec" style="display:grid;gap:0">
      <div><div class="n" style="font-size:28px;font-stretch:125%;line-height:1">${mins}</div><div class="mut sm" style="margin-top:4px">min</div></div>
      <div><div class="n" style="font-size:28px;font-stretch:125%;line-height:1">${c && !nsets ? c.doneRounds || 0 : nsets}</div><div class="mut sm" style="margin-top:4px">${c && !nsets ? 'rund' : 'serii'}</div></div>
      <div><div class="n" style="font-size:28px;font-stretch:125%;line-height:1">${recs.length}</div><div class="mut sm" style="margin-top:4px">rekordy</div></div>
    </div>
    ${recs.length ? `<div><div class="lb k" style="margin-bottom:2px">Rekordy</div>${recs.join('')}</div>` : ''}
    <div class="field"><span class="lb k">Lędźwia</span>
      <div class="seg" style="grid-template-columns:repeat(7,minmax(0,1fr))">${[0, 1, 2, 3, 4, 5, 6].map(n => `<button class="${S.endPain === n ? 'on' : ''}" data-a="pain" data-n="${n}">${n === 6 ? '6+' : n}</button>`).join('')}</div></div>
    ${tips.length ? `<div><div class="lb k" style="margin-bottom:2px">Następnym razem</div>${tips.slice(0, 5).join('')}</div>` : ''}
    <div class="spacer"></div>
    <button class="pb" data-a="saveSession">Gotowe</button>
    <div style="display:flex;justify-content:center;gap:16px"><button class="lnk" data-a="backToWork">Wróć do treningu</button><button class="lnk" data-a="discard">Odrzuć trening</button></div>
  </main>`;
};

// ---------- Zapisany trening ----------
screens.zapis = () => {
  const s = S.sessions.find(x => x.id === S.p.id); if (!s) return screens.tydzien();
  const ex = (s.exercises || []).map((e, i) => `<div class="sec" style="gap:8px;padding-top:10px"><div class="n" style="font-size:16px">${esc(EX[e.ex]?.name || e.ex)}</div>
    <div class="chips">${e.sets.map((st, j) => `<button class="chip" data-a="editSetSaved" data-i="${i}" data-j="${j}">${setTxt(EX[e.ex] || { unit: 'kg' }, st)} · ${FEEL[st.feel]?.label || ''}</button>`).join('')}</div></div>`).join('');
  const chk = s.checklist ? Object.entries(s.checklist).filter(([, v]) => v).length : 0;
  return `<main class="scr">
    <div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button></div>
    <div><h1 style="font-size:30px">${esc(s.title)}</h1><div class="mut sm" style="margin-top:6px">${fmtShort(parseKey(s.date))} · ${Math.max(1, Math.round(((s.endedAt || 0) - (s.startedAt || 0)) / 60000))} min${s.painAfter != null ? ` · lędźwia ${s.painAfter}` : ''}</div></div>
    ${ex}
    ${s.cond ? `<div class="sec" style="gap:4px"><div class="n" style="font-size:16px">${COND_VARIANTS[s.cond.variant]?.name || ''}</div><div class="mut sm">${s.cond.rounds} rund${s.cond.rpe ? ` · RPE ${s.cond.rpe}` : ''}</div></div>` : ''}
    ${chk ? `<div class="sec"><div class="mut sm">Odhaczone: ${chk}</div></div>` : ''}
    ${s.warmN || s.coolN ? `<div class="sec" style="gap:4px"><div class="sm">${s.warmN ? `Rozgrzewka ${drillsDone(Object.keys(s.warm || {}), s.warm)}/${s.warmN}` : ''}${s.warmN && s.coolN ? ' · ' : ''}${s.coolN ? `Rozciąganie ${drillsDone(Object.keys(s.cool || {}), s.cool)}/${s.coolN}` : ''}</div></div>` : ''}
    <div class="spacer"></div>
    <button class="sb" data-a="unmark" data-id="${s.id}">Oznacz jako niezrobiony</button>
  </main>`;
};

// ---------- Dieta ----------
screens.dieta = () => {
  const k = S.dietDate; const d = parseKey(k); const entries = foodOn(k); const tot = sumMacros(entries);
  const isToday = k === tKey();
  const meals = MEALS.map(([id, name]) => {
    const list = entries.filter(e => e.meal === id);
    const kc = sumMacros(list).kcal;
    return `<section class="sec" style="gap:0;padding-top:10px">
      <div class="row" style="height:40px"><b class="lb k" style="font-size:12px">${name}${list.length ? ` · ${fmtNum(kc)}` : ''}</b><button class="sq" style="width:36px;height:36px" data-a="addFood" data-meal="${id}" aria-label="Dodaj: ${name}">${ic('plus', 16, 2)}</button></div>
      ${list.map(e => `<button class="li" style="min-height:46px" data-a="editFood" data-id="${e.id}"><span>${esc(e.name)} <small style="display:inline">· ${fmtNum(e.grams)} g</small></span><span class="end">${fmtNum(macros(e).kcal)}</span></button>`).join('')}
    </section>`;
  }).join('');
  return `<main class="scr has-nav" style="gap:14px">
    <div class="row" style="align-items:flex-end">
      <h1>${isToday ? 'Dieta' : fmtShort(d)}</h1>
      <div style="display:flex;gap:4px"><button class="ib box" data-a="dietDay" data-d="-1" aria-label="Poprzedni dzień">${ic('back', 20)}</button><button class="ib box" data-a="dietDay" data-d="1" aria-label="Następny dzień" ${isToday ? 'disabled style="opacity:.3"' : ''}>${ic('next', 20)}</button></div>
    </div>
    <div class="grid2" style="gap:16px">
      <div><div class="n" style="font-size:30px;font-stretch:125%;line-height:1">${fmtNum(tot.kcal)}</div><div class="mut sm" style="margin-top:4px">/ ${fmtNum(S.settings.kcal)} kcal</div><div class="bar t3" style="margin-top:8px"><i style="width:${pct(tot.kcal, S.settings.kcal)}%"></i></div></div>
      <div><div class="n" style="font-size:30px;font-stretch:125%;line-height:1">${fmtNum(tot.p)} g</div><div class="mut sm" style="margin-top:4px">/ ${fmtNum(S.settings.protein)} g białka</div><div class="bar t3" style="margin-top:8px"><i style="width:${pct(tot.p, S.settings.protein)}%"></i></div></div>
    </div>
    <div class="mut sm" style="margin-top:-4px">W ${fmtNum(tot.c)} g · T ${fmtNum(tot.f)} g</div>
    ${meals}
  </main>${nav('dieta')}`;
};

// ---------- Dodaj ----------
function allLocalProducts() { const ids = new Set(S.products.map(p => p.id)); return [...S.products, ...BASE.filter(b => !ids.has(b.id))]; }
function productById(id) { return S.products.find(p => p.id === id) || BASE.find(p => p.id === id) || S.offResults.find(p => p.id === id) || (S.p.prod && S.p.prod.id === id ? S.p.prod : null); }
function prodRow(p) {
  const g = p.lastGrams || p.portions?.[0] || 100; const m = macros({ grams: g, per100: p.per100 });
  return `<div class="li" style="grid-template-columns:1fr 44px;min-height:58px"><button style="background:none;border:0;padding:0;text-align:left;font-size:15px;line-height:1.25" data-a="pickProd" data-id="${esc(p.id)}">${esc(p.name)}<small>${fmtNum(g)} g · ${fmtNum(m.kcal)} kcal · ${fmtNum(m.p)} g białka</small></button>
    <button class="sq" data-a="quickAdd" data-id="${esc(p.id)}" aria-label="Dodaj ${esc(p.name)}">${ic('plus', 16, 2)}</button></div>`;
}
screens.dodaj = () => {
  const meal = S.p.meal || mealNow(); const mealName = MEALS.find(m => m[0] === meal)[1];
  const q = S.q.trim().toLowerCase();
  let body;
  if (q) {
    const loc = allLocalProducts().filter(p => p.name.toLowerCase().includes(q)).slice(0, 12);
    body = `${loc.map(prodRow).join('')}
      ${S.offState === 'loading' ? '<div class="empty">Szukam…</div>' : S.offState === 'error' ? '<div class="empty">Wyszukiwarka bazy nie odpowiada. Zeskanuj kod albo dodaj produkt.</div>' : S.offResults.map(prodRow).join('') || (q.length >= 3 && S.offState === 'ok' && !loc.length ? '<div class="empty">Nic nie znaleziono.</div>' : '')}`;
  } else {
    let list;
    if (S.tab === 'ostatnie') list = S.products.filter(p => p.lastUsed).sort((a, b) => b.lastUsed - a.lastUsed).slice(0, 20);
    else if (S.tab === 'moje') list = S.products.filter(p => p.source === 'own');
    else list = BASE;
    body = `<div class="tabs">${[['ostatnie', 'Ostatnie'], ['moje', 'Moje'], ['baza', 'Podstawowe']].map(([id, l]) => `<button class="${S.tab === id ? 'on' : ''}" data-a="tab" data-t="${id}">${l}</button>`).join('')}</div>
      <div>${list.map(prodRow).join('') || '<div class="empty">Pusto.</div>'}</div>`;
  }
  return `<main class="scr" style="gap:14px">
    <div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button><span style="font-size:14px;font-weight:600">${mealName}</span><span style="width:44px"></span></div>
    <label class="input">${ic('search', 18, 1.8)}<input type="search" id="q" data-in="q" placeholder="Szukaj produktu" aria-label="Szukaj produktu" value="${esc(S.q)}" autocomplete="off"></label>
    <div class="grid2" style="gap:8px"><button class="pb mid" data-a="scan">${ic('scan', 20)}Skanuj kod</button><button class="sb" style="height:52px" data-a="newProd">${ic('plus', 16, 2)}Nowy produkt</button></div>
    ${body}
  </main>`;
};

// ---------- Ilość ----------
screens.ilosc = () => {
  const editing = S.p.entryId ? S.food.find(f => f.id === S.p.entryId) : null;
  const prod = editing ? { id: editing.productId, name: editing.name, per100: editing.per100, portions: (productById(editing.productId)?.portions) || [] } : productById(S.p.id);
  if (!prod) return screens.dodaj();
  if (S.g == null) S.g = editing ? editing.grams : (prod.lastGrams || prod.portions?.[0] || 100);
  const g = S.g; const m = macros({ grams: g, per100: prod.per100 });
  const k = editing ? editing.date : S.dietDate; const tot = sumMacros(foodOn(k).filter(f => !editing || f.id !== editing.id));
  const portions = [...new Set([...(prod.portions || []), prod.lastGrams, 100].filter(Boolean))].slice(0, 4);
  const meal = editing ? editing.meal : (S.p.meal || mealNow()); const mealName = MEALS.find(x => x[0] === meal)[1];
  return `<main class="scr">
    <div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button></div>
    <div><div class="h2">${esc(prod.name)}</div><div class="mut sm" style="margin-top:6px">100 g: ${fmtNum(prod.per100.kcal)} kcal · ${fmtNum(prod.per100.p, 1)} g białka</div></div>
    <div class="tiles" style="grid-template-columns:repeat(2,minmax(0,1fr))">${portions.map(x => `<button class="tile ${g === x ? 'on' : ''}" style="font-size:15px" data-a="grams" data-g="${x}">${fmtNum(x)} g</button>`).join('')}</div>
    <div class="row" style="border-top:1px solid var(--line2);border-bottom:1px solid var(--line2);padding:16px 0">
      <button class="sq lg" data-a="gStep" data-d="-10" aria-label="Minus 10 g">${ic('minus', 18, 2)}</button>
      <span class="n" style="font-size:52px;font-stretch:125%;line-height:1">${fmtNum(g)}<span style="font-size:22px"> g</span></span>
      <button class="sq lg" data-a="gStep" data-d="10" aria-label="Plus 10 g">${ic('plus', 18, 2)}</button>
    </div>
    <div class="grid4">${[['kcal', m.kcal], ['białko', m.p], ['węgle', m.c], ['tłuszcz', m.f]].map(([l, v]) => `<div><div class="n" style="font-size:24px;line-height:1">${fmtNum(v)}</div><div class="mut sm" style="margin-top:4px">${l}</div></div>`).join('')}</div>
    <div class="panel" style="font-size:14px"><strong>${fmtNum(tot.kcal + m.kcal)} / ${fmtNum(S.settings.kcal)} kcal · ${fmtNum(tot.p + m.p)} / ${fmtNum(S.settings.protein)} g</strong></div>
    <div class="spacer"></div>
    ${editing ? `<div style="display:grid;grid-template-columns:1fr 2fr;gap:8px"><button class="sb" style="height:56px" data-a="delFood" data-id="${editing.id}">Usuń</button><button class="pb" data-a="saveFood" data-id="${editing.id}">Zapisz</button></div>`
      : `<button class="pb" data-a="addEntry" data-id="${esc(prod.id)}">Dodaj · ${mealName.toLowerCase()}</button>`}
  </main>`;
};

// ---------- Postęp ----------
function chart(points, { w = 350, h = 150 } = {}) {
  if (points.length < 2) return '';
  const ys = points.map(p => p.y); let mn = Math.min(...ys), mx = Math.max(...ys); if (mx - mn < 1) { mx += 0.5; mn -= 0.5; }
  const X = i => (i / (points.length - 1)) * (w - 8) + 4; const Y = v => h - 12 - ((v - mn) / (mx - mn)) * (h - 32);
  const pts = points.map((p, i) => `${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const l = points[points.length - 1];
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Wykres: od ${fmtNum(points[0].y, 1)} do ${fmtNum(l.y, 1)}">
    <line x1="0" y1="${h - 2}" x2="${w}" y2="${h - 2}" stroke="currentColor" stroke-width="1"/>
    <line x1="0" y1="${Y(mx)}" x2="${w}" y2="${Y(mx)}" stroke="var(--line)" stroke-width="1"/>
    <text x="0" y="${Y(mx) - 4}" font-size="11" fill="var(--mut)">${fmtNum(mx, 1)}</text><text x="0" y="${Y(mn) + 14}" font-size="11" fill="var(--mut)">${fmtNum(mn, 1)}</text>
    <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="${X(points.length - 1)}" cy="${Y(l.y)}" r="4" fill="var(--accent)"/></svg>`;
}
screens.postep = () => {
  const tabs = `<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))">${[['sila', 'Siła'], ['waga', 'Waga']].map(([id, l]) => `<button class="${S.progTab === id ? 'on' : ''}" data-a="progTab" data-t="${id}">${l}</button>`).join('')}</div>`;
  let body;
  if (S.progTab === 'waga') {
    const ks = Object.keys(S.days).filter(k => S.days[k]?.weight).sort().slice(-60);
    const pts = ks.map(k => ({ y: S.days[k].weight }));
    const lastW = pts.length ? pts[pts.length - 1].y : null;
    const delta = pts.length > 1 ? lastW - pts[0].y : null;
    body = `<div class="row" style="align-items:baseline"><span class="n" style="font-size:30px;font-stretch:125%">${lastW != null ? fmtNum(lastW, 1) + ' kg' : '–'}</span>
      ${delta != null ? `<strong style="font-size:15px">${delta >= 0 ? '+' : '−'}${fmtNum(Math.abs(delta), 1)} kg</strong>` : ''}</div>
      ${chart(pts)}
      <button class="pb mid" data-a="weighIn">${ic('plus', 16, 2)}Waga</button>
      ${ks.length ? `<div>${ks.slice(-5).reverse().map(k => `<div class="li" style="min-height:44px"><span class="mut sm">${fmtShort(parseKey(k))}</span><strong class="n" style="font-size:15px">${fmtNum(S.days[k].weight, 1)} kg</strong></div>`).join('')}</div>` : ''}`;
  } else {
    const used = new Set(); S.sessions.forEach(s => (s.exercises || []).forEach(e => e.sets?.length && EX[e.ex] && used.add(e.ex)));
    const order = [...MAIN_LIFTS.filter(x => used.has(x)), ...[...used].filter(x => !MAIN_LIFTS.includes(x))];
    body = order.length ? `<div style="border-top:1px solid var(--line2)">${order.map(id => {
      const b = bestSet(id, S.sessions); const ex = EX[id]; if (!b) return '';
      return `<button class="li" data-a="hist" data-ex="${id}" style="grid-template-columns:1fr auto 20px"><span>${esc(ex.name)}</span><strong class="n" style="font-size:16px">${setTxt(ex, b.set)}</strong>${ic('next', 18)}</button>`;
    }).join('')}</div>` : '<div class="empty">Pusto.</div>';
  }
  return `<main class="scr has-nav"><h1>Postęp</h1>${tabs}${body}</main>${nav('postep')}`;
};

// ---------- Historia ćwiczenia ----------
screens.historia = () => {
  const id = S.p.ex; const ex = EX[id];
  const rows = [];
  S.sessions.slice().reverse().forEach(s => (s.exercises || []).forEach(e => { if (e.ex === id && e.sets?.length) rows.push({ s, e }); }));
  const pts = rows.map(r => ({ y: Math.max(...r.e.sets.map(st => e1rm(st, ex.unit))) }));
  const b = bestSet(id, S.sessions);
  return `<main class="scr">
    <div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button></div>
    <div class="h2">${esc(ex.name)}</div>
    ${b ? `<div class="grid2 sec" style="display:grid;gap:0"><div><div class="n" style="font-size:24px;font-stretch:125%;line-height:1">${setTxt(ex, b.set)}</div><div class="mut sm" style="margin-top:4px">najlepsza</div></div>
      ${ex.unit === 'kg' && b.set.kg > 0 ? `<div><div class="n" style="font-size:24px;font-stretch:125%;line-height:1">${fmtNum(b.v)} kg</div><div class="mut sm" style="margin-top:4px">szac. max</div></div>` : ''}</div>` : ''}
    ${chart(pts)}
    <div>${rows.slice().reverse().map(({ s, e }) => { const top = e.sets.reduce((a, st) => (e1rm(st, ex.unit) > e1rm(a, ex.unit) ? st : a)); return `<button class="li" data-a="viewSes" data-id="${s.id}" style="grid-template-columns:72px 1fr auto;min-height:52px"><span class="mut sm">${fmtShort(parseKey(s.date))}</span><span class="sm">${e.sets.length} serie</span><strong class="n" style="font-size:14px">${setTxt(ex, top)}</strong></button>`; }).join('')}</div>
  </main>`;
};

// ================= ARKUSZE =================
function kgTilesHtml(base, inc, sel, tgt, act = 'shKg') {
  const tiles = [-2, -1, 0, 1, 2].map(i => Math.max(0, Math.round((base + i * inc) * 4) / 4));
  return `<div class="tiles" style="grid-template-columns:repeat(5,minmax(0,1fr))">${tiles.map(v => `<button class="tile ${sel === v ? 'on' : ''} ${v === tgt ? 'tg' : ''}" data-a="${act}" data-v="${v}">${fmtKg(v)}</button>`).join('')}</div>
    <div class="row"><button class="lnk" style="text-decoration:none" data-a="shKgStep" data-d="-1">− 1 kg</button><button class="lnk" style="text-decoration:none" data-a="shKgStep" data-d="1">+ 1 kg</button></div>`;
}
function repTilesHtml(base, step, sel, tgt) {
  const tiles = [-4, -3, -2, -1, 0, 1, 2].map(i => Math.max(1, base + i * step));
  return `<div class="tiles" style="grid-template-columns:repeat(7,minmax(0,1fr))">${tiles.map(v => `<button class="tile ${sel === v ? 'on' : ''} ${v === tgt ? 'tg' : ''}" style="font-size:15px" data-a="shReps" data-v="${v}">${v}</button>`).join('')}</div>`;
}
function stepper(label, val, act, txt) {
  return `<div class="st" style="grid-template-columns:1fr 44px 80px 44px"><span class="t">${label}</span><button class="sq" data-a="${act}" data-d="-1" aria-label="${label} mniej">${ic('minus', 16, 2)}</button><span class="v">${txt ?? val}</span><button class="sq" data-a="${act}" data-d="1" aria-label="${label} więcej">${ic('plus', 16, 2)}</button></div>`;
}
function sheetHtml() {
  const sh = S.sheet; if (!sh) return '';
  let inner = '';
  if (sh.type === 'other' || sh.type === 'editSet') {
    const ex = EX[sh.ex]; const inc = ex.inc || 2; const step = ex.unit === 's' ? 5 : 1;
    inner = `<div class="row" style="align-items:flex-end"><div class="h2" style="font-size:24px">${sh.type === 'editSet' ? `Seria ${sh.j + 1}` : esc(ex.name)}</div>${sh.tgt ? `<span class="mut sm">${setTxt(ex, sh.tgt)}</span>` : ''}</div>
      ${ex.unit === 'kg' ? `<div class="field"><span class="lb k">kg</span>${kgTilesHtml(sh.kg ?? sh.tgt?.kg ?? ex.start ?? 0, inc, sh.kg, sh.tgt?.kg)}</div>` : ''}
      <div class="field"><span class="lb k">${ex.unit === 's' ? 'Sekundy' : ex.repsLabel === 'm' ? 'Metry' : 'Powtórzenia'}</span>${repTilesHtml(sh.tgt?.reps ?? sh.reps, step, sh.reps, sh.tgt?.reps)}</div>
      ${sh.type === 'other'
        ? `<div class="feel3">${['easy', 'ok', 'hard'].map(f => `<button data-a="logOther" data-f="${f}" ${ex.unit === 'kg' && sh.kg == null ? 'disabled style="opacity:.35"' : ''}>${FEEL[f].label}</button>`).join('')}</div>`
        : `<div class="feel3">${['easy', 'ok', 'hard'].map(f => `<button data-a="shFeel" data-f="${f}" style="${sh.feel === f ? 'background:var(--inv-bg);color:var(--inv-ink)' : ''}">${FEEL[f].label}</button>`).join('')}</div>
           <div style="display:grid;grid-template-columns:1fr 2fr;gap:8px"><button class="sb" style="height:56px" data-a="setDelete">Usuń serię</button><button class="pb" data-a="setSave">Zapisz</button></div>`}`;
  } else if (sh.type === 'exList') {
    const a = S.active;
    const dEntry = k => { const ids = k === 'warm' ? a.warmList : a.coolList; if (!ids?.length) return ''; return `<div class="li" style="grid-template-columns:1fr"><button style="background:none;border:0;padding:0;text-align:left;font-size:15px;font-weight:${a.stage === k ? 650 : 500}" data-a="jumpDrills" data-k="${k}">${k === 'warm' ? 'Rozgrzewka' : 'Rozciąganie'}<small>${drillsDone(ids, a[k])}/${ids.length}</small></button></div>`; };
    inner = `<div class="h2" style="font-size:24px">Ćwiczenia</div><div>${dEntry('warm')}${a.items.map((it, i) => { const n = (a.done[i] || []).length; return `<div class="li" style="grid-template-columns:1fr auto auto"><button style="background:none;border:0;padding:0;text-align:left;font-size:15px;font-weight:${i === a.idx ? 650 : 500}" data-a="jump" data-i="${i}">${esc(EX[it.ex].name)}<small>${n}/${it.sets}${n >= it.sets ? ' ✓' : ''}</small></button>
      <button class="sq" data-a="moveActive" data-i="${i}" data-d="-1" aria-label="W górę">${ic('up', 16, 2)}</button><button class="sq" data-a="moveActive" data-i="${i}" data-d="1" aria-label="W dół">${ic('down', 16, 2)}</button></div>`; }).join('')}${dEntry('cool')}</div>
      <button class="sb" data-a="addExOpen" data-ctx="active">${ic('plus', 14, 2)}Dodaj ćwiczenie</button>
      <button class="lnk" data-a="discard">Odrzuć trening</button>`;
  } else if (sh.type === 'drillInfo') {
    const pl = plan(Number(S.p.w), S.p.dk); const ids = (sh.k === 'warm' ? pl.warm : pl.cool) || [];
    inner = `<div class="h2" style="font-size:24px">${sh.k === 'warm' ? 'Rozgrzewka' : 'Rozciąganie'}</div>
      <div>${ids.map(id => { const d = DRILLS[id]; return `<div class="sec" style="gap:4px;padding:12px 0"><div class="row" style="align-items:baseline"><b style="font-weight:600">${nb(d.name)}</b><span class="sm" style="text-align:right">${nb(d.dose)}</span></div><div class="sm mut" style="line-height:1.45">${nb(d.how)}</div></div>`; }).join('')}</div>`;
  } else if (sh.type === 'rest') {
    inner = `<div class="h2" style="font-size:24px">Przerwa</div><div class="tiles" style="grid-template-columns:repeat(3,minmax(0,1fr))">${[45, 60, 90, 120, 150, 180, 210, 240, 300].map(v => `<button class="tile ${sh.v === v ? 'on' : ''}" style="font-size:15px" data-a="restSet" data-v="${v}">${fmtClock(v)}</button>`).join('')}</div>`;
  } else if (sh.type === 'editItem') {
    const items = baseItems(Number(S.p.w), S.p.dk, cfg()); const it = items[sh.i]; const ex = EX[it.ex];
    inner = `<div class="h2" style="font-size:24px">${esc(ex.name)}</div>
      <div style="border-top:1px solid var(--line2)">${stepper('Serie', it.sets, 'itSets')}${stepper(ex.unit === 's' ? 'Sekundy' : ex.repsLabel === 'm' ? 'Metry' : 'Powtórzenia', it.reps, 'itReps')}${stepper('Przerwa', it.rest, 'itRest', fmtClock(it.rest))}</div>
      <div class="grid2" style="gap:8px"><button class="sb" data-a="swapOpen" data-i="${sh.i}">${ic('swap', 14, 2)}Zamień</button><button class="sb" data-a="itRemove">${ic('trash', 14, 2)}Usuń</button></div>`;
  } else if (sh.type === 'swap') {
    const items = baseItems(Number(S.p.w), S.p.dk, cfg()); const exId = items[sh.i].ex;
    inner = `<div class="h2" style="font-size:24px">Zamień</div><div>${alternatives(exId).map(id => `<button class="li" data-a="swapTo" data-id="${id}"><span>${esc(EX[id].name)}</span>${ic('next', 18)}</button>`).join('') || '<div class="empty">Brak zamienników.</div>'}</div>`;
  } else if (sh.type === 'addEx') {
    const groups = {}; Object.entries(EX).forEach(([id, e]) => { (groups[e.p] = groups[e.p] || []).push(id); });
    inner = `<div class="row"><div class="h2" style="font-size:24px">Dodaj ćwiczenie</div><button class="sb sm" data-a="newExOpen">${ic('plus', 14, 2)}Nowe</button></div>
      ${Object.keys(PATTERN_NAMES).filter(p => groups[p]).map(p => `<div><div class="lb k" style="margin:6px 0 2px">${PATTERN_NAMES[p]}</div>${groups[p].map(id => `<button class="li" style="min-height:48px" data-a="addExPick" data-id="${id}"><span>${esc(EX[id].name)}</span>${ic('plus', 16, 2)}</button>`).join('')}</div>`).join('')}`;
  } else if (sh.type === 'newEx') {
    inner = `<div class="h2" style="font-size:24px">Nowe ćwiczenie</div>
      <label class="field"><span class="lb k">Nazwa</span><input type="text" id="neName" value="${esc(sh.name || '')}"></label>
      <div class="seg" style="grid-template-columns:repeat(3,minmax(0,1fr))">${[['kg', 'Ciężar'], ['bw', 'Masa ciała'], ['s', 'Czas']].map(([u, l]) => `<button class="${(sh.unit || 'kg') === u ? 'on' : ''}" data-a="neUnit" data-u="${u}">${l}</button>`).join('')}</div>
      ${sh.err ? `<div class="sm" style="font-weight:600">${esc(sh.err)}</div>` : ''}
      <button class="pb" data-a="neSave">Zapisz</button>`;
  } else if (sh.type === 'settings') {
    const s = S.settings;
    inner = `<div class="h2" style="font-size:24px">Ustawienia</div>
      <label class="field"><span class="lb k">Start planu</span><input type="date" id="setStart" value="${s.startDate}"></label>
      <div class="grid2"><label class="field"><span class="lb k">Kalorie</span><input type="number" inputmode="numeric" id="setKcal" value="${s.kcal}"></label><label class="field"><span class="lb k">Białko, g</span><input type="number" inputmode="numeric" id="setProt" value="${s.protein}"></label></div>
      <label class="field"><span class="lb k">Suplementy</span><input type="text" id="setSupps" value="${esc(s.supps.join(', '))}"></label>
      <button class="pb mid" data-a="saveSettings">Zapisz</button>
      <div class="sec" style="gap:8px"><span class="lb k">Kopia</span><div class="grid2" style="gap:8px"><button class="sb" data-a="export">Zapisz kopię</button><label class="sb" style="cursor:pointer">Wczytaj<input type="file" accept="application/json,.json" id="importFile" style="display:none"></label></div></div>
      <div class="mut sm">Wersja ${APP_VERSION}</div>`;
  } else if (sh.type === 'weigh') {
    inner = `<div class="h2" style="font-size:24px">Waga</div>
      <div class="row" style="border-top:1px solid var(--line2);border-bottom:1px solid var(--line2);padding:16px 0">
        <button class="sq lg" data-a="wStep" data-d="-0.1" aria-label="Minus 0,1 kg">${ic('minus', 18, 2)}</button>
        <span class="n" style="font-size:52px;font-stretch:125%;line-height:1">${fmtNum(sh.w, 1)}<span style="font-size:22px"> kg</span></span>
        <button class="sq lg" data-a="wStep" data-d="0.1" aria-label="Plus 0,1 kg">${ic('plus', 18, 2)}</button></div>
      <div class="grid4">${[-1, -0.5, 0.5, 1].map(d => `<button class="sb" data-a="wStep" data-d="${d}">${d > 0 ? '+' : '−'}${fmtNum(Math.abs(d), 1)}</button>`).join('')}</div>
      <button class="pb" data-a="saveWeight">Zapisz</button>`;
  } else if (sh.type === 'newProd') {
    inner = `<div class="h2" style="font-size:24px">Nowy produkt</div>
      <label class="field"><span class="lb k">Nazwa</span><input type="text" id="npName" value="${esc(sh.name || '')}"></label>
      <div class="lb k">Na 100 g</div>
      <div class="grid2"><label class="field"><span class="lb k">Kcal</span><input type="number" inputmode="decimal" id="npKcal"></label><label class="field"><span class="lb k">Białko</span><input type="number" inputmode="decimal" id="npP"></label>
      <label class="field"><span class="lb k">Węglowodany</span><input type="number" inputmode="decimal" id="npC"></label><label class="field"><span class="lb k">Tłuszcz</span><input type="number" inputmode="decimal" id="npF"></label></div>
      <label class="field"><span class="lb k">Porcja, g</span><input type="number" inputmode="numeric" id="npPort"></label>
      <button class="pb" data-a="saveNewProd">Zapisz</button>`;
  } else if (sh.type === 'scan') {
    inner = `<div class="h2" style="font-size:24px">Kod kreskowy</div>
      ${sh.camera ? `<video class="scan" id="scanVideo" playsinline muted></video>` : ''}
      <label class="field"><span class="lb k">Numer spod kodu</span><input type="text" inputmode="numeric" id="ean" placeholder="5900000000000"></label>
      ${sh.err ? `<div class="sm" style="font-weight:600">${esc(sh.err)}</div>` : ''}
      <button class="pb" data-a="eanGo">${sh.busy ? 'Szukam…' : 'Szukaj'}</button>`;
  }
  return `<div class="sheet-wrap" data-a="closeSheet"><div class="sheet" role="dialog" aria-modal="true" data-stop="1"><div class="grab"></div>${inner}</div></div>`;
}

// ================= RENDER =================
function render() {
  const fn = screens[S.route] || screens.dzis;
  const focusedId = document.activeElement?.id; const selStart = document.activeElement?.selectionStart;
  const sheetScroll = document.querySelector('.sheet')?.scrollTop;
  app.innerHTML = fn() + sheetHtml() + (S.toast ? `<div class="toast" role="status"><span>${esc(S.toast.msg)}</span>${S.toast.undo ? '<button data-a="undo">Cofnij</button>' : ''}</div>` : '');
  if (sheetScroll) { const sh = document.querySelector('.sheet'); if (sh) sh.scrollTop = sheetScroll; }
  if (focusedId) { const el = document.getElementById(focusedId); if (el) { el.focus(); try { el.setSelectionRange(selStart, selStart); } catch (e) { } } }
  tick();
  if (S.sheet?.type === 'scan' && S.sheet.camera) startCamera();
}

function tick() {
  const a = S.active; if (!a) return;
  document.querySelectorAll('[data-tick]').forEach(el => {
    const t = el.dataset.tick;
    if (t === 'elapsed') el.textContent = fmtClock((Date.now() - a.startedAt) / 1000);
    if (t === 'rest') el.textContent = fmtClock(Math.max(0, (a.restUntil - Date.now()) / 1000));
    if (t === 'restbar') el.style.width = `${Math.min(100, 100 - ((a.restUntil - Date.now()) / 1000 / a.restTotal) * 100)}%`;
    if (t === 'dt' && S.dt) el.textContent = fmtClock(Math.max(0, (S.dt.until - Date.now()) / 1000));
    if (t === 'cond') el.textContent = fmtClock(condLeft());
    if (t === 'condbar' && a.cond) { const tot = a.cond.total || 1; el.style.width = `${Math.min(100, 100 - (condLeft() / tot) * 100)}%`; }
  });
  if (S.dt && Date.now() >= S.dt.until) { S.dt = null; beep(3); render(); }
  if (S.route === 'przerwa' && a.restUntil && Date.now() >= a.restUntil) { a.restUntil = null; beep(2); go('seria', {}, true); saveActive(); }
  if (S.route === 'interwaly' && a.cond && !a.cond.paused && !a.cond.finished && Date.now() >= a.cond.until) condAdvance();
}
setInterval(tick, 250);

// ================= TRENING: logika =================
async function startSession(dk, w) {
  const pl = plan(w, dk);
  const items = pl.items.map(it => ({ ...it, target: targetFor(it, S.sessions, w) }));
  S.active = { id: uid(), date: tKey(), dayKey: dk, week: w, title: pl.title, type: pl.type, startedAt: Date.now(), items, idx: 0, done: {}, condPlan: pl.cond || null, ...drillState(pl) };
  if (S.days[tKey()]?.off) { S.days[tKey()].off = false; saveDay(tKey()); }
  await saveActive(); keepScreen(true);
  S.active.stage === 'warm' ? go('drills', { k: 'warm' }, true) : go('seria', {}, true);
}
function drillState(pl) { const warmList = pl.warm || []; const coolList = pl.cool || []; return { warmList, coolList, warm: {}, cool: {}, stage: warmList.length ? 'warm' : 'main' }; }
function toCool() {
  const a = S.active;
  if (a.coolList?.length && a.stage !== 'cool' && a.stage !== 'done') { a.stage = 'cool'; saveActive(); go('drills', { k: 'cool' }, true); }
  else { a.stage = 'done'; saveActive(); go('koniec', {}, true); }
}
function nextUndone(fromI) {
  const a = S.active;
  const after = a.items.findIndex((x, j) => j > fromI && (a.done[j] || []).length < x.sets);
  if (after >= 0) return after;
  return a.items.findIndex((x, j) => j !== fromI && (a.done[j] || []).length < x.sets);
}
async function logSet(kg, reps, feel) {
  const snap = JSON.stringify(S.active);
  const a = S.active; const i = a.idx; const it = a.items[i]; const ex = EX[it.ex];
  (a.done[i] = a.done[i] || []).push({ kg: ex.unit === 'kg' ? kg : null, reps, feel, t: Date.now() });
  a.lastIdx = i;
  const undo = async () => { S.active = JSON.parse(snap); await saveActive(); go('seria', {}, true); };
  if (a.done[i].length >= it.sets) {
    const n = nextUndone(i);
    if (n < 0) { await saveActive(); afterStrength(); toast('Seria zapisana', undo); return; }
    a.idx = n;
  }
  a.restTotal = it.rest; a.restUntil = Date.now() + it.rest * 1000;
  S.sheet = null; await saveActive(); go('przerwa', {}, true); toast('Seria zapisana', undo);
}
function afterStrength() { const a = S.active; if (a.condPlan && !a.cond) return startCondFor(a.condPlan); toCool(); }
function startCondFor(variant) {
  const a = S.active;
  a.cond = { variant, round: 1, ph: 'pre', until: Date.now() + 10000, total: 10, paused: false, doneRounds: 0 };
  saveActive(); keepScreen(true); go('interwaly', {}, true);
}
function condAdvance() {
  const a = S.active; const c = a.cond; const v = COND_VARIANTS[c.variant];
  if (c.ph === 'pre') { c.ph = 'work'; c.total = v.work; c.until = Date.now() + v.work * 1000; beep(1); }
  else if (c.ph === 'work') {
    c.doneRounds = c.round;
    if (c.round >= v.rounds) { c.finished = true; beep(3); }
    else { c.ph = 'rest'; c.total = v.rest; c.until = Date.now() + v.rest * 1000; beep(2); }
  } else { c.round++; c.ph = 'work'; c.total = v.work; c.until = Date.now() + v.work * 1000; beep(1); }
  c.paused = false; saveActive(); render();
}
async function saveSession() {
  const a = S.active; if (!a) return;
  const ses = {
    id: a.id, date: a.date, dayKey: a.dayKey, week: a.week, title: a.title, type: a.type, startedAt: a.startedAt, endedAt: Date.now(),
    exercises: a.items.map((it, i) => ({ ex: it.ex, idx: it.idx, target: it.target, sets: a.done[i] || [] })).filter(e => e.sets.length),
    cond: a.cond ? { variant: a.cond.variant, rounds: a.cond.doneRounds || 0, rpe: a.cond.rpe ?? null } : null,
    painAfter: S.endPain, checklist: a.checklist || null,
    warm: a.warm || null, cool: a.cool || null, warmN: a.warmList?.length || 0, coolN: a.coolList?.length || 0,
  };
  await db.put('sessions', ses); S.sessions = [ses, ...S.sessions.filter(s => s.id !== ses.id)];
  S.active = null; S.endPain = null; await saveActive(); keepScreen(false);
  toast('Trening zapisany'); go('dzis', {}, true);
}
// edycja planu (zapisywana na stałe w ustawieniach)
async function editPlan(fn) {
  const w = Number(S.p.w); const key = `${variantOf(w)}:${S.p.dk}`;
  const items = baseItems(w, S.p.dk, cfg());
  fn(items);
  S.settings.edits = { ...S.settings.edits, [key]: items };
  await saveSettings(); render();
}

// ================= JEDZENIE: logika =================
let qTimer = null; let qAbort = null;
function onSearch(v) {
  S.q = v; clearTimeout(qTimer);
  if (v.trim().length < 3) { S.offResults = []; S.offState = ''; render(); return; }
  S.offState = 'loading'; render();
  qTimer = setTimeout(async () => {
    try { qAbort?.abort(); qAbort = new AbortController(); S.offResults = await searchOFF(v.trim(), qAbort.signal); S.offState = 'ok'; }
    catch (e) { if (e.name !== 'AbortError') { S.offState = 'error'; S.offResults = []; } }
    if (S.route === 'dodaj') render();
  }, 500);
}
async function rememberProduct(p, grams) {
  const ex = S.products.find(x => x.id === p.id);
  const rec = { ...(ex || {}), id: p.id, name: p.name, per100: p.per100, portions: p.portions || [], barcode: p.barcode, source: ex?.source || p.source, lastGrams: grams, lastUsed: Date.now() };
  await db.put('products', rec); S.products = [...S.products.filter(x => x.id !== p.id), rec];
}
async function addEntry(p, grams, meal) {
  const e = { id: uid(), date: S.dietDate, meal, name: p.name, grams, per100: p.per100, productId: p.id, t: Date.now() };
  await db.put('food', e); S.food.push(e); await rememberProduct(p, grams);
  return e;
}
const undoFood = e => async () => { await db.del('food', e.id); S.food = S.food.filter(f => f.id !== e.id); render(); };
let camStream = null; let scanLoop = null;
async function startCamera() {
  const v = document.getElementById('scanVideo'); if (!v || camStream) { if (v && camStream) { v.srcObject = camStream; v.play(); } return; }
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    v.srcObject = camStream; await v.play();
    const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
    scanLoop = setInterval(async () => {
      const vv = document.getElementById('scanVideo'); if (!vv || !S.sheet || S.sheet.type !== 'scan') { stopCamera(); return; }
      try { const r = await det.detect(vv); if (r[0]?.rawValue) { stopCamera(); lookupEan(r[0].rawValue); } } catch (e) { }
    }, 400);
  } catch (e) { S.sheet = { type: 'scan', camera: false }; render(); }
}
function stopCamera() { clearInterval(scanLoop); scanLoop = null; camStream?.getTracks().forEach(t => t.stop()); camStream = null; }
async function lookupEan(code) {
  code = String(code).replace(/\D/g, ''); if (code.length < 8) { S.sheet.err = 'Za krótki numer.'; render(); return; }
  const known = S.products.find(p => p.barcode === code);
  if (known) { S.sheet = null; S.g = null; go('ilosc', { id: known.id, meal: S.p.meal }); return; }
  S.sheet = { ...S.sheet, busy: true, err: null, camera: false }; render();
  try { const p = await byBarcode(code); S.sheet = null; S.g = null; go('ilosc', { id: p.id, meal: S.p.meal, prod: p }); }
  catch (e) { S.sheet = { type: 'scan', camera: false, err: e.message }; render(); }
}

// ================= AKCJE =================
const A = {
  nav: d => go(d.r),
  back: () => history.back(),
  undo: async () => { const u = S.toast?.undo; S.toast = null; clearTimeout(toastT); if (u) await u(); render(); },
  theme: async () => { S.settings.theme = S.settings.theme === 'dark' ? 'light' : 'dark'; applyTheme(); await saveSettings(); render(); },
  settings: () => { S.sheet = { type: 'settings' }; render(); },
  closeSheet: () => { stopCamera(); S.sheet = null; render(); },
  supp: async d => { const k = tKey(); S.days[k] = S.days[k] || {}; const s = S.days[k].supps = S.days[k].supps || {}; s[d.s] = !s[d.s]; await saveDay(k); render(); },
  dayOff: async () => { const k = tKey(); S.days[k] = { ...(S.days[k] || {}), off: true }; await saveDay(k); toast('Dziś wolne', async () => { S.days[k].off = false; await saveDay(k); }); },
  offUndo: async () => { const k = tKey(); S.days[k].off = false; await saveDay(k); render(); },
  open: d => go('podglad', { dk: d.dk, w: Number(d.w) }),
  gw: d => { S.gw = Math.max(1 - curWeek(), S.gw + Number(d.d)); render(); },
  gw0: () => { S.gw = 0; render(); },
  how: d => { S.open = { ...S.open, [d.id]: !S.open[d.id] }; render(); },
  drillInfo: d => { S.sheet = { type: 'drillInfo', k: d.k }; render(); },
  drillChk: async d => { const k = S.p.k === 'cool' ? 'cool' : 'warm'; const m = S.active[k] = S.active[k] || {}; m[d.id] = !m[d.id]; await saveActive(); render(); },
  drillTimer: d => { unlockAudio(); if (S.dt?.id === d.id) { S.dt = null; } else { S.dt = { id: d.id, until: Date.now() + DRILLS[d.id].t * 1000 }; keepScreen(true); } render(); },
  drillsNext: async () => {
    const a = S.active; S.dt = null;
    if (S.p.k === 'cool') { a.stage = 'done'; await saveActive(); return go('koniec', {}, true); }
    a.stage = 'main'; await saveActive();
    if (a.items.length) return go('seria', {}, true);
    if (a.condPlan) return startCondFor(a.condPlan);
    toCool();
  },
  jumpDrills: async d => { const a = S.active; a.stage = d.k; a.restUntil = null; S.sheet = null; await saveActive(); go('drills', { k: d.k }, true); },
  unmark: async d => {
    const s = S.sessions.find(x => x.id === d.id); if (!s) return;
    await db.del('sessions', d.id); S.sessions = S.sessions.filter(x => x.id !== d.id);
    go('tydzien', {}, true);
    toast('Oznaczony jako niezrobiony', async () => { await db.put('sessions', s); S.sessions = [s, ...S.sessions].sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0)); });
  },
  slot: d => {
    const w = Number(d.w); const ses = slotSession(w, d.dk);
    if (isActiveSlot(w, d.dk)) return A.resume();
    if (ses && plan(w, d.dk).items) return go('zapis', { id: ses.id });
    go('podglad', { dk: d.dk, w });
  },
  viewSes: d => go('zapis', { id: d.id }),
  resume: () => { const a = S.active; if (a.stage === 'warm' || a.stage === 'cool') { keepScreen(true); return go('drills', { k: a.stage }); } go(a.cond && !a.cond.finished ? 'interwaly' : a.cond && a.cond.rpe == null ? 'interwaly' : a.stage === 'done' ? 'koniec' : a.restUntil && a.restUntil > Date.now() ? 'przerwa' : a.items.length ? 'seria' : 'koniec'); keepScreen(true); },
  start: d => { unlockAudio(); if (S.active) { toast('Najpierw zakończ albo odrzuć trwający trening'); return; } startSession(d.dk, Number(d.w)); },
  editMode: () => { S.p.edit = !S.p.edit; render(); },
  // edycja planu
  editItem: d => { S.sheet = { type: 'editItem', i: Number(d.i) }; render(); },
  itSets: d => editPlan(items => { const it = items[S.sheet.i]; it.sets = Math.min(10, Math.max(1, it.sets + Number(d.d))); }),
  itReps: d => editPlan(items => { const it = items[S.sheet.i]; const st = EX[it.ex].unit === 's' ? 5 : 1; it.reps = Math.max(1, it.reps + Number(d.d) * st); }),
  itRest: d => editPlan(items => { const it = items[S.sheet.i]; it.rest = Math.min(600, Math.max(15, it.rest + Number(d.d) * 15)); }),
  itRemove: () => { const i = S.sheet.i; S.sheet = null; editPlan(items => items.splice(i, 1)); },
  moveItem: d => editPlan(items => { const i = Number(d.i); const j = i + Number(d.d); if (j < 0 || j >= items.length) return; [items[i], items[j]] = [items[j], items[i]]; }),
  swapOpen: d => { S.sheet = { type: 'swap', i: Number(d.i) }; render(); },
  swapTo: d => { const i = S.sheet.i; S.sheet = { type: 'editItem', i }; editPlan(items => { items[i].ex = d.id; }); },
  resetPlan: async () => {
    const w = Number(S.p.w); const key = `${variantOf(w)}:${S.p.dk}`; const old = S.settings.edits[key];
    const e = { ...S.settings.edits }; delete e[key]; S.settings.edits = e;
    const sw = { ...S.settings.swaps }; Object.keys(sw).forEach(k => { if (k.startsWith(key + ':')) delete sw[k]; }); S.settings.swaps = sw;
    await saveSettings(); toast('Plan przywrócony', async () => { S.settings.edits = { ...S.settings.edits, [key]: old }; await saveSettings(); });
  },
  addExOpen: d => { S.sheet = { type: 'addEx', ctx: d.ctx }; render(); },
  addExPick: d => addExercise(d.id),
  newExOpen: () => { S.sheet = { ...S.sheet, type: 'newEx', unit: 'kg' }; render(); },
  neUnit: d => { S.sheet.name = document.getElementById('neName')?.value || ''; S.sheet.unit = d.u; render(); },
  neSave: async () => {
    const name = (document.getElementById('neName')?.value || '').trim();
    if (!name) { S.sheet.err = 'Podaj nazwę.'; render(); return; }
    if (isBanned(name)) { S.sheet.err = 'Przysiadów i martwych ciągów nie dodajemy.'; S.sheet.name = name; render(); return; }
    const id = 'own_' + uid(); const u = S.sheet.unit || 'kg';
    const e = { name, p: 'wlasne', unit: u, inc: u === 'kg' ? 2.5 : undefined, start: u === 'kg' ? null : undefined, cue: '' };
    S.settings.customEx = { ...S.settings.customEx, [id]: e }; registerCustom({ [id]: e }); await saveSettings();
    addExercise(id);
  },
  // w trakcie
  chk: d => { S.p.chk = { ...(S.p.chk || slotSession(Number(S.p.w), S.p.dk)?.checklist || {}) }; S.p.chk[d.id] = !S.p.chk[d.id]; render(); },
  chkMin: d => { S.p.chk = { ...(S.p.chk || slotSession(Number(S.p.w), S.p.dk)?.checklist || {}) }; const m = Number(d.m); S.p.chk[d.id] = S.p.chk[d.id] === m ? false : m; render(); },
  pickCond: d => { S.p.cv = d.v; render(); },
  saveLight: async d => {
    const w = Number(d.w); const pl = plan(w, d.dk); const old = slotSession(w, d.dk);
    const chkNow = S.p.chk || old?.checklist || {};
    if (!Object.values(chkNow).some(Boolean) && !old?.cond) { if (old) return A.unmark({ id: old.id }); toast('Nic nie odhaczone'); return; }
    const ses = { id: old?.id || uid(), date: old?.date || tKey(), dayKey: d.dk, week: w, title: pl.title, type: pl.type, startedAt: old?.startedAt || Date.now(), endedAt: Date.now(), exercises: old?.exercises || [], cond: old?.cond || null, checklist: S.p.chk || old?.checklist || {} };
    await db.put('sessions', ses); S.sessions = [ses, ...S.sessions.filter(s => s.id !== ses.id)];
    go('dzis', {}, true);
    toast('Zapisane', async () => { if (old) { await db.put('sessions', old); S.sessions = [old, ...S.sessions.filter(s => s.id !== old.id)]; } else { await db.del('sessions', ses.id); S.sessions = S.sessions.filter(s => s.id !== ses.id); } });
  },
  startCond: d => {
    unlockAudio(); if (S.active) { toast('Najpierw zakończ albo odrzuć trwający trening'); return; }
    const w = Number(d.w); const pl = plan(w, d.dk);
    S.active = { id: uid(), date: tKey(), dayKey: d.dk, week: w, title: pl.title, type: pl.type, startedAt: Date.now(), items: [], idx: 0, done: {}, checklist: S.p.chk || {}, condPlan: S.p.cv || pl.condChoice[0], ...drillState(pl) };
    if (S.active.stage === 'warm') { saveActive(); keepScreen(true); return go('drills', { k: 'warm' }, true); }
    startCondFor(S.active.condPlan);
  },
  log: d => { unlockAudio(); const c = cur(); logSet(c.kg, c.reps, d.f); },
  other: () => { const c = cur(); S.sheet = { type: 'other', ex: c.it.ex, kg: c.kg ?? null, reps: c.reps, tgt: { kg: c.it.target.kg, reps: c.it.target.reps } }; render(); },
  shKg: d => { S.sheet.kg = Number(d.v); render(); },
  shKgStep: d => { const ex = EX[S.sheet.ex]; S.sheet.kg = Math.max(0, (S.sheet.kg ?? S.sheet.tgt?.kg ?? ex.start ?? 0) + Number(d.d)); render(); },
  shReps: d => { S.sheet.reps = Number(d.v); render(); },
  shFeel: d => { S.sheet.feel = d.f; render(); },
  logOther: d => { unlockAudio(); logSet(S.sheet.kg, S.sheet.reps, d.f); },
  editSet: d => { const i = Number(d.i), j = Number(d.j); const st = S.active.done[i][j]; S.sheet = { type: 'editSet', ctx: 'active', i, j, ex: S.active.items[i].ex, kg: st.kg, reps: st.reps, feel: st.feel }; render(); },
  editSetSaved: d => { const s = S.sessions.find(x => x.id === S.p.id); const i = Number(d.i), j = Number(d.j); const st = s.exercises[i].sets[j]; S.sheet = { type: 'editSet', ctx: 'saved', i, j, ex: s.exercises[i].ex, kg: st.kg, reps: st.reps, feel: st.feel }; render(); },
  setSave: async () => {
    const sh = S.sheet; const v = { kg: sh.kg, reps: sh.reps, feel: sh.feel };
    if (sh.ctx === 'active') { Object.assign(S.active.done[sh.i][sh.j], v); await saveActive(); }
    else { const s = S.sessions.find(x => x.id === S.p.id); Object.assign(s.exercises[sh.i].sets[sh.j], v); await db.put('sessions', s); }
    S.sheet = null; render();
  },
  setDelete: async () => {
    const sh = S.sheet;
    if (sh.ctx === 'active') {
      const snap = JSON.stringify(S.active); S.active.done[sh.i].splice(sh.j, 1); await saveActive();
      S.sheet = null; toast('Seria usunięta', async () => { S.active = JSON.parse(snap); await saveActive(); });
    } else {
      const s = S.sessions.find(x => x.id === S.p.id); const snap = clone(s);
      s.exercises[sh.i].sets.splice(sh.j, 1); s.exercises = s.exercises.filter(e => e.sets.length); await db.put('sessions', s);
      S.sheet = null; toast('Seria usunięta', async () => { Object.assign(s, snap); await db.put('sessions', s); });
    }
  },
  setCount: async d => { const it = S.active.items[S.active.idx]; it.sets = Math.max(Math.max(1, (S.active.done[S.active.idx] || []).length), it.sets + Number(d.d)); await saveActive(); render(); },
  restOpen: () => { S.sheet = { type: 'rest', v: S.active.items[S.active.idx].rest }; render(); },
  restSet: async d => { S.active.items[S.active.idx].rest = Number(d.v); S.sheet = null; await saveActive(); render(); },
  skipEx: async () => { const n = nextUndone(S.active.idx); if (n < 0) { await saveActive(); return afterStrength(); } S.active.idx = n; await saveActive(); render(); },
  exList: () => { S.sheet = { type: 'exList' }; render(); },
  jump: async d => { S.active.idx = Number(d.i); S.active.restUntil = null; S.sheet = null; await saveActive(); go('seria', {}, true); },
  moveActive: async d => {
    const a = S.active; const i = Number(d.i); const j = i + Number(d.d); if (j < 0 || j >= a.items.length) return;
    [a.items[i], a.items[j]] = [a.items[j], a.items[i]]; const di = a.done[i], dj = a.done[j]; a.done[i] = dj || []; a.done[j] = di || [];
    if (a.idx === i) a.idx = j; else if (a.idx === j) a.idx = i; await saveActive(); render();
  },
  plus30: () => { S.active.restUntil += 30000; S.active.restTotal += 30; saveActive(); render(); },
  skipRest: () => { S.active.restUntil = null; saveActive(); go('seria', {}, true); },
  finish: () => toCool(),
  backToWork: () => { const a = S.active; if (a.stage === 'done') a.stage = a.items.length ? 'main' : 'cool'; A.resume(); },
  discard: async () => {
    const snap = S.active; S.active = null; S.sheet = null; await saveActive(); keepScreen(false); go('dzis', {}, true);
    toast('Trening odrzucony', async () => { S.active = snap; await saveActive(); });
  },
  delSes: async d => A.unmark(d),
  condPause: () => { const c = S.active.cond; if (c.paused) { c.until = Date.now() + c.left * 1000; c.paused = false; } else { c.left = condLeft(); c.paused = true; } saveActive(); render(); },
  condNext: () => condAdvance(),
  condEnd: () => { S.active.cond.finished = true; saveActive(); render(); },
  rpe: d => { S.active.cond.rpe = Number(d.n); saveActive(); toCool(); },
  pain: d => { S.endPain = Number(d.n); render(); },
  saveSession: () => saveSession(),
  // dieta
  addFood: d => { S.q = ''; S.offResults = []; S.offState = ''; S.tab = S.products.some(p => p.lastUsed) ? 'ostatnie' : 'baza'; go('dodaj', { meal: d.meal }); },
  dietDay: d => { const nd = addDays(parseKey(S.dietDate), Number(d.d)); if (dateKey(nd) > tKey()) return; S.dietDate = dateKey(nd); render(); },
  tab: d => { S.tab = d.t; render(); },
  pickProd: d => { S.g = null; go('ilosc', { id: d.id, meal: S.p.meal }); },
  quickAdd: async d => { const p = productById(d.id); const g = p.lastGrams || p.portions?.[0] || 100; const e = await addEntry(p, g, S.p.meal || mealNow()); toast(`${p.name} · ${fmtNum(g)} g`, undoFood(e)); },
  editFood: d => { S.g = null; go('ilosc', { entryId: d.id }); },
  grams: d => { S.g = Number(d.g); render(); },
  gStep: d => { S.g = Math.max(5, (S.g || 0) + Number(d.d)); render(); },
  addEntry: async d => { const p = productById(d.id); const e = await addEntry(p, S.g, S.p.meal || mealNow()); S.g = null; go('dieta', {}, true); toast(`${p.name} · ${fmtNum(e.grams)} g`, undoFood(e)); },
  saveFood: async d => { const e = S.food.find(f => f.id === d.id); e.grams = S.g; await db.put('food', e); S.g = null; history.back(); },
  delFood: async d => {
    const e = S.food.find(f => f.id === d.id); await db.del('food', d.id); S.food = S.food.filter(f => f.id !== d.id); S.g = null; history.back();
    setTimeout(() => toast('Usunięte', async () => { await db.put('food', e); S.food.push(e); }), 50);
  },
  scan: () => { S.sheet = { type: 'scan', camera: canScan() }; render(); },
  eanGo: () => lookupEan(document.getElementById('ean')?.value || ''),
  newProd: () => { S.sheet = { type: 'newProd', name: S.q }; render(); },
  saveNewProd: async () => {
    const v = id => parseFloat((document.getElementById(id)?.value || '').replace(',', '.'));
    const name = (document.getElementById('npName')?.value || '').trim();
    if (!name || isNaN(v('npKcal'))) { toast('Podaj nazwę i kalorie'); return; }
    const port = v('npPort');
    const p = { id: 'own:' + uid(), name, per100: { kcal: v('npKcal'), p: v('npP') || 0, c: v('npC') || 0, f: v('npF') || 0 }, portions: isNaN(port) ? [] : [port], source: 'own' };
    await db.put('products', p); S.products.push(p); S.sheet = null; S.g = null; go('ilosc', { id: p.id, meal: S.p.meal }, true);
  },
  // postęp
  progTab: d => { S.progTab = d.t; render(); },
  hist: d => go('historia', { ex: d.ex }),
  weighIn: () => { const ks = Object.keys(S.days).filter(k => S.days[k]?.weight).sort(); S.sheet = { type: 'weigh', w: ks.length ? S.days[ks[ks.length - 1]].weight : 78.5 }; render(); },
  wStep: d => { S.sheet.w = Math.round((S.sheet.w + Number(d.d)) * 10) / 10; render(); },
  saveWeight: async () => { const k = tKey(); const old = S.days[k]?.weight; S.days[k] = { ...(S.days[k] || {}), weight: S.sheet.w }; await saveDay(k); S.sheet = null; toast('Waga zapisana', async () => { S.days[k].weight = old; await saveDay(k); }); },
  // ustawienia
  saveSettings: async () => {
    const st = document.getElementById('setStart').value; const kc = Number(document.getElementById('setKcal').value); const pr = Number(document.getElementById('setProt').value);
    const sp = document.getElementById('setSupps').value.split(',').map(x => x.trim()).filter(Boolean);
    if (st) S.settings.startDate = dateKey(mondayOf(parseKey(st)));
    if (kc > 0) S.settings.kcal = kc; if (pr > 0) S.settings.protein = pr; S.settings.supps = sp;
    await saveSettings(); S.sheet = null; toast('Zapisano');
  },
  export: async () => {
    const data = await exportAll(); const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `trening-kopia-${tKey()}.json`; document.body.appendChild(a); a.click(); a.remove();
  },
};

async function addExercise(id) {
  const ex = EX[id]; const ctx = S.sheet?.ctx;
  const item = { ex: id, sets: 3, reps: ex.unit === 's' ? 30 : ex.repsLabel === 'm' ? 30 : 10, rest: 90 };
  if (ctx === 'active') {
    const a = S.active; a.items.push({ ...item, idx: a.items.length, target: targetFor(item, S.sessions, a.week) });
    a.idx = a.items.length - 1; S.sheet = null; await saveActive(); go('seria', {}, true);
  } else {
    S.sheet = null; await editPlan(items => items.push(item));
  }
}

app.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  if (el.dataset.a === 'closeSheet' && e.target.closest('[data-stop]')) return;
  const fn = A[el.dataset.a]; if (fn) { e.preventDefault(); fn(el.dataset, el); }
});
app.addEventListener('input', e => { if (e.target.dataset.in === 'q') onSearch(e.target.value); });
app.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ean') A.eanGo(); });
app.addEventListener('change', async e => {
  if (e.target.id === 'importFile' && e.target.files[0]) {
    try { const txt = await e.target.files[0].text(); await importAll(JSON.parse(txt)); await load(); S.sheet = null; toast('Kopia wczytana'); go('dzis', {}, true); }
    catch (err) { toast(err.message || 'Nie udało się wczytać kopii'); }
  }
});

// ================= START =================
(async () => {
  await load();
  history.replaceState({ route: 'dzis', p: {} }, '');
  if (S.active) keepScreen(true);
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadCtrl = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtrl && !reloaded) { reloaded = true; location.reload(); } });
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
      reg.update().catch(() => { });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => { }); });
    }).catch(() => { });
  }
})();
