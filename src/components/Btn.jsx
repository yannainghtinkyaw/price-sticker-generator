import { useState } from 'react';
import { M, R } from '../lib/constants.js';

export default function Btn({ variant = 'filled', label, icon, onClick, disabled, style, color, onColor }) {
  const [hov,     setHov]     = useState(false);
  const [pressed, setPressed] = useState(false);

  const styles = {
    filled:   { bg: color || M.primary,            fg: onColor || M.onPrimary,            border: 'none' },
    tonal:    { bg: M.secondaryContainer,           fg: M.onSecondaryContainer,            border: 'none' },
    outlined: { bg: 'transparent',                 fg: color || M.primary,                border: `1.5px solid ${M.outline}` },
    text:     { bg: 'transparent',                 fg: color || M.primary,                border: 'none' },
    error:    { bg: M.errorContainer,              fg: M.onErrorContainer,                border: 'none' },
  };
  const v = styles[variant] || styles.filled;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '9px 18px', borderRadius: R.full,
        background: disabled ? `${M.onSurface}1A` : v.bg,
        color:      disabled ? `${M.onSurface}55` : v.fg,
        border:     disabled ? `1.5px solid ${M.onSurface}1A` : v.border,
        fontSize: 13, fontWeight: 500, letterSpacing: 0.1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: !disabled && variant === 'filled'
          ? (hov ? '0 3px 12px rgba(0,0,0,0.22)' : '0 1px 4px rgba(0,0,0,0.15)')
          : 'none',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.15s cubic-bezier(.2,0,0,1)',
        transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
        fontFamily: 'inherit',
        ...style,
      }}>
      {hov && !disabled && (
        <div style={{
          position: 'absolute', inset: 0,
          background: v.fg, opacity: .08,
          borderRadius: 'inherit', pointerEvents: 'none',
        }} />
      )}
      {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
      {label}
    </button>
  );
}
