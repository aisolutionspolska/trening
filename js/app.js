import { db, uid, exportAll, importAll } from './db.js';
import { EX, dayPlan, alternatives, phaseFor, DAY_KEYS, DAY_SHORT, DAY_LONG, COND_VARIANTS, MAIN_LIFTS } from './plan.js';
import { dateKey, parseKey, addDays, mondayOf, dayKeyOf, weekNumber, fmtDate, fmtShort, fmtNum, fmtKg, fmtClock,
  FEEL, targetFor, bestSet, e1rm, macros, sumMacros } from './logic.js';
import { BASE, searchOFF, byBarcode, canScan } from './food.js';

// ---------------- stan ----------------
const DEFAULTS = { kcal: 3050, protein: 155, supps: ['Kreatyna', 'Witamina D', 'Magnez'], theme: 'light', swaps: {} };
const S = {
  route: 'dzis', p: {}, settings: null, days: {}, sessions: [], food: [], products: [], active: null,
  sheet: null, toast: null, q: '', offResults: [], offState: '', tab: 'ostatnie', g: null, endPain: null,
  progTab: 'sila', dietDate: dateKey(),
};
const MEALS = [['sniadanie', 'Śniadanie'], ['obiad', 'Obiad'], ['kolacja', 'Kolacja'], ['przekaski', 'Przekąski']];
const app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function load() {
  const st = await db.get('kv', 'settings');
  S.settings = { ...DEFAULTS, ...(st || {}) };
  if (!S.settings.startDate) { S.settings.startDate = dateKey(mondayOf(new Date())); await saveSettings(); }
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
  scan: 'M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M13 8v8M17 8v8', gear: 'M12 9a3 3 0 100 6 3 3 0 000-6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  sun: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
};
const ic = (n, size = 22, w = 1.6) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="square" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const quads = n => `<span class="q" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= n ? 'f' : ''}"></i>`).join('')}</span>`;
const INT_LABEL = ['Wolne', 'Lekki', 'Średni', 'Ciężki'];

// ---------------- nawigacja ----------------
function go(route, p = {}, replace = false) {
  S.route = route; S.p = p; S.sheet = null;
  const st = { route, p };
  replace ? history.replaceState(st, '') : history.pushState(st, '');
  render(); window.scrollTo(0, 0);
}
window.addEventListener('popstate', e => { if (S.sheet) { S.sheet = null; render(); return; } const st = e.state || { route: 'dzis', p: {} }; S.route = st.route; S.p = st.p || {}; render(); });
function nav(active) {
  const it = (r, i, l) => `<button class="nv ${active === r ? 'on' : ''}" data-a="nav" data-r="${r}" aria-label="${l}">${ic(i)}${l}</button>`;
  return `<nav class="nav" aria-label="Główna nawigacja">${it('dzis', 'home', 'Dziś')}${it('tydzien', 'train', 'Trening')}${it('dieta', 'food', 'Dieta')}${it('postep', 'prog', 'Postęp')}</nav>`;
}
function toast(msg) { S.toast = msg; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = null; render(); }, 2400); }

// ---------------- pomocnicze: tydzień i dni ----------------
const today = () => new Date();
const curWeek = () => weekNumber(S.settings.startDate, today());
const sessionsOn = k => S.sessions.filter(s => s.date === k);
function planFor(date) { return dayPlan(weekNumber(S.settings.startDate, date), dayKeyOf(date), S.settings.swaps); }
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

// ---------- 01 Dziś ----------
screens.dzis = () => {
  const d = today(); const k = dateKey(d); const pl = planFor(d); const w = curWeek(); const ph = phaseFor(w);
  const done = sessionsOn(k)[0];
  const tot = sumMacros(foodOn(k));
  const supps = S.days[k]?.supps || {};
  const pct = (a, b) => Math.min(100, Math.round((a / b) * 100));
  let trainBtn;
  if (S.active) trainBtn = `<button class="pb split mid" data-a="resume">Wróć do treningu ${ic('arrow', 20)}</button>`;
  else if (done) trainBtn = `<div class="row"><span class="int">${ic('check', 16, 2.4)} Zrobione · ${Math.round(((done.endedAt || 0) - (done.startedAt || 0)) / 60000)} min</span><button class="sb sm" data-a="nav" data-r="tydzien">Tydzień</button></div>`;
  else trainBtn = `<button class="pb split mid" data-a="open" data-k="${k}">${pl.type === 'rest' ? 'Otwórz' : 'Zacznij trening'} ${ic('arrow', 20)}</button>`;
  const sub = pl.items ? `${pl.items.length} ćwiczeń · ok. ${pl.minutes}&nbsp;min` : `ok. ${pl.minutes}&nbsp;min`;
  return `<main class="scr has-nav">
    <div class="row" style="align-items:flex-start">
      <div><div class="lb">${DAY_LONG[dayKeyOf(d)]} · ${fmtDate(d)} · tydz. ${w}</div><h1 style="margin-top:6px">Dziś</h1></div>
      <div style="display:flex;gap:6px">
        <button class="ib box" data-a="theme" aria-label="${S.settings.theme === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}">${ic(S.settings.theme === 'dark' ? 'sun' : 'moon', 20)}</button>
        <button class="ib box" data-a="settings" aria-label="Ustawienia">${ic('gear', 20)}</button>
      </div>
    </div>
    <section class="sec">
      <div class="row"><span class="lb">Trening · ${ph.name}</span><span class="int">${quads(pl.intensity)}${INT_LABEL[pl.intensity]}</span></div>
      <div><div class="h2">${pl.title}</div><div class="mut sm" style="margin-top:4px">${sub}</div></div>
      ${trainBtn}
    </section>
    <section class="sec">
      <div class="row"><span class="lb">Jedzenie</span><button class="sb sm" data-a="addFood" data-meal="${mealNow()}">${ic('plus', 14, 2)}Posiłek</button></div>
      <div style="display:flex;flex-direction:column;gap:7px"><div class="row sm" style="align-items:baseline"><span style="font-size:14px">Kalorie</span><span style="font-size:14px"><strong class="n" style="font-size:20px">${fmtNum(tot.kcal)}</strong> / ${fmtNum(S.settings.kcal)} kcal</span></div><div class="bar"><i style="width:${pct(tot.kcal, S.settings.kcal)}%"></i></div></div>
      <div style="display:flex;flex-direction:column;gap:7px"><div class="row sm" style="align-items:baseline"><span style="font-size:14px">Białko</span><span style="font-size:14px"><strong class="n" style="font-size:20px">${fmtNum(tot.p)}</strong> / ${fmtNum(S.settings.protein)} g</span></div><div class="bar"><i style="width:${pct(tot.p, S.settings.protein)}%"></i></div></div>
    </section>
    ${S.settings.supps.length ? `<section class="sec" style="gap:0"><span class="lb" style="margin-bottom:2px">Suplementy</span>
      ${S.settings.supps.map(s => `<button class="chk" data-a="supp" data-s="${esc(s)}" aria-pressed="${!!supps[s]}"><span class="box ${supps[s] ? 'on' : ''}">${supps[s] ? ic('check', 16, 2.6) : ''}</span>${esc(s)}</button>`).join('')}
    </section>` : ''}
  </main>${nav('dzis')}`;
};
function mealNow() { const h = new Date().getHours(); return h < 11 ? 'sniadanie' : h < 16 ? 'obiad' : h < 21 ? 'kolacja' : 'przekaski'; }

// ---------- 04 Tydzień ----------
screens.tydzien = () => {
  const w = curWeek(); const ph = phaseFor(w); const mon = mondayOf(today()); const tk = dateKey(today());
  const inBlock = w <= 2 ? [w, 2] : w <= 6 ? [w - 2, 4] : w <= 11 ? [w - 6, 5] : [1, 1];
  const nextDeload = w < 6 ? 6 - w : w < 11 ? 11 - w : null;
  const rows = DAY_KEYS.map((dk, i) => {
    const d = addDays(mon, i); const k = dateKey(d); const pl = dayPlan(w, dk, S.settings.swaps); const done = sessionsOn(k).length > 0; const isT = k === tk;
    const sub = isT ? `Dziś · ok. ${pl.minutes} min` : pl.items ? `${pl.items.length} ćwiczeń · ok. ${pl.minutes} min` : `ok. ${pl.minutes} min`;
    return `<button class="li" data-a="open" data-k="${k}" style="grid-template-columns:52px 1fr auto;min-height:64px;${isT ? 'background:var(--inv-bg);color:var(--inv-ink);margin:0 -20px;padding:0 20px;width:calc(100% + 40px)' : ''}">
      <b class="n" style="font-size:15px">${DAY_SHORT[dk]}</b><span style="font-weight:600;font-size:16px">${pl.title}<small style="${isT ? 'color:var(--faint)' : ''}">${sub}</small></span>
      <span>${done ? ic('check', 18, 2.4) : quads(pl.intensity)}</span></button>`;
  }).join('');
  return `<main class="scr has-nav">
    <div><div class="lb">Tydzień ${w} · ${ph.name}</div><h1 style="margin-top:6px">Trening</h1></div>
    <div class="segs" aria-label="Postęp fazy">${Array.from({ length: inBlock[1] }, (_, i) => `<span class="${i + 1 < inBlock[0] ? 'd' : i + 1 === inBlock[0] ? 'c' : ''}"></span>`).join('')}</div>
    <div class="mut sm" style="margin-top:-8px">${ph.note ? ph.note + ' ' : ''}${nextDeload ? `Deload za ${nextDeload} ${nextDeload === 1 ? 'tydzień' : nextDeload < 5 ? 'tygodnie' : 'tygodni'}.` : ''}</div>
    <div style="border-top:1px solid var(--line2)">${rows}</div>
    <div class="mut sm">Kwadraty: intensywność dnia. Zrobione dni mają ✓. Możesz zrobić dowolny dzień.</div>
  </main>${nav('tydzien')}`;
};

// ---------- 05 Podgląd ----------
screens.podglad = () => {
  const d = parseKey(S.p.k); const pl = planFor(d);
  const head = `<div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button></div>
    <div><div class="lb">${DAY_LONG[pl.key]} · ${INT_LABEL[pl.intensity].toLowerCase()} · ok. ${pl.minutes} min · ${pl.phase.name}</div><h1 style="margin-top:6px;font-size:30px">${pl.title}</h1></div>`;
  if (pl.items) {
    const list = pl.items.map((it, i) => {
      const ex = EX[it.ex]; const t = targetFor(it, S.sessions);
      const tg = targetText(ex, it, t);
      const delta = t.reason === 'up' && ex.unit === 'kg' ? ` <strong>(+${fmtKg(t.kg - t.prevKg)})</strong>` : t.reason === 'down' ? ' <strong>(−)</strong>' : '';
      return `<div class="li" style="grid-template-columns:28px 1fr auto;min-height:62px"><span class="mut sm" style="font-weight:600">${String(i + 1).padStart(2, '0')}</span>
        <span style="font-weight:600;line-height:1.2">${ex.name}<small>${tg}${delta}</small></span>
        <button class="sb sm" style="border-color:var(--line)" data-a="swapOpen" data-slot="${it.slot}" data-ex="${it.ex}" aria-label="Zamień: ${ex.name}">${ic('swap', 13, 2)}Zamień</button></div>`;
    }).join('');
    const cond = pl.cond ? `<div class="li" style="grid-template-columns:28px 1fr;min-height:56px"><span class="mut sm" style="font-weight:600">+</span><span style="font-weight:600">${COND_VARIANTS[pl.cond].name}<small>po siłowni</small></span></div>` : '';
    return `<main class="scr">${head}<div style="border-top:1px solid var(--line2)">${list}${cond}</div>
      <div class="mut sm">W nawiasie: o ile więcej niż ostatnio. Ciężar rośnie sam, gdy ostatnio było „Łatwo” albo „W sam raz” na pełnych powtórzeniach.</div>
      <div class="spacer"></div><button class="pb split" data-a="start" data-k="${S.p.k}">Zacznij ${ic('arrow', 20)}</button></main>`;
  }
  // dni lekkie / kondycja / odpoczynek
  const doneSes = sessionsOn(S.p.k)[0];
  const chk = S.p.chk || doneSes?.checklist || {};
  const list = (pl.checklist || []).map(c => {
    const v = chk[c.id];
    const mins = c.minutes ? `<span class="chips" style="margin-left:auto">${c.minutes.map(m => `<button class="sb sm" style="${v === m ? 'background:var(--inv-bg);color:var(--inv-ink);border-color:var(--inv-bg)' : ''}" data-a="chkMin" data-id="${c.id}" data-m="${m}">${m}′</button>`).join('')}</span>` : '';
    return `<div class="chk" style="gap:10px"><button class="box ${v ? 'on' : ''}" style="background:${v ? 'var(--ink)' : 'none'}" data-a="chk" data-id="${c.id}" aria-label="${esc(c.label)}" aria-pressed="${!!v}">${v ? ic('check', 16, 2.6) : ''}</button><span>${c.label}</span>${mins}</div>`;
  }).join('');
  const condPick = pl.condChoice ? `<div class="field"><span class="lb k">Interwały · wybierz wariant</span><div class="tiles" style="grid-template-columns:repeat(${pl.condChoice.length},minmax(0,1fr))">
      ${pl.condChoice.map(v => `<button class="tile ${(S.p.cv || pl.condChoice[0]) === v ? 'on' : ''}" style="font-size:14px" data-a="pickCond" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="mut sm">${(() => { const c = COND_VARIANTS[S.p.cv || pl.condChoice[0]]; return `${c.name}: ${c.rounds} × ${fmtClock(c.work)} pracy / ${fmtClock(c.rest)} przerwy. ${c.goal}`; })()}</div></div>` : '';
  return `<main class="scr">${head}
    ${condPick}
    ${list ? `<div style="border-top:1px solid var(--line2)">${list}</div>` : ''}
    <div class="spacer"></div>
    ${pl.condChoice ? `<button class="pb split" data-a="startCond" data-k="${S.p.k}">Zacznij interwały ${ic('arrow', 20)}</button>` : ''}
    <button class="${pl.condChoice ? 'sb' : 'pb'}" data-a="saveLight" data-k="${S.p.k}">${doneSes ? 'Zapisz zmiany' : 'Zapisz dzień'}</button>
  </main>`;
};
function targetText(ex, it, t) {
  const rl = ex.repsLabel === 'm' ? ' m' : ex.unit === 's' ? ' s' : '';
  if (ex.unit === 'kg') return `${it.sets} × ${t.reps}${rl}${t.kg != null ? ` · ${fmtKg(t.kg)} kg` : ' · wybierz ciężar'}${t.first ? ' · pierwszy raz' : ''}`;
  return `${it.sets} × ${t.reps}${rl}${t.first ? ' · pierwszy raz' : ''}`;
}

// ---------- 06 Seria ----------
function cur() {
  const a = S.active; const it = a.items[a.idx]; const ex = EX[it.ex];
  const done = a.done[a.idx] || []; const last = done[done.length - 1];
  const kg = last ? last.kg : it.target.kg; const reps = it.target.reps;
  return { a, it, ex, done, kg, reps, setNo: done.length + 1 };
}
screens.seria = () => {
  if (!S.active) return screens.dzis();
  const { a, it, ex, done, kg, reps, setNo } = cur();
  const rl = ex.repsLabel === 'm' ? ' m' : ex.unit === 's' ? ' s' : '';
  const needKg = ex.unit === 'kg' && (kg === null || kg === undefined);
  const chips = done.map(s => `<span class="chip">${ic('check', 12, 2.6)}${ex.unit === 'kg' ? `${fmtKg(s.kg)} × ` : ''}${s.reps}${rl} · ${FEEL[s.feel].label}</span>`).join('');
  return `<main class="scr" style="gap:16px">
    <div class="top"><button class="ib" data-a="exList" aria-label="Lista ćwiczeń">${ic('menu')}</button><span class="clock" data-tick="elapsed">0:00</span><button class="tb" data-a="finish">Zakończ</button></div>
    <div class="segs">${a.items.map((_, i) => `<span class="${i < a.idx ? 'd' : i === a.idx ? 'c' : ''}"></span>`).join('')}</div>
    <div><div class="lb">${a.idx + 1} z ${a.items.length} · ${esc(ex.name)}</div>${chips ? `<div class="chips" style="margin-top:10px">${chips}</div>` : ''}</div>
    <div class="sec" style="align-items:center;text-align:center;padding-top:22px;gap:0">
      <div class="lb k">Seria ${setNo} z ${it.sets}</div>
      ${needKg ? `<div class="h2" style="margin:22px 0 6px">Pierwszy raz</div><div class="mut sm">Wybierz ciężar, z którym robisz serię.</div>`
      : ex.unit === 'kg' ? `<div class="big" style="margin-top:14px">${fmtKg(kg)}<span style="font-size:28px;letter-spacing:0"> kg</span></div><div class="h2" style="font-size:34px;margin-top:4px">× ${reps}${rl}</div>`
      : `<div class="big" style="margin-top:14px">${reps}<span style="font-size:28px;letter-spacing:0">${ex.unit === 's' ? ' s' : ' powt.'}</span></div>`}
      ${ex.cue ? `<div class="mut sm" style="margin-top:10px">${esc(ex.cue)}</div>` : ''}
    </div>
    <div class="spacer"></div>
    ${needKg ? `<button class="pb" data-a="other">Wybierz ciężar</button>` : `
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="lb k" style="text-align:center;margin-bottom:4px">Zrobione. Jak poszło?</div>
      ${['easy', 'ok', 'hard'].map(f => `<button class="feel ${f === 'ok' ? 'pri' : ''}" data-a="log" data-f="${f}"><b>${FEEL[f].label}</b><small>${FEEL[f].sub}</small></button>`).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:16px"><button class="lnk" data-a="other">Zrobiłem inaczej</button><button class="lnk" data-a="skipEx">Pomiń ćwiczenie</button></div>`}
  </main>`;
};

// ---------- 08 Przerwa ----------
screens.przerwa = () => {
  if (!S.active) return screens.dzis();
  const a = S.active; const it = a.items[a.idx]; const ex = EX[it.ex]; const done = a.done[a.idx] || [];
  const justDone = a.lastLogged;
  const rl = ex.repsLabel === 'm' ? ' m' : ex.unit === 's' ? ' s' : '';
  const kg = done.length ? done[done.length - 1].kg : it.target.kg;
  const nextTxt = `Seria ${done.length + 1} · ${ex.unit === 'kg' ? `${fmtKg(kg)} kg × ` : ''}${it.target.reps}${rl}`;
  return `<main class="scr">
    <div class="top"><button class="ib" data-a="exList" aria-label="Lista ćwiczeń">${ic('menu')}</button><span class="clock" data-tick="elapsed">0:00</span><button class="tb" data-a="finish">Zakończ</button></div>
    <div class="spacer"></div>
    ${justDone ? `<div class="row" style="justify-content:flex-start;gap:8px;font-size:14px">${ic('check', 16, 2.4)}${esc(justDone)}</div>` : ''}
    <div class="sec" style="padding-top:22px;gap:0">
      <div class="lb k">Przerwa</div>
      <div class="huge" style="margin-top:10px" data-tick="rest">${fmtClock(Math.max(0, (a.restUntil - Date.now()) / 1000))}</div>
      <div class="bar t3" style="margin-top:18px"><i data-tick="restbar" style="width:0%"></i></div>
      <div class="row mut sm" style="margin-top:8px"><span>z ${fmtClock(a.restTotal)}</span><span>sygnał na koniec</span></div>
    </div>
    <div class="panel"><div class="lb">${a.idx !== a.lastIdx ? 'Następne ćwiczenie' : 'Następnie'}</div><div class="n" style="font-size:20px;margin-top:6px">${a.idx !== a.lastIdx ? esc(ex.name) : nextTxt}</div>
      ${a.idx !== a.lastIdx ? `<div class="mut sm" style="margin-top:4px">${nextTxt}</div>` : ''}</div>
    <div class="spacer"></div>
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:8px"><button class="sb" style="height:56px;font-size:15px" data-a="plus30">+30 s</button><button class="pb" data-a="skipRest">Pomiń przerwę</button></div>
  </main>`;
};

// ---------- 09 Interwały ----------
screens.interwaly = () => {
  const a = S.active; if (!a || !a.cond) return screens.dzis();
  const c = a.cond; const v = COND_VARIANTS[c.variant];
  if (c.finished) {
    return `<main class="scr"><div class="spacer"></div><div><div class="lb">${v.name} · zrobione</div><h1 style="margin-top:6px">Jak ciężko?</h1><div class="mut sm" style="margin-top:6px">Ocena całych interwałów, 1–10.</div></div>
      <div class="tiles" style="grid-template-columns:repeat(5,minmax(0,1fr))">${[6, 7, 8, 9, 10].map(n => `<button class="tile" data-a="rpe" data-n="${n}">${n}</button>`).join('')}</div><div class="spacer"></div></main>`;
  }
  return `<main class="scr">
    <div class="top"><span class="lb" style="padding-left:12px">${v.name}</span><button class="tb" data-a="condEnd">Zakończ</button></div>
    <div class="spacer"></div>
    <div style="display:flex;gap:6px">${Array.from({ length: Math.min(v.rounds, 16) }, (_, i) => `<span style="flex:1;height:${v.rounds > 6 ? 10 : 44}px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:1px solid ${i + 1 === c.round ? 'var(--inv-bg)' : 'var(--line)'};background:${i + 1 < c.round ? 'var(--panel)' : i + 1 === c.round ? 'var(--inv-bg)' : 'none'};color:${i + 1 === c.round ? 'var(--inv-ink)' : 'inherit'}">${v.rounds <= 6 ? i + 1 : ''}</span>`).join('')}</div>
    <div class="mut sm">Runda ${c.round} z ${v.rounds}</div>
    <div class="sec" style="padding-top:22px;gap:0">
      <span class="tag" style="align-self:flex-start">${c.ph === 'work' ? 'Praca' : c.ph === 'pre' ? 'Start za' : 'Przerwa'}</span>
      <div class="huge" style="margin-top:16px" data-tick="cond">${fmtClock(condLeft())}</div>
      <div class="bar t3" style="margin-top:18px"><i class="acc" data-tick="condbar" style="width:0%"></i></div>
    </div>
    <div class="grid2" style="gap:8px">
      <div class="panel"><div class="lb">${c.ph === 'work' ? 'Cel' : 'Teraz'}</div><div class="n" style="font-size:16px;margin-top:6px;line-height:1.25">${c.ph === 'work' ? v.goal : c.ph === 'pre' ? 'Rozkręć się, zaraz start.' : v.restGoal}</div></div>
      <div class="panel"><div class="lb">Potem</div><div class="n" style="font-size:16px;margin-top:6px;line-height:1.25">${c.ph === 'work' ? (c.round < v.rounds ? `Przerwa ${fmtClock(v.rest)}` : 'Koniec') : `Praca ${fmtClock(v.work)}`}</div></div>
    </div>
    <div class="spacer"></div>
    <div class="grid2" style="gap:8px"><button class="sb" style="height:56px;font-size:15px" data-a="condPause">${c.paused ? 'Wznów' : 'Pauza'}</button><button class="pb" style="font-size:15px" data-a="condNext">Następna faza</button></div>
  </main>`;
};
function condLeft() { const c = S.active?.cond; if (!c) return 0; return c.paused ? c.left : Math.max(0, (c.until - Date.now()) / 1000); }

// ---------- 10 Koniec ----------
screens.koniec = () => {
  const a = S.active; if (!a) return screens.dzis();
  const mins = Math.max(1, Math.round((Date.now() - a.startedAt) / 60000));
  const nsets = Object.values(a.done).reduce((n, x) => n + x.length, 0);
  const prev = S.sessions;
  const recs = []; const tips = [];
  a.items.forEach((it, i) => {
    const sets = a.done[i] || []; if (!sets.length) return; const ex = EX[it.ex];
    const before = bestSet(it.ex, prev); const top = sets.reduce((b, s) => (!b || e1rm(s, ex.unit) > e1rm(b, ex.unit) ? s : b), null);
    if (before && e1rm(top, ex.unit) > before.v + 0.01) recs.push(`<div class="li"><span>${esc(ex.name)}</span><strong class="n" style="font-size:15px">${ex.unit === 'kg' ? fmtKg(top.kg) + ' kg × ' : ''}${top.reps}</strong></div>`);
    const nt = targetFor(it, [{ exercises: [{ ex: it.ex, sets, target: it.target }] }]);
    if (ex.unit === 'kg' && nt.kg != null) {
      if (nt.reason === 'up') tips.push(`<strong>${esc(ex.name)}: ${fmtKg(nt.kg)} kg.</strong>`);
      else if (nt.reason === 'hold' && it.main) tips.push(`${esc(ex.name)} zostaje na ${fmtKg(nt.kg)} kg.`);
      else if (nt.reason === 'down') tips.push(`${esc(ex.name)}: lżej, ${fmtKg(nt.kg)} kg.`);
    }
  });
  const c = a.cond;
  return `<main class="scr">
    <div><div class="lb">${esc(a.title)} · zrobione</div><h1 style="margin-top:6px">Koniec</h1></div>
    <div class="grid3 sec" style="display:grid;gap:0">
      <div><div class="n" style="font-size:28px;font-stretch:125%;line-height:1">${mins}</div><div class="mut sm" style="margin-top:4px">minut</div></div>
      <div><div class="n" style="font-size:28px;font-stretch:125%;line-height:1">${c ? c.doneRounds || 0 : nsets}</div><div class="mut sm" style="margin-top:4px">${c && !nsets ? 'rund' : 'serii'}</div></div>
      <div><div class="n" style="font-size:28px;font-stretch:125%;line-height:1">${recs.length}</div><div class="mut sm" style="margin-top:4px">rekordy</div></div>
    </div>
    ${recs.length ? `<div><div class="lb k" style="margin-bottom:2px">Rekordy</div>${recs.join('')}</div>` : ''}
    <div class="field"><span class="lb k">Lędźwia po treningu · 0–10</span>
      <div class="seg" style="grid-template-columns:repeat(7,minmax(0,1fr))">${[0, 1, 2, 3, 4, 5, 6].map(n => `<button class="${S.endPain === n ? 'on' : ''}" data-a="pain" data-n="${n}">${n === 6 ? '6+' : n}</button>`).join('')}</div></div>
    ${tips.length ? `<div class="panel"><div class="lb">Następnym razem</div><div style="font-size:15px;line-height:1.45;margin-top:6px">${tips.slice(0, 4).join('<br>')}</div></div>` : ''}
    <div class="spacer"></div>
    <button class="pb" data-a="saveSession">Gotowe</button>
  </main>`;
};

// ---------- 11 Dieta ----------
screens.dieta = () => {
  const k = S.dietDate; const d = parseKey(k); const entries = foodOn(k); const tot = sumMacros(entries);
  const pct = (a, b) => Math.min(100, Math.round((a / b) * 100));
  const isToday = k === dateKey();
  const meals = MEALS.map(([id, name]) => {
    const list = entries.filter(e => e.meal === id);
    const kc = sumMacros(list).kcal;
    return `<section class="sec" style="gap:0;padding-top:10px">
      <div class="row" style="height:40px"><b class="lb k" style="font-size:12px">${name}${list.length ? ` · ${fmtNum(kc)}` : ''}</b><button class="sq" style="width:36px;height:36px" data-a="addFood" data-meal="${id}" aria-label="Dodaj: ${name}">${ic('plus', 16, 2)}</button></div>
      ${list.length ? list.map(e => `<button class="li" style="min-height:46px" data-a="editFood" data-id="${e.id}"><span>${esc(e.name)} <small style="display:inline">· ${fmtNum(e.grams)} g</small></span><span class="end">${fmtNum(macros(e).kcal)}</span></button>`).join('') : `<div class="empty">Pusto.</div>`}
    </section>`;
  }).join('');
  return `<main class="scr has-nav" style="gap:14px">
    <div class="row" style="align-items:flex-end">
      <div><div class="lb">${isToday ? 'Dziś' : fmtShort(d)}</div><h1 style="margin-top:6px">Dieta</h1></div>
      <div style="display:flex;gap:4px"><button class="ib box" data-a="dietDay" data-d="-1" aria-label="Poprzedni dzień">${ic('back', 20)}</button><button class="ib box" data-a="dietDay" data-d="1" aria-label="Następny dzień" ${isToday ? 'disabled style="opacity:.3"' : ''}>${ic('next', 20)}</button></div>
    </div>
    <div class="grid2" style="gap:16px">
      <div><div class="n" style="font-size:30px;font-stretch:125%;line-height:1">${fmtNum(tot.kcal)}</div><div class="mut sm" style="margin-top:4px">/ ${fmtNum(S.settings.kcal)} kcal · zostało ${fmtNum(Math.max(0, S.settings.kcal - tot.kcal))}</div><div class="bar t3" style="margin-top:8px"><i style="width:${pct(tot.kcal, S.settings.kcal)}%"></i></div></div>
      <div><div class="n" style="font-size:30px;font-stretch:125%;line-height:1">${fmtNum(tot.p)} g</div><div class="mut sm" style="margin-top:4px">/ ${fmtNum(S.settings.protein)} g białka · zostało ${fmtNum(Math.max(0, S.settings.protein - tot.p))}</div><div class="bar t3" style="margin-top:8px"><i style="width:${pct(tot.p, S.settings.protein)}%"></i></div></div>
    </div>
    <div class="mut sm" style="margin-top:-4px">Węglowodany ${fmtNum(tot.c)} g · tłuszcz ${fmtNum(tot.f)} g</div>
    ${meals}
  </main>${nav('dieta')}`;
};

// ---------- 12 Dodaj ----------
function allLocalProducts() {
  const own = S.products; const ids = new Set(own.map(p => p.id));
  return [...own, ...BASE.filter(b => !ids.has(b.id))];
}
function productById(id) { return S.products.find(p => p.id === id) || BASE.find(p => p.id === id) || S.offResults.find(p => p.id === id) || (S.p.prod && S.p.prod.id === id ? S.p.prod : null); }
function prodRow(p) {
  const g = p.lastGrams || p.portions?.[0] || 100;
  const m = macros({ grams: g, per100: p.per100 });
  return `<div class="li" style="grid-template-columns:1fr 44px;min-height:58px"><button style="background:none;border:0;padding:0;text-align:left;font-size:15px;line-height:1.25" data-a="pickProd" data-id="${esc(p.id)}">${esc(p.name)}<small>${fmtNum(g)} g · ${fmtNum(m.kcal)} kcal · ${fmtNum(m.p)} g białka</small></button>
    <button class="sq" data-a="quickAdd" data-id="${esc(p.id)}" aria-label="Dodaj ${esc(p.name)} ${fmtNum(g)} g">${ic('plus', 16, 2)}</button></div>`;
}
screens.dodaj = () => {
  const meal = S.p.meal || mealNow(); const mealName = MEALS.find(m => m[0] === meal)[1];
  const q = S.q.trim().toLowerCase();
  let body;
  if (q) {
    const loc = allLocalProducts().filter(p => p.name.toLowerCase().includes(q)).slice(0, 12);
    body = `${loc.length ? `<div><div class="lb" style="margin-bottom:2px">U ciebie i w bazie podstawowej</div>${loc.map(prodRow).join('')}</div>` : ''}
      <div><div class="lb" style="margin-bottom:2px">Open Food Facts</div>
      ${S.offState === 'loading' ? '<div class="empty">Szukam…</div>' : S.offState === 'error' ? '<div class="empty">Wyszukiwarka bazy chwilowo nie odpowiada. Zeskanuj kod (działa zawsze) albo dodaj produkt ręcznie.</div>' : S.offResults.length ? S.offResults.map(prodRow).join('') : q.length < 3 ? '<div class="empty">Wpisz co najmniej 3 litery.</div>' : '<div class="empty">Nic nie znaleziono.</div>'}</div>`;
  } else {
    let list;
    if (S.tab === 'ostatnie') list = S.products.filter(p => p.lastUsed).sort((a, b) => b.lastUsed - a.lastUsed).slice(0, 20);
    else if (S.tab === 'moje') list = S.products.filter(p => p.source === 'own');
    else list = BASE;
    body = `<div class="tabs">${[['ostatnie', 'Ostatnie'], ['moje', 'Moje'], ['baza', 'Podstawowe']].map(([id, l]) => `<button class="${S.tab === id ? 'on' : ''}" data-a="tab" data-t="${id}">${l}</button>`).join('')}</div>
      <div>${list.length ? list.map(prodRow).join('') : `<div class="empty">${S.tab === 'ostatnie' ? 'Jeszcze nic. Szukaj, zeskanuj albo wybierz z „Podstawowe”.' : 'Brak własnych produktów. Dodaj przyciskiem niżej.'}</div>`}</div>`;
  }
  return `<main class="scr" style="gap:14px">
    <div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button><span style="font-size:14px;font-weight:600">Do: ${mealName}</span><span style="width:44px"></span></div>
    <label class="input">${ic('search', 18, 1.8)}<input type="search" id="q" data-in="q" placeholder="Szukaj produktu" aria-label="Szukaj produktu" value="${esc(S.q)}" autocomplete="off"></label>
    <div class="grid2" style="gap:8px"><button class="pb mid" data-a="scan">${ic('scan', 20)}Skanuj kod</button><button class="sb" style="height:52px" data-a="newProd">${ic('plus', 16, 2)}Nowy produkt</button></div>
    ${body}
    <div class="mut sm">„+” dodaje tę samą porcję co ostatnio. Nazwa otwiera wybór ilości.</div>
  </main>`;
};

// ---------- 13 Ilość ----------
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
    <div><div class="lb">Na 100 g: ${fmtNum(prod.per100.kcal)} kcal · ${fmtNum(prod.per100.p, 1)} g białka</div><div class="h2" style="margin-top:6px">${esc(prod.name)}</div></div>
    <div class="field"><span class="lb k">Porcja</span><div class="tiles" style="grid-template-columns:repeat(2,minmax(0,1fr))">
      ${portions.map(x => `<button class="tile ${g === x ? 'on' : ''}" style="font-size:15px" data-a="grams" data-g="${x}">${fmtNum(x)} g${x === prod.lastGrams ? ' · ostatnio' : ''}</button>`).join('')}</div></div>
    <div class="row" style="border-top:1px solid var(--line2);border-bottom:1px solid var(--line2);padding:16px 0">
      <button class="sq lg" data-a="gStep" data-d="-10" aria-label="Minus 10 g">${ic('minus', 18, 2)}</button>
      <span class="n" style="font-size:52px;font-stretch:125%;line-height:1">${fmtNum(g)}<span style="font-size:22px"> g</span></span>
      <button class="sq lg" data-a="gStep" data-d="10" aria-label="Plus 10 g">${ic('plus', 18, 2)}</button>
    </div>
    <div class="grid4">${[['kcal', m.kcal, 0], ['białko, g', m.p, 0], ['węgle, g', m.c, 0], ['tłuszcz, g', m.f, 0]].map(([l, v]) => `<div><div class="n" style="font-size:24px;line-height:1">${fmtNum(v)}</div><div class="mut sm" style="margin-top:4px">${l}</div></div>`).join('')}</div>
    <div class="panel" style="font-size:14px">Po ${editing ? 'zmianie' : 'dodaniu'}: <strong>${fmtNum(tot.kcal + m.kcal)} / ${fmtNum(S.settings.kcal)} kcal · ${fmtNum(tot.p + m.p)} / ${fmtNum(S.settings.protein)} g białka</strong></div>
    <div class="spacer"></div>
    ${editing ? `<div style="display:grid;grid-template-columns:1fr 2fr;gap:8px"><button class="sb" style="height:56px" data-a="delFood" data-id="${editing.id}">Usuń</button><button class="pb" data-a="saveFood" data-id="${editing.id}">Zapisz</button></div>`
      : `<button class="pb" data-a="addEntry" data-id="${esc(prod.id)}">Dodaj: ${mealName.toLowerCase()}</button>`}
  </main>`;
};

// ---------- 14 Postęp ----------
function chart(points, { w = 350, h = 150, label } = {}) {
  if (points.length < 2) return `<div class="empty" style="padding:30px 0">${label || 'Za mało danych na wykres.'}</div>`;
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
    const pts = ks.map(k => ({ x: k, y: S.days[k].weight }));
    const lastW = pts.length ? pts[pts.length - 1].y : null;
    const first8 = ks.find(k => k >= dateKey(addDays(today(), -56)));
    const delta = lastW != null && first8 ? lastW - S.days[first8].weight : null;
    body = `<div class="row" style="align-items:baseline"><span class="n" style="font-size:30px;font-stretch:125%">${lastW != null ? fmtNum(lastW, 1) + ' kg' : '–'}</span>
      <span style="font-size:14px">${delta != null && ks.length > 1 ? `<strong>${delta >= 0 ? '+' : '−'}${fmtNum(Math.abs(delta), 1)} kg</strong> <span class="mut">· cel +0,2–0,35/tydz.</span>` : '<span class="mut">cel +0,2–0,35 kg/tydz.</span>'}</span></div>
      ${chart(pts, { label: 'Dodaj co najmniej 2 pomiary, żeby zobaczyć wykres.' })}
      <button class="pb mid" data-a="weighIn">${ic('plus', 16, 2)}Dodaj pomiar wagi</button>
      ${ks.length ? `<div>${ks.slice(-5).reverse().map(k => `<div class="li" style="min-height:44px"><span class="mut sm">${fmtShort(parseKey(k))}</span><strong class="n" style="font-size:15px">${fmtNum(S.days[k].weight, 1)} kg</strong></div>`).join('')}</div>` : ''}`;
  } else {
    const used = new Set(); S.sessions.forEach(s => (s.exercises || []).forEach(e => e.sets?.length && used.add(e.ex)));
    const order = [...MAIN_LIFTS.filter(x => used.has(x)), ...[...used].filter(x => !MAIN_LIFTS.includes(x))];
    body = order.length ? `<div style="border-top:1px solid var(--line2)">${order.map(id => {
      const b = bestSet(id, S.sessions); const ex = EX[id]; if (!ex || !b) return '';
      return `<button class="li" data-a="hist" data-ex="${id}" style="grid-template-columns:1fr auto 20px"><span>${ex.name}<small>najlepsza seria</small></span><strong class="n" style="font-size:16px">${ex.unit === 'kg' ? fmtKg(b.set.kg) + ' × ' : ''}${b.set.reps}${ex.unit === 's' ? ' s' : ''}</strong>${ic('next', 18)}</button>`;
    }).join('')}</div>` : `<div class="empty">Zrób pierwszy trening, a tu pojawią się Twoje wyniki.</div>`;
  }
  return `<main class="scr has-nav"><div><div class="lb">${S.progTab === 'waga' ? 'Ostatnie tygodnie' : 'Wszystkie treningi'}</div><h1 style="margin-top:6px">Postęp</h1></div>${tabs}${body}</main>${nav('postep')}`;
};

// ---------- 15 Historia ćwiczenia ----------
screens.historia = () => {
  const id = S.p.ex; const ex = EX[id];
  const rows = [];
  S.sessions.slice().reverse().forEach(s => (s.exercises || []).forEach(e => { if (e.ex === id && e.sets?.length) rows.push({ s, e }); }));
  const pts = rows.map(r => ({ y: Math.max(...r.e.sets.map(st => e1rm(st, ex.unit))) }));
  const b = bestSet(id, S.sessions);
  return `<main class="scr">
    <div class="top"><button class="ib" data-a="back" aria-label="Wróć">${ic('back')}</button></div>
    <div><div class="lb">${rows.length} ${rows.length === 1 ? 'trening' : 'treningów'}</div><div class="h2" style="margin-top:6px">${ex.name}</div></div>
    ${b ? `<div class="grid2 sec" style="display:grid;gap:0"><div><div class="n" style="font-size:24px;font-stretch:125%;line-height:1">${ex.unit === 'kg' ? fmtKg(b.set.kg) : b.set.reps}</div><div class="mut sm" style="margin-top:4px">${ex.unit === 'kg' ? `kg × ${b.set.reps} · najlepsza` : 'najlepsza seria'}</div></div>
      ${ex.unit === 'kg' && b.set.kg > 0 ? `<div><div class="n" style="font-size:24px;font-stretch:125%;line-height:1">${fmtNum(b.v)}</div><div class="mut sm" style="margin-top:4px">szacowany max, kg</div></div>` : ''}</div>` : ''}
    ${chart(pts, { label: 'Wykres pojawi się po 2 treningach.' })}
    <div><div class="lb k" style="margin-bottom:2px">Treningi</div>
      ${rows.slice().reverse().map(({ s, e }) => { const top = e.sets.reduce((a, st) => (e1rm(st, ex.unit) > e1rm(a, ex.unit) ? st : a)); return `<div class="li" style="grid-template-columns:72px 1fr auto;min-height:52px"><span class="mut sm">${fmtShort(parseKey(s.date))}</span><span class="sm">${e.sets.length} serie · ${e.sets.map(x => FEEL[x.feel]?.label[0] || '').join(' ')}</span><strong class="n" style="font-size:14px">${ex.unit === 'kg' ? fmtKg(top.kg) + ' × ' : ''}${top.reps}</strong></div>`; }).join('')}
    </div>
  </main>`;
};

// ================= ARKUSZE (od dołu) =================
function sheetHtml() {
  const sh = S.sheet; if (!sh) return '';
  let inner = '';
  if (sh.type === 'other') {
    const { ex, it } = cur(); const inc = ex.inc || 2;
    const base = sh.kg ?? it.target.kg ?? ex.start ?? 0;
    const kgTiles = [-2, -1, 0, 1, 2].map(i => Math.max(0, Math.round((base + i * inc) * 4) / 4));
    const repsBase = it.target.reps; const step = ex.unit === 's' ? 5 : 1;
    const repTiles = [-4, -3, -2, -1, 0, 1, 2].map(i => Math.max(1, repsBase + i * step));
    inner = `<div class="row" style="align-items:flex-end"><div><div class="mut sm">${esc(ex.name)} · seria ${cur().setNo}</div><div class="h2" style="font-size:24px;margin-top:4px">Co wyszło?</div></div><span class="mut sm">cel: ${it.target.kg != null && ex.unit === 'kg' ? fmtKg(it.target.kg) + ' × ' : ''}${repsBase}</span></div>
      ${ex.unit === 'kg' ? `<div class="field"><span class="lb k">Ciężar · kg</span><div class="tiles" style="grid-template-columns:repeat(5,minmax(0,1fr))">${kgTiles.map(v => `<button class="tile ${sh.kg === v ? 'on' : ''} ${v === it.target.kg ? 'tg' : ''}" data-a="oKg" data-v="${v}">${fmtKg(v)}</button>`).join('')}</div>
        <div class="row mut sm"><button class="lnk" style="text-decoration:none;color:var(--ink)" data-a="oKgStep" data-d="-1">− 1 kg</button><span>${it.target.kg != null ? 'obramowanie = cel' : ''}</span><button class="lnk" style="text-decoration:none;color:var(--ink)" data-a="oKgStep" data-d="1">+ 1 kg</button></div></div>` : ''}
      <div class="field"><span class="lb k">${ex.unit === 's' ? 'Sekundy' : ex.repsLabel === 'm' ? 'Metry' : 'Powtórzenia'}</span><div class="tiles" style="grid-template-columns:repeat(7,minmax(0,1fr))">${repTiles.map(v => `<button class="tile ${sh.reps === v ? 'on' : ''} ${v === repsBase ? 'tg' : ''}" style="font-size:15px" data-a="oReps" data-v="${v}">${v}</button>`).join('')}</div></div>
      <div class="field"><span class="lb k">Jak poszło · zapisuje serię</span><div class="feel3">${['easy', 'ok', 'hard'].map(f => `<button data-a="logOther" data-f="${f}" ${ex.unit === 'kg' && sh.kg == null ? 'disabled style="opacity:.35"' : ''}>${FEEL[f].label}<small>${f === 'easy' ? '3+ w zapasie' : f === 'ok' ? '2 w zapasie' : '0–1'}</small></button>`).join('')}</div></div>`;
  } else if (sh.type === 'exList') {
    const a = S.active;
    inner = `<div class="h2" style="font-size:24px">Ćwiczenia</div><div>${a.items.map((it, i) => { const n = (a.done[i] || []).length; return `<button class="li" data-a="jump" data-i="${i}" style="grid-template-columns:28px 1fr auto"><span class="mut sm">${String(i + 1).padStart(2, '0')}</span><span style="font-weight:${i === a.idx ? 650 : 500}">${EX[it.ex].name}</span><span class="end">${n >= it.sets ? ic('check', 16, 2.4) : `${n}/${it.sets}`}</span></button>`; }).join('')}</div>`;
  } else if (sh.type === 'swap') {
    const alts = alternatives(sh.ex);
    inner = `<div><div class="mut sm">Zamiast: ${EX[sh.ex].name}</div><div class="h2" style="font-size:24px;margin-top:4px">Zamień na</div></div>
      <div>${alts.map(id => `<button class="li" data-a="swapTo" data-id="${id}"><span>${EX[id].name}<small>${esc(EX[id].cue || '')}</small></span>${ic('next', 18)}</button>`).join('') || '<div class="empty">Brak zamienników w puli.</div>'}</div>
      <div class="mut sm">Zamiana zostaje na kolejne tygodnie. Same dozwolone ćwiczenia, zero przysiadów i martwych ciągów.</div>`;
  } else if (sh.type === 'settings') {
    const s = S.settings;
    inner = `<div class="h2" style="font-size:24px">Ustawienia</div>
      <label class="field"><span class="lb k">Początek planu (poniedziałek tygodnia 1)</span><input type="date" id="setStart" value="${s.startDate}"></label>
      <div class="grid2"><label class="field"><span class="lb k">Kalorie / dzień</span><input type="number" inputmode="numeric" id="setKcal" value="${s.kcal}"></label><label class="field"><span class="lb k">Białko, g</span><input type="number" inputmode="numeric" id="setProt" value="${s.protein}"></label></div>
      <label class="field"><span class="lb k">Suplementy (po przecinku)</span><input type="text" id="setSupps" value="${esc(s.supps.join(', '))}"></label>
      <button class="pb mid" data-a="saveSettings">Zapisz</button>
      <div class="sec" style="gap:8px"><span class="lb">Kopia zapasowa</span><div class="grid2" style="gap:8px"><button class="sb" data-a="export">Zapisz kopię</button><label class="sb" style="cursor:pointer">Wczytaj kopię<input type="file" accept="application/json,.json" id="importFile" style="display:none"></label></div>
      <div class="mut sm">Dane są tylko na tym urządzeniu. Zapisuj kopię co jakiś czas.</div></div>`;
  } else if (sh.type === 'weigh') {
    inner = `<div class="h2" style="font-size:24px">Waga dziś</div>
      <div class="row" style="border-top:1px solid var(--line2);border-bottom:1px solid var(--line2);padding:16px 0">
        <button class="sq lg" data-a="wStep" data-d="-0.1" aria-label="Minus 0,1 kg">${ic('minus', 18, 2)}</button>
        <span class="n" style="font-size:52px;font-stretch:125%;line-height:1">${fmtNum(sh.w, 1)}<span style="font-size:22px"> kg</span></span>
        <button class="sq lg" data-a="wStep" data-d="0.1" aria-label="Plus 0,1 kg">${ic('plus', 18, 2)}</button></div>
      <div class="grid4">${[-1, -0.5, 0.5, 1].map(d => `<button class="sb" data-a="wStep" data-d="${d}">${d > 0 ? '+' : '−'}${fmtNum(Math.abs(d), 1)}</button>`).join('')}</div>
      <button class="pb" data-a="saveWeight">Zapisz</button>`;
  } else if (sh.type === 'newProd') {
    inner = `<div class="h2" style="font-size:24px">Nowy produkt</div>
      <label class="field"><span class="lb k">Nazwa</span><input type="text" id="npName" placeholder="np. Kurczak z ryżem" value="${esc(sh.name || '')}"></label>
      <div class="lb">Wartości na 100 g</div>
      <div class="grid2"><label class="field"><span class="lb k">Kcal</span><input type="number" inputmode="decimal" id="npKcal"></label><label class="field"><span class="lb k">Białko, g</span><input type="number" inputmode="decimal" id="npP"></label>
      <label class="field"><span class="lb k">Węglowodany, g</span><input type="number" inputmode="decimal" id="npC"></label><label class="field"><span class="lb k">Tłuszcz, g</span><input type="number" inputmode="decimal" id="npF"></label></div>
      <label class="field"><span class="lb k">Typowa porcja, g (opcjonalnie)</span><input type="number" inputmode="numeric" id="npPort"></label>
      <button class="pb" data-a="saveNewProd">Zapisz produkt</button>`;
  } else if (sh.type === 'scan') {
    inner = `<div class="h2" style="font-size:24px">Kod kreskowy</div>
      ${sh.camera ? `<video class="scan" id="scanVideo" playsinline muted></video><div class="mut sm">Skieruj aparat na kod. Albo wpisz cyfry poniżej.</div>` : `<div class="mut sm">Wpisz cyfry spod kodu kreskowego na opakowaniu.</div>`}
      <label class="field"><span class="lb k">Numer kodu</span><input type="text" inputmode="numeric" id="ean" placeholder="5900000000000"></label>
      ${sh.err ? `<div class="sm" style="font-weight:600">${esc(sh.err)}</div>` : ''}
      <button class="pb" data-a="eanGo">${sh.busy ? 'Szukam…' : 'Szukaj'}</button>`;
  }
  return `<div class="sheet-wrap" data-a="closeSheet"><div class="sheet" role="dialog" aria-modal="true" data-stop="1"><div class="grab"></div>${inner}</div></div>`;
}

// ================= RENDER =================
function render() {
  const fn = screens[S.route] || screens.dzis;
  const focusedId = document.activeElement?.id; const selStart = document.activeElement?.selectionStart;
  app.innerHTML = fn() + sheetHtml() + (S.toast ? `<div class="toast" role="status">${esc(S.toast)}</div>` : '');
  if (focusedId) { const el = document.getElementById(focusedId); if (el) { el.focus(); try { el.setSelectionRange(selStart, selStart); } catch (e) { } } }
  tick();
  if (S.sheet?.type === 'scan' && S.sheet.camera) startCamera();
}

// ---------- zegary ----------
function tick() {
  const a = S.active; if (!a) return;
  document.querySelectorAll('[data-tick]').forEach(el => {
    const t = el.dataset.tick;
    if (t === 'elapsed') el.textContent = fmtClock((Date.now() - a.startedAt) / 1000);
    if (t === 'rest') el.textContent = fmtClock(Math.max(0, (a.restUntil - Date.now()) / 1000));
    if (t === 'restbar') el.style.width = `${Math.min(100, 100 - ((a.restUntil - Date.now()) / 1000 / a.restTotal) * 100)}%`;
    if (t === 'cond') el.textContent = fmtClock(condLeft());
    if (t === 'condbar' && a.cond) { const tot = a.cond.total || 1; el.style.width = `${Math.min(100, 100 - (condLeft() / tot) * 100)}%`; }
  });
  if (S.route === 'przerwa' && a.restUntil && Date.now() >= a.restUntil) { a.restUntil = null; beep(2); go('seria', {}, true); saveActive(); }
  if (S.route === 'interwaly' && a.cond && !a.cond.paused && !a.cond.finished && Date.now() >= a.cond.until) condAdvance();
}
setInterval(tick, 250);

// ================= TRENING: logika =================
async function startSession(k) {
  const d = parseKey(k); const pl = planFor(d);
  const items = pl.items.map(it => ({ ...it, target: targetFor(it, S.sessions) }));
  S.active = { id: uid(), date: k, dayKey: pl.key, week: weekNumber(S.settings.startDate, d), title: pl.title, type: pl.type, startedAt: Date.now(), items, idx: 0, done: {}, condPlan: pl.cond || null };
  await saveActive(); keepScreen(true); go('seria', {}, true);
}
async function logSet(kg, reps, feel) {
  const a = S.active; const i = a.idx; const it = a.items[i]; const ex = EX[it.ex];
  (a.done[i] = a.done[i] || []).push({ kg: ex.unit === 'kg' ? kg : null, reps, feel, t: Date.now() });
  a.lastLogged = `Seria ${a.done[i].length} zapisana · ${ex.unit === 'kg' ? fmtKg(kg) + ' kg × ' : ''}${reps} · ${FEEL[feel].label}`;
  a.lastIdx = i;
  if (a.done[i].length >= it.sets) {
    const nextI = a.items.findIndex((x, j) => j > i && (a.done[j] || []).length < x.sets);
    const anyLeft = nextI >= 0 ? nextI : a.items.findIndex((x, j) => (a.done[j] || []).length < x.sets);
    if (anyLeft < 0) { await saveActive(); return afterStrength(); }
    a.idx = anyLeft;
  }
  a.restTotal = it.rest; a.restUntil = Date.now() + it.rest * 1000;
  S.sheet = null; await saveActive(); go('przerwa', {}, true);
}
function afterStrength() {
  const a = S.active;
  if (a.condPlan) return startCondFor(a.condPlan);
  go('koniec', {}, true);
}
function startCondFor(variant) {
  const a = S.active; const v = COND_VARIANTS[variant];
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
    exercises: a.items.map((it, i) => ({ ex: it.ex, target: it.target, sets: a.done[i] || [] })).filter(e => e.sets.length),
    cond: a.cond ? { variant: a.cond.variant, rounds: a.cond.doneRounds || 0, rpe: a.cond.rpe ?? null } : null,
    painAfter: S.endPain, checklist: a.checklist || null,
  };
  await db.put('sessions', ses); S.sessions.unshift(ses); S.sessions.sort((x, y) => (y.endedAt || 0) - (x.endedAt || 0));
  S.active = null; S.endPain = null; await saveActive(); keepScreen(false);
  toast('Trening zapisany'); go('dzis', {}, true);
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
  await db.put('products', rec);
  S.products = [...S.products.filter(x => x.id !== p.id), rec];
}
async function addEntry(p, grams, meal) {
  const e = { id: uid(), date: S.dietDate, meal, name: p.name, grams, per100: p.per100, productId: p.id, t: Date.now() };
  await db.put('food', e); S.food.push(e); await rememberProduct(p, grams);
}
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
  } catch (e) { S.sheet = { type: 'scan', camera: false, err: 'Brak dostępu do aparatu. Wpisz kod ręcznie.' }; render(); }
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
  theme: async () => { S.settings.theme = S.settings.theme === 'dark' ? 'light' : 'dark'; applyTheme(); await saveSettings(); render(); },
  settings: () => { S.sheet = { type: 'settings' }; render(); },
  closeSheet: () => { stopCamera(); S.sheet = null; render(); },
  supp: async d => { const k = dateKey(); S.days[k] = S.days[k] || {}; const s = S.days[k].supps = S.days[k].supps || {}; s[d.s] = !s[d.s]; await saveDay(k); render(); },
  open: d => go('podglad', { k: d.k }),
  resume: () => { const a = S.active; go(a.cond ? 'interwaly' : a.restUntil && a.restUntil > Date.now() ? 'przerwa' : 'seria'); keepScreen(true); },
  start: d => { unlockAudio(); if (S.active && !confirm('Masz niezakończony trening. Zacząć nowy?')) return; startSession(d.k); },
  swapOpen: d => { S.sheet = { type: 'swap', slot: d.slot, ex: d.ex }; render(); },
  swapTo: async d => { S.settings.swaps = { ...S.settings.swaps, [S.sheet.slot]: d.id }; await saveSettings(); S.sheet = null; toast(`Zamienione na: ${EX[d.id].name}`); },
  chk: d => { S.p.chk = { ...(S.p.chk || sessionsOn(S.p.k)[0]?.checklist || {}) }; S.p.chk[d.id] = S.p.chk[d.id] ? false : true; render(); },
  chkMin: d => { S.p.chk = { ...(S.p.chk || sessionsOn(S.p.k)[0]?.checklist || {}) }; const m = Number(d.m); S.p.chk[d.id] = S.p.chk[d.id] === m ? false : m; render(); },
  pickCond: d => { S.p.cv = d.v; render(); },
  saveLight: async d => {
    const pl = planFor(parseKey(d.k)); const old = sessionsOn(d.k)[0];
    const ses = { id: old?.id || uid(), date: d.k, dayKey: pl.key, week: weekNumber(S.settings.startDate, parseKey(d.k)), title: pl.title, type: pl.type, startedAt: old?.startedAt || Date.now(), endedAt: Date.now(), exercises: old?.exercises || [], cond: old?.cond || null, checklist: S.p.chk || old?.checklist || {} };
    await db.put('sessions', ses); S.sessions = [ses, ...S.sessions.filter(s => s.id !== ses.id)];
    toast('Dzień zapisany'); go('dzis', {}, true);
  },
  startCond: d => {
    unlockAudio(); const pl = planFor(parseKey(d.k));
    S.active = { id: uid(), date: d.k, dayKey: pl.key, week: weekNumber(S.settings.startDate, parseKey(d.k)), title: pl.title, type: pl.type, startedAt: Date.now(), items: [], idx: 0, done: {}, checklist: S.p.chk || {} };
    startCondFor(S.p.cv || pl.condChoice[0]);
  },
  log: d => { unlockAudio(); const c = cur(); logSet(c.kg, c.reps, d.f); },
  other: () => { const c = cur(); S.sheet = { type: 'other', kg: c.kg ?? null, reps: c.reps }; render(); },
  oKg: d => { S.sheet.kg = Number(d.v); render(); },
  oKgStep: d => { const c = cur(); S.sheet.kg = Math.max(0, (S.sheet.kg ?? c.it.target.kg ?? c.ex.start ?? 0) + Number(d.d)); render(); },
  oReps: d => { S.sheet.reps = Number(d.v); render(); },
  logOther: d => { unlockAudio(); logSet(S.sheet.kg, S.sheet.reps, d.f); },
  skipEx: async () => {
    const a = S.active; const i = a.idx;
    const nextI = a.items.findIndex((x, j) => j !== i && (a.done[j] || []).length < x.sets && j > i);
    const any = nextI >= 0 ? nextI : a.items.findIndex((x, j) => j !== i && (a.done[j] || []).length < x.sets);
    if (any < 0) { await saveActive(); return afterStrength(); }
    a.idx = any; await saveActive(); render();
  },
  exList: () => { S.sheet = { type: 'exList' }; render(); },
  jump: async d => { S.active.idx = Number(d.i); S.active.restUntil = null; S.sheet = null; await saveActive(); go('seria', {}, true); },
  plus30: () => { S.active.restUntil += 30000; S.active.restTotal += 30; saveActive(); render(); },
  skipRest: () => { S.active.restUntil = null; saveActive(); go('seria', {}, true); },
  finish: () => { if (confirm('Zakończyć trening teraz?')) { if (S.active.condPlan && !S.active.cond && Object.keys(S.active.done).length) { go('koniec', {}, true); } else go('koniec', {}, true); } },
  condPause: () => { const c = S.active.cond; if (c.paused) { c.until = Date.now() + c.left * 1000; c.paused = false; } else { c.left = condLeft(); c.paused = true; } saveActive(); render(); },
  condNext: () => condAdvance(),
  condEnd: () => { if (confirm('Zakończyć interwały?')) { S.active.cond.finished = true; saveActive(); render(); } },
  rpe: d => { S.active.cond.rpe = Number(d.n); saveActive(); go('koniec', {}, true); },
  pain: d => { S.endPain = Number(d.n); render(); },
  saveSession: () => saveSession(),
  // dieta
  addFood: d => { S.q = ''; S.offResults = []; S.offState = ''; S.tab = S.products.some(p => p.lastUsed) ? 'ostatnie' : 'baza'; go('dodaj', { meal: d.meal }); },
  dietDay: d => { const nd = addDays(parseKey(S.dietDate), Number(d.d)); if (dateKey(nd) > dateKey()) return; S.dietDate = dateKey(nd); render(); },
  tab: d => { S.tab = d.t; render(); },
  pickProd: d => { S.g = null; go('ilosc', { id: d.id, meal: S.p.meal }); },
  quickAdd: async d => { const p = productById(d.id); const g = p.lastGrams || p.portions?.[0] || 100; await addEntry(p, g, S.p.meal || mealNow()); toast(`Dodano: ${p.name}, ${fmtNum(g)} g`); },
  editFood: d => { S.g = null; go('ilosc', { entryId: d.id }); },
  grams: d => { S.g = Number(d.g); render(); },
  gStep: d => { S.g = Math.max(5, (S.g || 0) + Number(d.d)); render(); },
  addEntry: async d => { const p = productById(d.id); await addEntry(p, S.g, S.p.meal || mealNow()); S.g = null; toast(`Dodano: ${p.name}`); go('dieta', {}, true); },
  saveFood: async d => { const e = S.food.find(f => f.id === d.id); e.grams = S.g; await db.put('food', e); S.g = null; history.back(); },
  delFood: async d => { await db.del('food', d.id); S.food = S.food.filter(f => f.id !== d.id); S.g = null; toast('Usunięto'); history.back(); },
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
  saveWeight: async () => { const k = dateKey(); S.days[k] = { ...(S.days[k] || {}), weight: S.sheet.w }; await saveDay(k); S.sheet = null; toast('Waga zapisana'); },
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
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `trening-kopia-${dateKey()}.json`; document.body.appendChild(a); a.click(); a.remove();
  },
};

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
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });
})();
