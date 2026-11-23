// Plan z mikrocyklu (mikrocykl.md). Zero przysiadów i martwych ciągów – nigdzie.
// unit: 'kg' = ciężar × powtórzenia, 'bw' = masa ciała × powtórzenia, 's' = sekundy (na stronę)
// repsLabel nadpisuje podpis powtórzeń (np. metry przy carry).

export const EX = {
  // moc
  skok_dal:      { name: 'Skok w dal z miejsca', p: 'moc', unit: 'bw', cue: 'Miękkie lądowanie, pełny reset między skokami.' },
  skoki_boczne:  { name: 'Skoki boczne jednonóż', p: 'moc', unit: 'bw', cue: 'Nisko, płasko, stabilne lądowanie. Powtórzenia na stronę.' },
  lyzwiarz:      { name: 'Skoki łyżwiarza', p: 'moc', unit: 'bw', cue: 'W bok, zatrzymaj lądowanie na 1 s.' },
  rzut_pilka:    { name: 'Rzuty piłką lekarską z rotacją', p: 'moc', unit: 'bw', cue: 'Biodra prowadzą ruch. Na stronę.' },
  // kolano
  wykrok_wst:    { name: 'Wykrok wsteczny z hantlami', p: 'kolano', unit: 'kg', inc: 2, start: 16, cue: 'Hantle w dłoniach · kg na hantel · 2 s w dół.' },
  wykroki_chodz: { name: 'Wykroki chodzone z hantlami', p: 'kolano', unit: 'kg', inc: 2, start: 14, cue: 'Kg na hantel · powtórzenia na nogę.' },
  wykrok_def:    { name: 'Wykrok wsteczny z deficytem', p: 'kolano', unit: 'kg', inc: 2, start: 12, cue: 'Przednia stopa na talerzu · więcej czwórek.' },
  wykrok_bok:    { name: 'Wykrok boczny', p: 'kolano', unit: 'kg', inc: 2, start: 10, cue: 'Hantel przy klatce · na stronę.' },
  stepup:        { name: 'Step-up na ławkę z hantlami', p: 'kolano', unit: 'kg', inc: 2, start: 12, cue: 'Bez odbijania się dolną nogą · na nogę.' },
  reverse_nordic:{ name: 'Reverse Nordic', p: 'kolano', unit: 'bw', cue: 'Biodra wyprostowane, odchylasz się z kolan.' },
  // biodro
  hip_thrust:    { name: 'Hip thrust ze sztangą', p: 'biodro', unit: 'kg', inc: 5, start: 60, cue: 'Żebra w dół, bez przeprostu na górze.' },
  hip_thrust_jn: { name: 'Hip thrust jednonóż', p: 'biodro', unit: 'kg', inc: 2, start: 0, cue: 'Hantel na biodrze · na nogę.' },
  mostek_pieta:  { name: 'Mostek z piętą na ławce', p: 'biodro', unit: 'bw', cue: 'Jednonóż · na nogę.' },
  nordic:        { name: 'Nordic hamstring curl', p: 'biodro', unit: 'bw', cue: 'Pięty pod obciążoną sztangą · 3–5 s w dół.' },
  slizgi:        { name: 'Uginanie nóg na ślizgach', p: 'biodro', unit: 'bw', cue: 'Biodra w górze przez całą serię.' },
  copenhagen:    { name: 'Copenhagen na ławce', p: 'biodro', unit: 's', cue: 'Sekundy na stronę · poziom 1 → 2 → 3.' },
  zgiecie_biodra:{ name: 'Zgięcie biodra z gumą', p: 'biodro', unit: 'bw', cue: 'Zamach jak do strzału · na nogę.' },
  // pchanie
  bench:         { name: 'Wyciskanie leżąc', p: 'pchanie_poz', unit: 'kg', inc: 2.5, start: 80, main: true, cue: 'Zabezpieczenia w stojakach ustawione.' },
  incline_db:    { name: 'Wyciskanie hantli na skosie', p: 'pchanie_poz', unit: 'kg', inc: 2, start: 28, cue: 'Skos 15–30° · kg na hantel.' },
  dips:          { name: 'Dipy', p: 'pchanie_poz', unit: 'bw', cue: 'Kontrola w dole, bez bólu barku.' },
  pompki_plus:   { name: 'Pompki z „plus” na poręczach', p: 'pchanie_poz', unit: 'bw', cue: 'Na górze dopchnij łopatki.' },
  ohp_seated:    { name: 'Wyciskanie hantli siedząc', p: 'pchanie_pion', unit: 'kg', inc: 2, start: 20, cue: 'Sprawdź prześwit pod sufitem · kg na hantel.' },
  zpress:        { name: 'Z-press na podłodze', p: 'pchanie_pion', unit: 'kg', inc: 2, start: 16, cue: 'Siad prosty, tułów sztywny.' },
  db_press_1:    { name: 'Wyciskanie hantla jednorącz siedząc', p: 'pchanie_pion', unit: 'kg', inc: 2, start: 20, cue: 'Na rękę.' },
  lateral:       { name: 'Wznosy bokiem', p: 'barki', unit: 'kg', inc: 1, start: 8, cue: 'Bez bujania.' },
  face_pull:     { name: 'Face pull z gumą', p: 'barki', unit: 'bw', cue: 'Łokcie wysoko, ściągnij łopatki.' },
  band_apart:    { name: 'Band pull-apart', p: 'barki', unit: 'bw', cue: 'Proste ręce, łopatki razem.' },
  iso_bark:      { name: 'Izometria barkiem w ramę stojaka', p: 'kontakt', unit: 's', cue: 'Pozycja boiskowa, 5–8 s na maksa · na stronę.' },
  // ciągnięcie
  pullup_w:      { name: 'Podciąganie z obciążeniem', p: 'ciag_pion', unit: 'kg', inc: 2.5, start: 0, main: true, cue: 'Kg = obciążenie dodatkowe.' },
  pullup:        { name: 'Podciąganie', p: 'ciag_pion', unit: 'bw', cue: 'Pełny zwis na dole.' },
  row_incl:      { name: 'Wiosłowanie hantlem z podparciem', p: 'ciag_poz', unit: 'kg', inc: 2, start: 26, cue: 'Klatka na ławce skośnej · kg na hantel.' },
  aus_row:       { name: 'Wiosłowanie australijskie', p: 'ciag_poz', unit: 'bw', cue: 'Sztanga w stojakach, ciało w linii.' },
  cable_row:     { name: 'Wyciąg jednorącz poziomo', p: 'ciag_poz', unit: 'kg', inc: 1, start: 15, cue: 'Lekko, z zatrzymaniem · na rękę.' },
  renegade:      { name: 'Wiosłowanie w podporze (renegade)', p: 'ciag_poz', unit: 'kg', inc: 2, start: 12, cue: 'Biodra nie rotują · na rękę.' },
  // ramiona
  curl_ez:       { name: 'Uginanie sztangą łamaną', p: 'ramiona', unit: 'kg', inc: 2.5, start: 25, cue: '' },
  curl_hammer:   { name: 'Uginanie młotkowe', p: 'ramiona', unit: 'kg', inc: 1, start: 12, cue: 'Kg na hantel.' },
  skull_ez:      { name: 'Francuskie wyciskanie sztangą łamaną', p: 'ramiona', unit: 'kg', inc: 2.5, start: 25, cue: '' },
  lina_tri:      { name: 'Lina na wyciągu', p: 'ramiona', unit: 'kg', inc: 1, start: 15, cue: 'Lekko, pełny wyprost.' },
  // carry / core
  suitcase:      { name: 'Suitcase carry', p: 'carry', unit: 'kg', inc: 2, start: 24, repsLabel: 'm', cue: 'Hantel w jednej ręce · metry na stronę.' },
  farmer:        { name: 'Farmer carry', p: 'carry', unit: 'kg', inc: 2, start: 28, repsLabel: 'm', cue: 'Kg na hantel · metry.' },
  carry_klatka:  { name: 'Carry z hantlem przy klatce', p: 'carry', unit: 'kg', inc: 2, start: 20, repsLabel: 'm', cue: 'Metry.' },
  unoszenie_kolan:{ name: 'Unoszenie kolan na poręczach', p: 'core', unit: 'bw', cue: 'Kolana zgięte, miednica podwinięta na górze.' },
  deadbug:       { name: 'Dead bug z gumą', p: 'core', unit: 'bw', cue: 'Lędźwia przyklejone do podłogi · na stronę.' },
  pallof:        { name: 'Pallof press z gumą', p: 'core', unit: 'bw', cue: 'Na stronę, 2 s wytrzymania.' },
  chop:          { name: 'Chop i lift gumą w wykroku', p: 'core', unit: 'bw', cue: 'Miednica nieruchoma · na stronę.' },
  side_plank:    { name: 'Deska boczna', p: 'core', unit: 's', cue: 'Sekundy na stronę.' },
  // łydki
  wspiecia_jn:   { name: 'Wspięcia jednonóż z hantlem', p: 'lydki', unit: 'kg', inc: 2, start: 10, cue: 'Na nogę, pauza na górze.' },
  wspiecia_siedz:{ name: 'Wspięcia siedząc', p: 'lydki', unit: 'kg', inc: 2, start: 20, cue: 'Hantel na kolanach.' },
};

