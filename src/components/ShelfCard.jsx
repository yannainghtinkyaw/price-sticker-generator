import { useState } from 'react';
import { M, R, THEMES } from '../lib/constants.js';

export default function ShelfCard({ s, font, onAdd, onRemove, onDragStart, onDragEnd, isDragging, isDropTarget }) {
  const [hov, setHov] = useState(false);
  const c      = THEMES[s.theme].color;
  const filled = !!s.filled;
  const fg     = filled ? '#fff' : c;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onAdd}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${s.name} — tap to add`}
      style={{
        width: 90, flexShrink: 0,
        border:     isDropTarget ? `2px dashed ${c}` : (filled ? 'none' : `1px solid ${c}30`),
        borderRadius: 12,
        background: isDropTarget ? `${c}18` : (filled ? `linear-gradient(145deg, ${c}, ${c}CC)` : '#fff'),
        cursor: 'pointer', position: 'relative',
        opacity:   isDragging ? 0.25 : 1,
        transform: isDropTarget
          ? 'scale(1.1) translateY(-4px)'
          : (hov ? 'scale(1.06) translateY(-3px)' : 'scale(1)'),
        boxShadow: hov
          ? `0 8px 24px ${c}45, 0 3px 8px rgba(0,0,0,0.08)`
          : (filled ? `0 3px 12px ${c}35` : '0 2px 8px rgba(0,0,0,0.07)'),
        transition: 'all 0.16s cubic-bezier(.2,0,0,1)',
        fontFamily: `'${font}', sans-serif`,
        userSelect: 'none',
        overflow: 'hidden',
      }}>
      {/* Colour bar at top */}
      {!filled && <div style={{ height: 3, background: `linear-gradient(90deg, ${c}, ${c}77)` }} />}

      <div style={{ padding: '5px 7px 8px' }}>
        <div style={{
          fontSize: 9, fontWeight: 700, color: fg, textAlign: 'center',
          lineHeight: 1.3, marginBottom: 4,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{s.name}</div>

        <div style={{
          fontSize: 13, fontWeight: 900, color: fg, textAlign: 'center',
          border: `1px solid ${filled ? 'rgba(255,255,255,0.7)' : c}`,
          borderRadius: R.xs, padding: '2px 0',
        }}>{s.price}.-</div>

        <div style={{ fontSize: 7, color: filled ? 'rgba(255,255,255,0.5)' : M.outline, textAlign: 'center', marginTop: 3 }}>
          tap · drag
        </div>
      </div>

      {hov && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute', top: 6, right: 5,
            background: M.errorContainer, color: M.onErrorContainer,
            border: 'none', borderRadius: R.xs,
            width: 14, height: 14, fontSize: 8, cursor: 'pointer',
            fontWeight: 900, padding: 0, lineHeight: '14px', textAlign: 'center', zIndex: 3,
          }}>✕</button>
      )}
    </div>
  );
}
