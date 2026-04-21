import { useState } from 'react';
import { M, R } from '../lib/constants.js';

export default function Field({ label, value, onChange, placeholder, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  const up = focused || value !== '';

  return (
    <div style={{ position: 'relative', marginBottom: 2 }}>
      <div style={{
        border: `${focused ? 2 : 1}px solid ${focused ? M.primary : M.outline}`,
        borderRadius: R.xs, background: M.s1,
        padding: up ? '18px 14px 7px' : '13px 14px',
        transition: 'all 0.15s', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: 14,
          top: up ? 5 : 13, fontSize: up ? 10 : 14,
          color: focused ? M.primary : M.onSurfaceVar,
          fontWeight: up ? 600 : 400,
          transition: 'all 0.15s', pointerEvents: 'none', letterSpacing: 0.4,
        }}>{label}</div>
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={focused ? placeholder : ''}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            width: '100%', fontSize: 14, color: M.onSurface,
            fontFamily: 'inherit', marginTop: up ? 2 : 0,
          }}
        />
      </div>
    </div>
  );
}
