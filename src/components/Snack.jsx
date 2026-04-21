import { M, R } from '../lib/constants.js';

export default function Snack({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      background: M.inverseSurface, color: M.inverseOnSurface,
      padding: '12px 22px', borderRadius: R.xs,
      fontSize: 14, fontWeight: 500,
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      zIndex: 9999, whiteSpace: 'nowrap', animation: 'snk .2s ease',
    }}>{msg}</div>
  );
}
