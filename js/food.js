// Produkty: mała baza podstawowa (działa offline) + Open Food Facts (darmowa baza, wymaga internetu).
// Wartości bazy podstawowej to typowe wartości na 100 g – po zeskanowaniu konkretnego produktu liczą się dane z etykiety.
const B = (id, name, kcal, p, c, f, portions = []) => ({ id: 'base:' + id, name, per100: { kcal, p, c, f }, portions, source: 'base' });

export const BASE = [
  B('owsiane', 'Płatki owsiane', 370, 13, 60, 7, [50, 80, 100]),
  B('ryz', 'Ryż biały (suchy)', 350, 7, 78, 1, [75, 100, 150]),
  B('makaron', 'Makaron (suchy)', 355, 12, 72, 1.5, [80, 100, 125]),
  B('ziemniaki', 'Ziemniaki gotowane', 77, 2, 17, 0.1, [200, 300, 400]),
  B('chleb_zytni', 'Chleb żytni', 230, 6, 45, 1.5, [35, 70]),
  B('kurczak', 'Pierś z kurczaka (surowa)', 110, 23, 0, 1.5, [150, 200, 250]),
  B('wolowina', 'Wołowina mielona 10%', 175, 20, 0, 10, [150, 200]),
  B('losos', 'Łosoś (surowy)', 200, 20, 0, 13, [125, 150]),
  B('tunczyk', 'Tuńczyk w sosie własnym', 110, 25, 0, 1, [120]),
  B('jajko', 'Jajko (1 szt. ok. 60 g)', 143, 12.5, 0.7, 10, [60, 120, 180]),
  B('skyr', 'Skyr naturalny', 63, 11, 4, 0.2, [150, 300]),
  B('twarog', 'Twaróg półtłusty', 133, 18, 3.5, 4.5, [100, 200, 250]),
  B('jogurt_gr', 'Jogurt grecki', 120, 6, 4, 10, [150, 200]),
  B('mleko', 'Mleko 2%', 50, 3.4, 4.8, 2, [250, 500]),
  B('bialko_groch', 'Białko grochu (odżywka)', 380, 80, 3, 6, [30, 40]),
  B('banan', 'Banan', 89, 1.1, 23, 0.3, [120, 150]),
  B('jablko', 'Jabłko', 52, 0.3, 14, 0.2, [150, 200]),
  B('maslo_orz', 'Masło orzechowe', 600, 25, 15, 50, [15, 30]),
  B('oliwa', 'Oliwa', 884, 0, 0, 100, [10, 15]),
  B('orzechy', 'Orzechy włoskie', 654, 15, 14, 65, [30, 50]),
];

const FIELDS = 'code,product_name,product_name_pl,brands,nutriments,serving_quantity';

function fromOFF(p) {
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : null);
  if (kcal == null) return null;
  const name = [p.product_name_pl || p.product_name, p.brands ? p.brands.split(',')[0] : ''].filter(Boolean).join(' · ');
  if (!name) return null;
  const portions = [];
  if (p.serving_quantity) portions.push(Math.round(Number(p.serving_quantity)));
  return {
    id: 'off:' + p.code, barcode: p.code, name,
    per100: { kcal: Math.round(kcal), p: round1(n.proteins_100g), c: round1(n.carbohydrates_100g), f: round1(n.fat_100g) },
    portions, source: 'off',
  };
}
const round1 = v => (v == null ? 0 : Math.round(Number(v) * 10) / 10);

// Wyszukiwarka Open Food Facts bywa przeciążona, więc próbujemy kilku adresów po kolei.
export async function searchOFF(q, signal) {
  const e = encodeURIComponent(q);
  const tries = [
    [`https://search.openfoodfacts.org/search?q=${e}&page_size=20&fields=${FIELDS}`, j => j.hits],
    [`https://world.openfoodfacts.org/api/v2/search?search_terms=${e}&page_size=20&countries_tags_en=poland&fields=${FIELDS}`, j => j.products],
    [`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${e}&search_simple=1&action=process&json=1&page_size=20&fields=${FIELDS}`, j => j.products],
  ];
  for (const [url, pick] of tries) {
    try {
      const r = await fetch(url, { signal });
      if (!r.ok) continue;
      const list = pick(await r.json()) || [];
      return list.map(p => fromOFF({ ...p, brands: Array.isArray(p.brands) ? p.brands.join(',') : p.brands })).filter(Boolean);
    } catch (err) { if (err.name === 'AbortError') throw err; }
  }
  throw new Error('Baza produktów nie odpowiada.');
}

export async function byBarcode(code) {
  const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
  if (!r.ok) throw new Error('Nie znaleziono produktu.');
  const j = await r.json();
  if (j.status !== 1 || !j.product) throw new Error('Nie ma tego kodu w bazie. Dodaj produkt ręcznie.');
  const p = fromOFF({ ...j.product, code });
  if (!p) throw new Error('Produkt bez wartości odżywczych. Dodaj go ręcznie.');
  return p;
}

export const canScan = () => 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia;