const I = (ex, sets, reps, rest, extra = {}) => ({ ex, sets, reps, rest, ...extra });

// Lekkie dni = lista do odhaczenia.
const CHK_SR = [
  { id: 'tlen', label: 'Marsz pod górę albo rower', minutes: [30, 35, 40] },
  { id: 'ytw', label: 'Y-T-W na skosie' },
  { id: 'facepull', label: 'Face pull z gumą' },
  { id: 'chintuck', label: 'Chin tuck / izometria szyi' },
  { id: 'wis', label: 'Wis na drążku' },
  { id: 'jezyk', label: 'Jeżyk 5–10 min' },
  { id: 'zginacz', label: 'Zginacz biodra w półklęku' },
  { id: 'couch', label: 'Couch stretch' },
  { id: 'ksiazka', label: 'Otwieranie książki' },
  { id: 'roller', label: 'Roller: odcinek piersiowy' },
  { id: 'oddech', label: 'Oddychanie 90/90' },
];
const CHK_NDZ = [
  { id: 'spacer', label: 'Spacer', minutes: [20, 30, 45, 60] },
  { id: 'mobilnosc', label: 'Mobilność 20 min' },
  { id: 'pistolet', label: 'Pistolet do masażu' },
  { id: 'sauna', label: 'Sauna' },
];
const CHK_SOB = [
  { id: 'skakanka', label: 'Skakanka albo pogo (start)' },
  { id: 'jezyk', label: 'Jeżyk 5 min' },
  { id: 'sauna', label: 'Sauna' },
];

