import { useState } from 'react';
import { M, R, THEMES } from '../lib/constants.js';

export default function StickerCard({
  p, font, onClick, onDelete, onSave, active,
  isDragging, dragOverClass,
  onDragStart, onDragEnd, onDragOver, onDragEnter, onDragLeave, onDrop,
  ...rest
}) {
  const [hov, setHov] = useState(false);
  const c      = THEMES[p.theme].color;
  const filled = !!p.filled;
  const bg     = filled ? c : '#fff';
  const fg     = filled ? '#fff' : c;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`${isDragging ? 'dc' : ''} ${dragOverClass || ''}`}
      style={{
        border:     active ? `2.5px solid ${c}` : `1.5px solid ${c}40`,
        borderRadius: R.md, padding: '10px 8px 8px',
        background: active ? (filled ? c : `${c}18`) : bg,
        cursor: 'grab', position: 'relative',
        fontFamily: `'${font}',sans-serif`, userSelect: 'none',
        boxShadow: hov
          ? `0 4px 18px ${c}44,0 2px 8px rgba(0,0,0,0.08)`
          : '0 1px 4px rgba(0,0,0,0.07)',
        transform: hov ? 'translateY(-2px) scale(1.03)' : 'scale(1)',
        transition: 'all 0.15s cubic-bezier(.2,0,0,1)',
        outline: active ? `2.5px solid ${c}` : 'none', outlineOffset: 2,
      }}
      {...rest}>

      {/* ★ Save to shelf */}
      {hov && (
        <button onClick={e => { e.stopPropagation(); onSave(); }} title="Save to shelf"
          style={{
            position: 'absolute', bottom: 4, left: 4,
            background: `${c}22`, color: c,
            border: 'none', borderRadius: R.xs,
            width: 18, height: 18, fontSize: 10, cursor: 'pointer',
            zIndex: 3, fontWeight: 900, padding: 0, lineHeight: '18px', textAlign: 'center',
          }}>★</button>
      )}

      {/* Drag handle hint */}
      {hov && (
        <div style={{
          position: 'absolute', bottom: 4, right: 4,
          background: 'rgba(0,0,0,0.15)', color: '#fff',
          fontSize: 7, fontWeight: 700, borderRadius: R.xs, padding: '1px 4px', pointerEvents: 'none',
        }}>⠿</div>
      )}

      {/* Filled badge */}
      {filled && (
        <div style={{
          position: 'absolute', top: 3, left: 4,
          background: 'rgba(255,255,255,0.25)', color: '#fff',
          fontSize: 7, fontWeight: 700, borderRadius: R.xs, padding: '1px 4px',
        }}>FILL</div>
      )}

      {/* 🗑 Delete — always visible, more prominent on hover */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        title="Delete"
        style={{
          position: 'absolute', top: 4, right: 4,
          width: 20, height: 20,
          border: 'none', borderRadius: R.xs,
          background: filled ? 'rgba(255,255,255,0.22)' : M.errorContainer,
          color:      filled ? '#fff' : M.onErrorContainer,
          cursor: 'pointer', zIndex: 3, padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, lineHeight: 1,
          opacity:   hov ? 1 : 0.55,
          transform: hov ? 'scale(1.15)' : 'scale(1)',
          transition: 'opacity .15s, transform .15s',
        }}>🗑</button>

      {/* Name */}
      <div style={{
        fontWeight: 900, fontSize: 11.5, color: fg,
        textAlign: 'center', lineHeight: 1.25, marginBottom: 2,
        marginTop: filled ? 6 : 0,
        ...(p.ellipsis
          ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }
          : {}),
      }}>{p.name}</div>

      <div style={{ fontSize: 9.5, color: fg, textAlign: 'center', opacity: .85 }}>
        Ram {p.ram} / Rom {p.rom} GB
      </div>
      <div style={{ fontSize: 9.5, color: fg, textAlign: 'center', opacity: .85 }}>
        Battery : {p.battery} mAh
      </div>

      {/* Price badge */}
      <div style={{
        border: `1.5px solid ${filled ? 'rgba(255,255,255,0.8)' : c}`,
        background: filled ? 'rgba(255,255,255,0.12)' : 'transparent',
        borderRadius: R.sm, marginTop: 6, padding: '3px 0',
        fontWeight: 900, fontSize: 16, color: fg, textAlign: 'center',
      }}>{p.price}.-</div>
    </div>
  );
}
