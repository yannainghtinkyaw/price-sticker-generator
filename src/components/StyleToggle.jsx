import { M, R } from '../lib/constants.js';

export default function StyleToggle({ value, onChange, color }) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${M.outline}`, borderRadius: R.full, overflow: 'hidden' }}>
      {[{ v: false, icon: '○', label: 'Outline' }, { v: true, icon: '●', label: 'Filled' }].map((opt, i) => {
        const on = value === opt.v;
        return (
          <button key={String(opt.v)} onClick={() => onChange(opt.v)} style={{
            flex: 1, padding: '9px 0', border: 'none',
            borderLeft: i > 0 ? `1px solid ${M.outline}` : 'none',
            background: on ? color : 'transparent',
            color:      on ? '#fff' : M.onSurfaceVar,
            fontSize: 13, fontWeight: on ? 600 : 400, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.13s', fontFamily: 'inherit',
          }}>
            <span>{opt.icon}</span>{opt.label}
          </button>
        );
      })}
    </div>
  );
}
