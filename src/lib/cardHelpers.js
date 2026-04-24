export const BB  = "'Bebas Neue', Impact, sans-serif";
export const DM  = "'DM Mono', 'Courier New', monospace";
export const BAR = "'Barlow', sans-serif";
export const PF  = "'Playfair Display', Georgia, serif";

export const fmtP = n => Number(n || 0).toLocaleString();

export function fmtSave(old, cur) {
  const d = +old - +cur;
  if (d <= 0) return '';
  if (d >= 1000000) return `SAVE ${+(d / 1000000).toFixed(1)}M`;
  if (d >= 1000)    return `SAVE ${Math.round(d / 1000)}K`;
  return `SAVE ${d}`;
}
