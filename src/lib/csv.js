/**
 * Parse a CSV / TSV text into { headers, rows }.
 * Handles simple quoted fields, UTF-8 content, Thai & English headers.
 */
export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0]
    .split(',')
    .map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  const rows = lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    const obj  = {};
    headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
    return obj;
  }).filter(r => Object.values(r).some(v => v));

  return { headers, rows };
}

/**
 * Attempt to auto-map CSV headers to our internal field names.
 * Returns a map of { name, ram, rom, battery, price } → column index (or -1).
 */
export function autoMap(headers) {
  const find = keys => {
    for (const k of keys) {
      const i = headers.findIndex(h => h.includes(k));
      if (i >= 0) return i;
    }
    return -1;
  };

  return {
    name:    find(['name', 'model', 'product', 'สินค้า', 'ชื่อ']),
    ram:     find(['ram', 'memory', 'แรม']),
    rom:     find(['rom', 'storage', 'internal', 'พื้นที่']),
    battery: find(['battery', 'batt', 'mah', 'แบต']),
    price:   find(['price', 'ราคา', 'thb', 'baht', 'cost']),
  };
}
