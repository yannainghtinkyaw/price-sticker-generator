/* ── Layout selection ──────────────────────────────────────────── */
const BADGE_FOR_LAYOUT = {
  1: 'FLAGSHIP', 2: 'NEW ARRIVAL', 3: 'BATTERY', 4: 'CAMERA PRO',
  5: 'FLASH DEAL', 6: 'LUXURY', 7: 'TOP RATED', 8: 'GAMING', 9: 'VALUE', 10: 'OFFER',
};

export function getCardTheme(phone, forcedLayout = 0) {
  const price    = Number(phone.price)    || 0;
  const oldPrice = Number(phone.oldPrice) || 0;
  const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

  if (forcedLayout > 0) {
    return { layout: forcedLayout, badgeText: BADGE_FOR_LAYOUT[forcedLayout] || 'FEATURED', discount };
  }

  // Auto-select (legacy / when forcedLayout=0)
  const battery   = Number(phone.battery)  || 0;
  const brand     = String(phone.brand || '').trim().toLowerCase();
  const featured  = phone.featuredSpec || '';
  const specCount = [phone.camera, phone.chip, phone.display, phone.has5g].filter(Boolean).length;

  if (price >= 1500000)               return { layout: 6,  badgeText: 'LUXURY',      discount };
  if (discount >= 20)                 return { layout: 5,  badgeText: 'FLASH DEAL',  discount };
  if (battery >= 5500)                return { layout: 3,  badgeText: 'BATTERY',     discount };
  if (/asus.?rog/i.test(brand))      return { layout: 8,  badgeText: 'GAMING',      discount };
  if (featured === 'camera')          return { layout: 4,  badgeText: 'CAMERA PRO',  discount };
  if (price > 0 && price <= 500000)   return { layout: 9,  badgeText: 'VALUE',       discount };
  if (/^apple$/i.test(brand))        return { layout: 2,  badgeText: 'NEW ARRIVAL', discount };
  if (specCount >= 3 && discount > 0) return { layout: 10, badgeText: 'OFFER',       discount };
  if (specCount >= 3)                 return { layout: 7,  badgeText: 'TOP RATED',   discount };
  return                                     { layout: 1,  badgeText: 'FLAGSHIP',    discount };
}

/* ── Spec priority list ────────────────────────────────────────── */
export function getPrioritySpecs(phone, n = 4) {
  const out = [];
  if (phone.battery) out.push({ key: 'battery', icon: '🔋', label: 'BATTERY', value: `${phone.battery} mAh`, raw: +phone.battery });
  if (phone.camera)  out.push({ key: 'camera',  icon: '📸', label: 'CAMERA',  value: `${phone.camera} MP`,  raw: +phone.camera  });
  if (phone.chip)    out.push({ key: 'chip',    icon: '⚡', label: 'CHIP',    value: phone.chip,             raw: 0              });
  if (phone.rom)     out.push({ key: 'storage', icon: '💾', label: 'STORAGE', value: `${phone.rom} GB`,      raw: +phone.rom     });
  if (phone.display) out.push({ key: 'display', icon: '🖥', label: 'DISPLAY', value: `${phone.display}"`,    raw: +phone.display });
  if (phone.has5g)   out.push({ key: '5g',      icon: '📶', label: '5G',      value: '5G',                  raw: 100            });
  if (phone.ram)     out.push({ key: 'ram',     icon: '💡', label: 'RAM',     value: `${phone.ram} GB`,      raw: parseInt(phone.ram) || 0 });
  return out.slice(0, n);
}

/* ── Progress bar percentage (Layout 9) ───────────────────────── */
const BAR_MAX = { battery: 7000, camera: 200, storage: 512, display: 7, ram: 16 };
const CHIP_SCORES = {
  'a18 pro': 98, 'a17 pro': 95, 'a16 bionic': 92, 'a15 bionic': 88,
  'snapdragon 8 gen 3': 95, 'sd 8 gen 3': 95, 'snapdragon 8 gen 2': 90,
  'dimensity 9300': 90, 'dimensity 9200': 85,
  'tensor g4': 82, 'tensor g3': 78, 'tensor g2': 72,
  'helio g99': 62, 'helio g96': 55,
  'snapdragon 7s gen 3': 72, 'snapdragon 7 gen 3': 78,
};
function chipScore(name) {
  const k = (name || '').toLowerCase();
  for (const [n, s] of Object.entries(CHIP_SCORES)) if (k.includes(n)) return s;
  return 68;
}
export function barPct(spec) {
  if (spec.key === 'chip')    return chipScore(spec.value);
  if (spec.key === '5g')      return 100;
  const m = BAR_MAX[spec.key];
  if (!m) return 68;
  return Math.max(14, Math.min(100, Math.round(spec.raw / m * 100)));
}

/* ── Brand / model parsing ─────────────────────────────────────── */
const KNOWN_BRANDS = [
  'Samsung','Apple','Google','Xiaomi','Redmi','OnePlus','Sony',
  'ASUS ROG','ASUS','Oppo','Vivo','Realme','Motorola','Nothing','Infinix',
];
export function parseBrand(phone) {
  if (phone.brand?.trim()) return phone.brand.trim();
  const n = phone.name || '';
  for (const b of KNOWN_BRANDS) if (n.toLowerCase().startsWith(b.toLowerCase())) return b;
  return (n.split(' ')[0] || '');
}
export function parseModel(phone) {
  if (phone.brand?.trim()) return phone.name || '';
  const brand = parseBrand(phone);
  const n = phone.name || '';
  return n.slice(brand.length).trim() || n;
}
