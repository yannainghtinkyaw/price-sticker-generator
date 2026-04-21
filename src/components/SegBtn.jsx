import { M, R } from '../lib/constants.js';

export default function SegBtn({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${M.outline}`, borderRadius: R.full, overflow: 'hidden' }}>
      {options.map((opt, i) => {
        const sel = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            flex: 1, padding: '7px 14px', border: 'none',
            borderLeft: i > 0 ? `1px solid ${M.outline}` : 'none',
            background: sel ? M.secondaryContainer : 'transparent',
            color:      sel ? M.onSecondaryContainer : M.onSurfaceVar,
            fontSize: 13, fontWeight: sel ? 600 : 400,
            cursor: 'pointer', transition: 'all 0.13s', fontFamily: 'inherit',
          }}>
            {sel && <span style={{ marginRight: 3 }}>✓</span>}{opt}
          </button>
        );
      })}
    </div>
  );
}
