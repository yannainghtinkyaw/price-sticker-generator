import { M, R } from '../lib/constants.js';

export default function Switch({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <div style={{
        width: 48, height: 28, borderRadius: R.full, position: 'relative',
        background: value ? M.primary : M.surfaceVar,
        border:     value ? 'none' : `2px solid ${M.outline}`,
        transition: 'all 0.2s',
      }}>
        <div style={{
          position: 'absolute',
          top:  value ? 4 : 5,
          left: value ? 23 : 5,
          width:  value ? 20 : 18,
          height: value ? 20 : 18,
          borderRadius: '50%',
          background:  value ? M.onPrimary : M.outline,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
        }} />
      </div>
    </div>
  );
}
