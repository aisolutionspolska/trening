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

// Rozgrzewka i rozciąganie: pozycje z opisem „jak” (t = sekundy do minutnika).
// Roller tylko plecy, szyja, stopy. Reszta pistoletem. Zero przysiadów.
export const DRILLS = {
  rower5:     { name: 'Rower, lekko', dose: '5 min', t: 300, how: 'Spokojne tempo, aż zrobi się ciepło i lekko się spocisz. Możesz swobodnie mówić.' },
  rower_stop: { name: 'Rower, stopniowo coraz mocniej', dose: '6–8 min', t: 420, how: 'Zaczynasz bardzo lekko, co 2 minuty trochę mocniej. Na koniec 2–3 przyspieszenia po 10 s.' },
  rower_luz:  { name: 'Rower, bardzo lekko', dose: '5 min', t: 300, how: 'Wyciszenie po interwałach. Tętno ma spaść, oddech się uspokoić.' },
  pist_dol:   { name: 'Pistolet: pośladki, uda, łydki', dose: '30 s na partię', t: 30, how: 'Pośladek, przód uda, tył uda, przywodziciele, łydka. Prowadzisz pistolet powoli wzdłuż mięśnia, omijasz kości i kolano.' },
  pist_gora:  { name: 'Pistolet: klatka, najszersze, tył barku', dose: '30 s na partię', t: 30, how: 'Klatka przy barku, bok pleców pod pachą, tył barku. Powoli wzdłuż mięśnia, bez wbijania w kość.' },
  roller_pl:  { name: 'Roller: odcinek piersiowy', dose: '1 min', t: 60, how: 'Roller w poprzek pod łopatkami, ręce za głową, biodra na podłodze. Odchylasz się nad rollerem i przesuwasz go po kawałku. Nie schodź na lędźwia.' },
  kostka:     { name: 'Kolano do ściany', dose: '10 na nogę', how: 'Stopa ok. 10 cm od ściany, pięta cały czas na podłodze. Pchasz kolano do ściany nad palcami i wracasz. Gdy łatwo dotykasz, odsuń stopę.' },
  wgs:        { name: 'World’s greatest stretch', dose: '5 na stronę', how: 'Duży wykrok. Dłoń po stronie tylnej nogi na podłodze, łokieć drugiej ręki do kostki przedniej nogi od środka. Potem ta ręka w górę z obrotem tułowia, wzrok za dłonią.' },
  wymachy:    { name: 'Wymachy nóg przód-tył i bok-bok', dose: '10 na nogę w każdą stronę', how: 'Trzymasz się stojaka. Noga luźno jak wahadło, zakres rośnie z każdym wymachem. Tułów stoi prosto.' },
  mostek:     { name: 'Mostek biodrowy', dose: '12', how: 'Leżysz na plecach, stopy blisko pośladków. Wypychasz biodra w górę, ściskasz pośladki 2 s na górze. Żebra w dół, bez wyginania lędźwi.' },
  wykrok_bw:  { name: 'Wykroki wsteczne bez ciężaru', dose: '6 na nogę', how: 'Krok w tył, tylne kolano prawie do podłogi, tułów prosto. Spokojnie, to tylko rozruch.' },
  boczny_bw:  { name: 'Wykrok boczny bez ciężaru', dose: '6 na stronę', how: 'Szeroki krok w bok, biodra w tył, druga noga prosta. Czujesz rozciąganie przywodziciela.' },
  deadbug_r:  { name: 'Dead bug', dose: '6 na stronę', how: 'Leżysz, ręce w górę, kolana nad biodrami. Lędźwia dociśnięte do podłogi. Prostujesz przeciwną rękę i nogę z długim wydechem.' },
  passthru:   { name: 'Przenoszenie gumy za głowę', dose: '10', how: 'Szeroki chwyt gumy, proste ręce. Przenosisz gumę nad głową do tyłu i z powrotem. Przy niskim suficie rób to na klęcząco.' },
  pullapart:  { name: 'Band pull-apart', dose: '15', how: 'Guma przed klatką, proste ręce. Rozciągasz ją do klatki, ściągając łopatki. Bez unoszenia barków.' },
  pompki_lop: { name: 'Pompki łopatkowe', dose: '10', how: 'Podpór na prostych rękach. Bez zginania łokci opuszczasz klatkę między łopatki, potem wypychasz podłogę i rozsuwasz łopatki.' },
  zwis_lop:   { name: 'Podciąganie łopatkowe', dose: '8', how: 'Zwis na drążku. Bez zginania łokci ściągasz łopatki w dół i ciało unosi się o kilka centymetrów.' },
  ksiazka:    { name: 'Otwieranie książki', dose: '8 na stronę', how: 'Leżysz na boku, kolana zgięte przed sobą. Górną rękę prowadzisz łukiem na drugą stronę, wzrok za dłonią, kolana zostają na podłodze.' },
  zginacz:    { name: 'Zginacz biodra w półklęku', dose: '2 × 40 s na stronę', t: 40, how: 'Kolano na czymś miękkim. Napnij pośladek tylnej nogi, podwiń miednicę i lekko przesuń biodra do przodu. Bez wyginania lędźwi.' },
  dwojki:     { name: 'Tył uda z gumą, leżąc', dose: '2 × 40 s na nogę', t: 40, how: 'Leżysz na plecach, guma na stopie, prosta noga w górę. Druga noga płasko na podłodze. Ciągniesz do lekkiego napięcia, nie do bólu.' },
  zaba:       { name: 'Przywodziciele: żaba', dose: '2 × 40 s', t: 40, how: 'Na czworakach, kolana szeroko, stopy na zewnątrz. Powoli cofasz biodra do tyłu, plecy proste.' },
  czworka:    { name: 'Pośladek: „4” leżąc', dose: '40 s na stronę', t: 40, how: 'Leżysz na plecach, kostka na kolanie drugiej nogi. Przyciągasz dolne udo do klatki.' },
  lydka:      { name: 'Łydka przy ścianie', dose: '30 s prosta + 30 s zgięta noga', t: 30, how: 'Dłonie na ścianie, noga w tył, pięta na podłodze. Najpierw kolano proste, potem lekko zgięte (rozciąga niższą część łydki).' },
  klatka:     { name: 'Klatka w ramie stojaka', dose: '2 × 40 s na stronę', t: 40, how: 'Przedramię na ramie stojaka, łokieć na wysokości barku. Obracasz tułów od ręki, aż poczujesz klatkę i przód barku.' },
  najszersze: { name: 'Najszersze przy ławce', dose: '2 × 40 s', t: 40, how: 'Klęczysz przed ławką, łokcie na ławce, dłonie razem. Cofasz biodra i opuszczasz klatkę w dół.' },
  tyl_barku:  { name: 'Tył barku, ręka przez klatkę', dose: '30 s na stronę', t: 30, how: 'Prosta ręka przez klatkę, drugą dociągasz ją za łokieć. Bark w dół, z dala od ucha.' },
  triceps:    { name: 'Triceps za głową', dose: '30 s na stronę', t: 30, how: 'Siedząc, łokieć w górę, dłoń między łopatki. Drugą ręką lekko dociskasz łokieć.' },
  roller_szy: { name: 'Roller: szyja', dose: '1 min', t: 60, how: 'Leżysz, roller pod karkiem. Powoli obracasz głowę w lewo i w prawo, bez nacisku.' },
  oddech:     { name: 'Oddychanie 90/90', dose: '5 długich oddechów', how: 'Leżysz, stopy na ścianie, biodra i kolana pod kątem prostym. Wdech nosem, długi wydech ustami, żebra opadają w dół, lędźwia płasko.' },
};

