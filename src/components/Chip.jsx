import { useState } from 'react';
import { M, R } from '../lib/constants.js';

export default function Chip({ label, selected, onClick, color }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 14px', borderRadius: R.full,
        border:      selected ? 'none' : `1px solid ${M.outlineVar}`,
        background:  selected ? (color || M.gradient) : (hov ? M.s3 : M.s1),
        color:       selected ? '#fff' : M.onSurfaceVar,
        fontSize: 12, fontWeight: selected ? 700 : 500,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'all 0.13s', userSelect: 'none', whiteSpace: 'nowrap',
        boxShadow: selected ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
      }}>
      {hov && (
        <div style={{
          position: 'absolute', inset: 0,
          background: selected ? '#fff' : M.onSurface,
          opacity: .06, borderRadius: 'inherit', pointerEvents: 'none',
        }} />
      )}
      {label}
    </div>
  );
}