export const COND_VARIANTS = {
  '4x4':  { name: 'Rower 4×4 min', rounds: 4, work: 240, rest: 180, goal: 'Mocno, ale równo. Mówisz pojedyncze słowa.', restGoal: 'Lekko kręcisz.' },
  '3x3':  { name: 'Rower 3×3 min', rounds: 3, work: 180, rest: 180, goal: 'Mocno, ale równo.', restGoal: 'Lekko kręcisz.' },
  '30/30':{ name: '30/30', rounds: 10, work: 30, rest: 30, goal: 'Szybko, na ok. 8/10.', restGoal: 'Luźno.' },
  '15/15':{ name: '15/15', rounds: 16, work: 15, rest: 15, goal: 'Szybko, na ok. 8/10.', restGoal: 'Luźno.' },
  'SIT':  { name: 'SIT · sprinty', rounds: 5, work: 20, rest: 180, goal: 'Na maksa, 100%.', restGoal: 'Bardzo lekko, odpocznij.' },
  'zrywy':{ name: 'Zrywy 6 s', rounds: 12, work: 6, rest: 24, goal: 'Maksymalny zryw.', restGoal: 'Luźno.' },
};

// Tydzień docelowy (od tygodnia 3).
const WEEK = {
  pon: { title: 'Dół · siła', type: 'strength', intensity: 3, minutes: 70, legs: true, items: [
    I('skok_dal', 3, 4, 90), I('wykrok_wst', 4, 6, 150, { main: true }), I('hip_thrust', 4, 6, 150, { main: true }),
    I('stepup', 3, 10, 90), I('nordic', 2, 5, 120), I('wspiecia_jn', 3, 12, 60), I('unoszenie_kolan', 3, 12, 60), I('deadbug', 3, 10, 45) ] },
  wt: { title: 'Góra · siła', type: 'strength', intensity: 3, minutes: 90, cond: '4x4', items: [
    I('bench', 4, 5, 180, { main: true }), I('pullup_w', 4, 5, 180, { main: true }), I('row_incl', 3, 8, 120),
    I('ohp_seated', 3, 8, 120), I('iso_bark', 3, 6, 60) ] },
  sr: { title: 'Tlen i mobilność', type: 'light', intensity: 1, minutes: 45, checklist: CHK_SR },
  czw: { title: 'Dół · objętość', type: 'strength', intensity: 2, minutes: 70, legs: true, items: [
    I('wykroki_chodz', 3, 10, 120, { main: true }), I('wykrok_def', 3, 8, 120), I('wykrok_bok', 3, 8, 90), I('hip_thrust_jn', 3, 10, 90),
    I('slizgi', 3, 10, 90), I('reverse_nordic', 2, 6, 90), I('copenhagen', 3, 20, 60), I('zgiecie_biodra', 2, 12, 45),
    I('wspiecia_siedz', 3, 15, 60), I('pallof', 3, 10, 45) ] },
  pt: { title: 'Góra · objętość', type: 'strength', intensity: 2, minutes: 70, items: [
    I('incline_db', 4, 10, 120, { main: true }), I('pullup', 3, 8, 120), I('dips', 3, 10, 90), I('aus_row', 3, 10, 90),
    I('cable_row', 3, 12, 60), I('lateral', 3, 15, 60), I('face_pull', 3, 15, 45), I('curl_ez', 3, 10, 60),
    I('skull_ez', 3, 10, 60), I('suitcase', 3, 30, 90) ] },
  sob: { title: 'Kondycja', type: 'cond', intensity: 3, minutes: 35, checklist: CHK_SOB, condChoice: ['30/30', '15/15', 'SIT', 'zrywy'] },
  ndz: { title: 'Odpoczynek', type: 'rest', intensity: 0, minutes: 20, checklist: CHK_NDZ },
};