export const WARM = {
  dol:   ['rower5', 'pist_dol', 'kostka', 'wgs', 'wymachy', 'mostek', 'wykrok_bw', 'deadbug_r'],
  gora:  ['rower5', 'roller_pl', 'pist_gora', 'passthru', 'pullapart', 'pompki_lop', 'zwis_lop', 'ksiazka'],
  cale:  ['rower5', 'roller_pl', 'pist_dol', 'wgs', 'mostek', 'wykrok_bw', 'pullapart', 'pompki_lop'],
  kond:  ['rower_stop', 'wymachy', 'wgs', 'boczny_bw', 'mostek'],
};
export const COOL = {
  dol:   ['zginacz', 'dwojki', 'zaba', 'czworka', 'lydka', 'pist_dol', 'oddech'],
  gora:  ['klatka', 'najszersze', 'tyl_barku', 'triceps', 'zginacz', 'roller_szy', 'oddech'],
  cale:  ['zginacz', 'dwojki', 'klatka', 'najszersze', 'czworka', 'lydka', 'oddech'],
  kond:  ['rower_luz', 'zginacz', 'dwojki', 'lydka', 'oddech'],
};

// Lekkie dni = lista do odhaczenia.
const CHK_SR = [
  { id: 'tlen', label: 'Marsz pod górę albo rower', minutes: [30, 35, 40], how: 'Tempo, przy którym możesz rozmawiać pełnymi zdaniami, ale czujesz wysiłek. Na bieżni pod górę, bez biegania.' },
  { id: 'ytw', label: 'Y-T-W na skosie', how: 'Leżysz brzuchem na ławce skośnej, lekkie hantle albo bez. Ręce w kształt Y, potem T, potem W, po 8 powtórzeń. Łopatki w dół i do siebie.' },
  { id: 'facepull', label: 'Face pull z gumą', how: 'Guma zaczepiona na wysokości twarzy. Ciągniesz do czoła, łokcie wysoko, na końcu obracasz dłonie do tyłu. 2–3 × 15.' },
  { id: 'chintuck', label: 'Chin tuck / izometria szyi', how: 'Cofasz brodę prosto do tyłu (podwójny podbródek), 5 s, 10 razy. Potem dłoń przy czole, z tyłu i z boków głowy, pchasz głową w dłoń 10 s.' },
  { id: 'wis', label: 'Wis na drążku', how: 'Luźny zwis, 3 × 20–40 s. Rozciąga najszersze i odciąża kręgosłup.' },
  { id: 'jezyk', label: 'Jeżyk 5–10 min', how: 'Stanie na jednej nodze na jeżyku. 30–45 s na nogę, potem z zamkniętymi oczami albo sięganie drugą nogą w 3 kierunkach.' },
  { id: 'zginacz', label: 'Zginacz biodra w półklęku', how: DRILLS.zginacz.how },
  { id: 'couch', label: 'Couch stretch', how: 'Kolano przy ścianie (albo ławce), stopa w górę po ścianie, druga noga z przodu w wykroku. Napnij pośladek, tułów prosto. 2 × 40 s na stronę.' },
  { id: 'ksiazka', label: 'Otwieranie książki', how: DRILLS.ksiazka.how },
  { id: 'roller', label: 'Roller: odcinek piersiowy', how: DRILLS.roller_pl.how },
  { id: 'oddech', label: 'Oddychanie 90/90', how: DRILLS.oddech.how },
];
const CHK_NDZ = [
  { id: 'spacer', label: 'Spacer', minutes: [20, 30, 45, 60] },
  { id: 'mobilnosc', label: 'Mobilność 20 min', how: 'Zginacz biodra, tył uda z gumą, żaba, „4” leżąc, łydka przy ścianie, klatka w ramie stojaka, oddychanie 90/90. Po 2 × 40 s.' },
  { id: 'pistolet', label: 'Pistolet do masażu', how: 'Uda, pośladki, łydki, przywodziciele, klatka. Po 30–60 s na partię.' },
  { id: 'sauna', label: 'Sauna' },
];
const CHK_SOB = [
  { id: 'skakanka', label: 'Skakanka albo pogo (start)', how: 'Rozgrzewka stóp i łydek przed interwałami: 3 × 30 s skakanki albo niskich odbić w miejscu. Tylko tam, gdzie nie ma sufitu nad głową.' },
  { id: 'jezyk', label: 'Jeżyk 5 min', how: CHK_SR[5].how },
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
  pon: { title: 'Dół · siła', type: 'strength', intensity: 3, minutes: 70, legs: true, warm: 'dol', cool: 'dol', items: [
    I('skok_dal', 3, 4, 90), I('wykrok_wst', 4, 6, 150, { main: true }), I('hip_thrust', 4, 6, 150, { main: true }),
    I('stepup', 3, 10, 90), I('nordic', 2, 5, 120), I('wspiecia_jn', 3, 12, 60), I('unoszenie_kolan', 3, 12, 60), I('deadbug', 3, 10, 45) ] },
  wt: { title: 'Góra · siła', type: 'strength', intensity: 3, minutes: 90, cond: '4x4', warm: 'gora', cool: 'gora', items: [
    I('bench', 4, 5, 180, { main: true }), I('pullup_w', 4, 5, 180, { main: true }), I('row_incl', 3, 8, 120),
    I('ohp_seated', 3, 8, 120), I('iso_bark', 3, 6, 60) ] },
  sr: { title: 'Tlen i mobilność', type: 'light', intensity: 1, minutes: 45, checklist: CHK_SR },
  czw: { title: 'Dół · objętość', type: 'strength', intensity: 2, minutes: 70, legs: true, warm: 'dol', cool: 'dol', items: [
    I('wykroki_chodz', 3, 10, 120, { main: true }), I('wykrok_def', 3, 8, 120), I('wykrok_bok', 3, 8, 90), I('hip_thrust_jn', 3, 10, 90),
    I('slizgi', 3, 10, 90), I('reverse_nordic', 2, 6, 90), I('copenhagen', 3, 20, 60), I('zgiecie_biodra', 2, 12, 45),
    I('wspiecia_siedz', 3, 15, 60), I('pallof', 3, 10, 45) ] },
  pt: { title: 'Góra · objętość', type: 'strength', intensity: 2, minutes: 70, warm: 'gora', cool: 'gora', items: [
    I('incline_db', 4, 10, 120, { main: true }), I('pullup', 3, 8, 120), I('dips', 3, 10, 90), I('aus_row', 3, 10, 90),
    I('cable_row', 3, 12, 60), I('lateral', 3, 15, 60), I('face_pull', 3, 15, 45), I('curl_ez', 3, 10, 60),
    I('skull_ez', 3, 10, 60), I('suitcase', 3, 30, 90) ] },
  sob: { title: 'Kondycja', type: 'cond', intensity: 3, minutes: 35, warm: 'kond', cool: 'kond', checklist: CHK_SOB, condChoice: ['30/30', '15/15', 'SIT', 'zrywy'] },
  ndz: { title: 'Odpoczynek', type: 'rest', intensity: 0, minutes: 20, checklist: CHK_NDZ },
};

