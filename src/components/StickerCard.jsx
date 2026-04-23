import { useState } from 'react';
import { THEMES } from '../lib/constants.js';

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

  const shadow = hov
    ? `0 10px 32px ${c}55, 0 4px 12px rgba(0,0,0,0.1)`
    : filled
      ? `0 4px 18px ${c}45, 0 2px 6px rgba(0,0,0,0.08)`
      : '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)';

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
        border:       active ? `2px solid ${c}` : (filled ? 'none' : `1px solid ${c}22`),
        borderRadius: 14,
        padding:      '13px 10px 11px',
        background:   filled
          ? `linear-gradient(145deg, ${c} 0%, ${c}CC 100%)`
          : bg,
        cursor:       'grab',
        position:     'relative',
        fontFamily:   `'${font}',sans-serif`,
        userSelect:   'none',
        boxShadow:    shadow,
        transform:    hov ? 'translateY(-3px) scale(1.03)' : 'scale(1)',
        transition:   'all 0.2s cubic-bezier(.2,0,0,1)',
        outline:      active ? `3px solid ${c}70` : 'none',
        outlineOffset: 3,
        overflow:     'hidden',
      }}
      {...rest}>

      {/* Top accent strip for outline cards */}
      {!filled && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${c}, ${c}66)`,
          borderRadius: '14px 14px 0 0',
        }} />
      )}

      {/* Shine overlay on hover (filled cards) */}
      {filled && hov && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* ★ Save to shelf */}
      {hov && (
        <button onClick={e => { e.stopPropagation(); onSave(); }} title="Save to shelf"
          style={{
            position: 'absolute', bottom: 5, left: 5,
            background: filled ? 'rgba(255,255,255,0.22)' : `${c}18`,
            color: filled ? '#fff' : c,
            border: 'none', borderRadius: 6,
            width: 22, height: 22, fontSize: 11, cursor: 'pointer',
            zIndex: 3, fontWeight: 900, padding: 0,
            lineHeight: '22px', textAlign: 'center',
            backdropFilter: 'blur(4px)',
          }}>★</button>
      )}

      {/* Drag handle hint */}
      {hov && (
        <div style={{
          position: 'absolute', bottom: 5, right: 5,
          background: 'rgba(0,0,0,0.18)', color: '#fff',
          fontSize: 7, fontWeight: 700, borderRadius: 4,
          padding: '2px 5px', pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
        }}>⠿</div>
      )}

      {/* Filled badge */}
      {filled && (
        <div style={{
          position: 'absolute', top: 4, left: 5,
          background: 'rgba(255,255,255,0.22)',
          color: '#fff', fontSize: 7, fontWeight: 800,
          borderRadius: 4, padding: '1px 5px',
          letterSpacing: 0.5,
        }}>FILL</div>
      )}

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        title="Delete"
        style={{
          position: 'absolute', top: 5, right: 5,
          width: 22, height: 22,
          border: 'none', borderRadius: 6,
          background: filled ? 'rgba(255,255,255,0.22)' : 'rgba(239,68,68,0.1)',
          color:      filled ? '#fff' : '#EF4444',
          cursor: 'pointer', zIndex: 3, padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, lineHeight: 1,
          opacity:   hov ? 1 : 0.45,
          transform: hov ? 'scale(1.1)' : 'scale(1)',
          transition: 'all .15s',
        }}>✕</button>

      {/* Product name */}
      <div style={{
        fontWeight: 900, fontSize: 12, color: fg,
        textAlign: 'center', lineHeight: 1.3, marginBottom: 4,
        marginTop: filled ? 8 : 5,
        ...(p.ellipsis
          ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }
          : {}),
      }}>{p.name}</div>

      {/* Specs */}
      <div style={{ fontSize: 9.5, color: fg, textAlign: 'center', opacity: .75, lineHeight: 1.5 }}>
        RAM {p.ram} / ROM {p.rom} GB
      </div>
      <div style={{ fontSize: 9.5, color: fg, textAlign: 'center', opacity: .75 }}>
        🔋 {p.battery} mAh
      </div>

      {/* Price badge */}
      <div style={{
        border: `1.5px solid ${filled ? 'rgba(255,255,255,0.55)' : c}`,
        background: filled ? 'rgba(255,255,255,0.14)' : 'transparent',
        borderRadius: 10, marginTop: 8, padding: '4px 0',
        fontWeight: 900, fontSize: 17, color: fg,
        textAlign: 'center', letterSpacing: -0.3,
      }}>{p.price}.-</div>
    </div>
  );
}
