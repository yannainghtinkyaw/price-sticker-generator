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
        padding: '6px 14px', borderRadius: R.sm,
        border:      selected ? 'none' : `1px solid ${M.outline}`,
        background:  selected ? (color || M.secondaryContainer) : (hov ? M.s3 : 'transparent'),
        color:       selected ? (color ? '#fff' : M.onSecondaryContainer) : M.onSurfaceVar,
        fontSize: 13, fontWeight: selected ? 600 : 400,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'all 0.13s', userSelect: 'none', whiteSpace: 'nowrap',
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