// Tygodnie 1–2: powrót, 3× całe ciało, mniej serii.
const RETURN = {
  pon: { title: 'Całe ciało A', type: 'strength', intensity: 2, minutes: 60, items: [
    I('bench', 3, 6, 150, { main: true }), I('wykrok_wst', 3, 8, 120, { main: true }), I('pullup', 3, 6, 120), I('hip_thrust', 3, 8, 120),
    I('row_incl', 2, 10, 90), I('deadbug', 2, 10, 45) ] },
  wt: { title: 'Tlen i mobilność', type: 'light', intensity: 1, minutes: 40, checklist: CHK_SR },
  sr: { title: 'Całe ciało B', type: 'strength', intensity: 2, minutes: 60, items: [
    I('incline_db', 3, 10, 120, { main: true }), I('wykroki_chodz', 3, 10, 120), I('aus_row', 3, 10, 90), I('stepup', 2, 10, 90),
    I('ohp_seated', 2, 10, 90), I('pallof', 2, 10, 45), I('suitcase', 2, 30, 90) ] },
  czw: { title: 'Spokojne interwały', type: 'cond', intensity: 1, minutes: 30, checklist: [{ id: 'jezyk', label: 'Jeżyk 5–10 min' }], condChoice: ['3x3'] },
  pt: { title: 'Całe ciało C', type: 'strength', intensity: 2, minutes: 60, items: [
    I('dips', 3, 8, 120), I('wykrok_def', 3, 8, 120), I('pullup', 3, 6, 120), I('hip_thrust_jn', 2, 10, 90),
    I('nordic', 2, 3, 120), I('face_pull', 2, 15, 45), I('copenhagen', 2, 15, 60) ] },
  sob: { title: 'Dłuższy tlen', type: 'light', intensity: 1, minutes: 45, checklist: [{ id: 'tlen', label: 'Marsz pod górę albo rower', minutes: [40, 45, 50] }, ...CHK_SR.slice(5)] },
  ndz: WEEK.ndz,
};

export const DAY_KEYS = ['pon', 'wt', 'sr', 'czw', 'pt', 'sob', 'ndz'];
export const DAY_SHORT = { pon: 'PON', wt: 'WT', sr: 'ŚR', czw: 'CZW', pt: 'PT', sob: 'SOB', ndz: 'NDZ' };
export const DAY_LONG = { pon: 'Poniedziałek', wt: 'Wtorek', sr: 'Środa', czw: 'Czwartek', pt: 'Piątek', sob: 'Sobota', ndz: 'Niedziela' };