// Tygodnie 1–2: powrót, 3× całe ciało, mniej serii.
const RETURN = {
  pon: { title: 'Całe ciało A', type: 'strength', intensity: 2, minutes: 60, warm: 'cale', cool: 'cale', items: [
    I('bench', 3, 6, 150, { main: true }), I('wykrok_wst', 3, 8, 120, { main: true }), I('pullup', 3, 6, 120), I('hip_thrust', 3, 8, 120),
    I('row_incl', 2, 10, 90), I('deadbug', 2, 10, 45) ] },
  wt: { title: 'Tlen i mobilność', type: 'light', intensity: 1, minutes: 40, checklist: CHK_SR },
  sr: { title: 'Całe ciało B', type: 'strength', intensity: 2, minutes: 60, warm: 'cale', cool: 'cale', items: [
    I('incline_db', 3, 10, 120, { main: true }), I('wykroki_chodz', 3, 10, 120), I('aus_row', 3, 10, 90), I('stepup', 2, 10, 90),
    I('ohp_seated', 2, 10, 90), I('pallof', 2, 10, 45), I('suitcase', 2, 30, 90) ] },
  czw: { title: 'Spokojne interwały', type: 'cond', intensity: 1, minutes: 30, warm: 'kond', cool: 'kond', checklist: [{ id: 'jezyk', label: 'Jeżyk 5–10 min', how: CHK_SR[5].how }], condChoice: ['3x3'] },
  pt: { title: 'Całe ciało C', type: 'strength', intensity: 2, minutes: 60, warm: 'cale', cool: 'cale', items: [
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
  d.warm = d.warm ? WARM[d.warm] : null; d.cool = d.cool ? COOL[d.cool] : null;
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
    if (d.type === 'cond') { d.warm = null; d.cool = null; d.type = 'light'; d.title = 'Spokojny tlen'; d.checklist = [{ id: 'tlen', label: 'Spokojny rower albo marsz', minutes: [30, 40] }, ...(d.checklist || [])]; delete d.condChoice; }
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

// Serie rozgrzewkowe przed pierwszą serią roboczą głównego ćwiczenia.
const BARBELL = ['bench', 'hip_thrust'];
export function rampSets(exId, kg) {
  const ex = EX[exId]; if (!ex || ex.unit !== 'kg' || kg == null) return [];
  if (exId === 'pullup_w') return kg > 5 ? [{ kg: 0, reps: 5 }, { kg: Math.round(kg / 2 / 2.5) * 2.5, reps: 3 }] : [{ kg: 0, reps: 5 }];
  if (kg < 12) return [];
  const inc = ex.inc || 2.5; const r = v => Math.round(v / inc) * inc;
  const steps = kg >= 40 ? [[0.5, 8], [0.7, 4], [0.85, 2]] : [[0.6, 6], [0.8, 3]];
  const out = BARBELL.includes(exId) && kg > 30 ? [{ kg: 20, reps: 10 }] : [];
  for (const [f, reps] of steps) { const v = r(kg * f); if (v > 0 && v < kg && !out.some(o => o.kg >= v)) out.push({ kg: v, reps }); }
  return out;
}