export function phaseFor(week) {
  if (week <= 2) return { id: 'powrot', name: 'Powrót', note: 'Lżej, 3–4 powt. w zapasie.' };
  if (week <= 5) return { id: 'fundament', name: 'Fundament', note: '' };
  if (week === 6 || week === 11) return { id: 'deload', name: 'Deload', note: 'Mniej serii, spokojna kondycja.' };
  if (week <= 10) return { id: 'sila', name: 'Siła', note: 'Mniej powtórzeń w głównych.' };
  return { id: 'przedsezon', name: 'Przedsezon', note: '' };
}

export const variantOf = week => (week <= 2 ? 'r' : 'w');

// Plan bazowy dnia (bez korekt fazy) – z edycjami użytkownika, jeśli są.
export function baseItems(week, dayKey, cfg = {}) {
  const v = variantOf(week);
  const base = v === 'r' ? RETURN[dayKey] : WEEK[dayKey];
  if (!base.items) return null;
  const ed = cfg.edits?.[`${v}:${dayKey}`];
  if (ed) return JSON.parse(JSON.stringify(ed)).filter(it => EX[it.ex]);
  return base.items.map((it, idx) => {
    const sw = cfg.swaps?.[`${v}:${dayKey}:${idx}`];
    return { ...it, ex: sw && EX[sw] ? sw : it.ex };
  });
}
export const defaultItems = (week, dayKey) => JSON.parse(JSON.stringify((variantOf(week) === 'r' ? RETURN : WEEK)[dayKey].items || []));

// Zwraca plan dnia dla danego tygodnia, z edycjami i korektą fazy.
export function dayPlan(week, dayKey, cfg = {}) {
  const ph = phaseFor(week);
  const v = variantOf(week);
  const base = v === 'r' ? RETURN[dayKey] : WEEK[dayKey];
  const d = JSON.parse(JSON.stringify({ ...base, items: undefined }));
  d.key = dayKey; d.phase = ph; d.variant = v; d.edited = !!cfg.edits?.[`${v}:${dayKey}`];
  const items = baseItems(week, dayKey, cfg);
  if (items) {
    d.items = items.map((it, idx) => {
      if (ph.id === 'deload') it.sets = Math.max(1, Math.round(it.sets * 0.6));
      if (ph.id === 'sila' && it.main) it.reps = Math.max(3, it.reps - 2);
      if (ph.id === 'przedsezon' && !it.main) it.sets = Math.max(2, it.sets - 1);
      it.idx = idx;
      return it;
    });
  }
  if (ph.id === 'deload') {
    if (d.cond) delete d.cond;
    if (d.type === 'cond') { d.type = 'light'; d.title = 'Spokojny tlen'; d.checklist = [{ id: 'tlen', label: 'Spokojny rower albo marsz', minutes: [30, 40] }, ...(d.checklist || [])]; delete d.condChoice; }
  }
  if (ph.id === 'fundament' && week === 3 && d.cond === '4x4') d.cond = '3x3';
  return d;
}

// Własne ćwiczenia (z ustawień) dopisują się do katalogu.
const BANNED = /przysiad|squat|martw|deadlift|\brdl\b|good ?morning|wall ?sit|swing/i;
export const isBanned = name => BANNED.test(name || '');
export function registerCustom(custom = {}) { for (const [id, e] of Object.entries(custom)) EX[id] = { ...e, custom: true }; }
export const PATTERN_NAMES = { moc: 'Moc', kolano: 'Nogi · kolano', biodro: 'Nogi · biodro', pchanie_poz: 'Wypychanie poziome', pchanie_pion: 'Wypychanie pionowe', barki: 'Barki', kontakt: 'Kontakt', ciag_pion: 'Przyciąganie pionowe', ciag_poz: 'Przyciąganie poziome', ramiona: 'Ramiona', carry: 'Carry', core: 'Core', lydki: 'Łydki', wlasne: 'Własne' };

export function alternatives(exId) {
  const p = EX[exId]?.p;
  return Object.keys(EX).filter(k => k !== exId && EX[k].p === p);
}

export const MAIN_LIFTS = ['bench', 'pullup_w', 'hip_thrust', 'wykrok_wst', 'incline_db', 'wykroki_chodz', 'suitcase'];
