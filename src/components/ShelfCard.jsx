import { useState } from 'react';
import { M, R, THEMES } from '../lib/constants.js';
import PriceTagCard from './PriceTagCard.jsx';

const THUMB_W = 200;
const THUMB_SCALE = 90 / THUMB_W;

export default function ShelfCard({ s, font, cardStyle, onAdd, onRemove, onDragStart, onDragEnd, isDragging, isDropTarget }) {
  const [hov, setHov] = useState(false);

  /* ── Premium thumbnail ─────────────────────────────────────── */
  if (cardStyle > 0) {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onAdd}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        title={`${s.name || s.brand} — tap to add`}
        style={{
          width: 90, height: 122, flexShrink: 0,
          overflow: 'hidden', borderRadius: 10,
          cursor: 'pointer', position: 'relative',
          opacity: isDragging ? 0.25 : 1,
          transform: isDropTarget
            ? 'scale(1.1) translateY(-4px)'
            : hov ? 'scale(1.06) translateY(-3px)' : 'scale(1)',
          boxShadow: hov
            ? '0 10px 28px rgba(0,0,0,0.28)'
            : '0 2px 10px rgba(0,0,0,0.14)',
          transition: 'all 0.16s cubic-bezier(.2,0,0,1)',
          userSelect: 'none',
        }}
      >
        {/* Scaled-down PriceTagCard — no interactions */}
        <div style={{
          width: THUMB_W,
          transform: `scale(${THUMB_SCALE})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}>
          <PriceTagCard
            p={{ ...s, id: s.savedId ?? 0 }}
            font={font}
            layout={cardStyle}
            thumbnail
            onClick={() => {}} onDelete={() => {}} onSave={() => {}}
            active={false} isDragging={false} dragOverClass=""
            onDragStart={() => {}} onDragEnd={() => {}} onDragOver={() => {}}
            onDragEnter={() => {}} onDragLeave={() => {}} onDrop={() => {}}
          />
        </div>

        {/* "tap · drag" hint fades in on hover */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
          padding: '14px 0 4px',
          textAlign: 'center', fontSize: 7.5, color: 'rgba(255,255,255,0.9)', fontWeight: 700,
          opacity: hov ? 1 : 0,
          transition: 'opacity 0.15s',
          pointerEvents: 'none',
        }}>tap · drag</div>

        {/* Remove button */}
        {hov && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{
              position: 'absolute', top: 5, right: 5, zIndex: 10,
              background: 'rgba(0,0,0,0.7)', color: '#fff',
              border: 'none', borderRadius: 5,
              width: 18, height: 18, fontSize: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900,
            }}>✕</button>
        )}
      </div>
    );
  }

  /* ── Classic thumbnail ─────────────────────────────────────── */
  const c      = THEMES[s.theme]?.color ?? '#1a1a1a';
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
          : hov ? 'scale(1.06) translateY(-3px)' : 'scale(1)',
        boxShadow: hov
          ? `0 8px 24px ${c}45, 0 3px 8px rgba(0,0,0,0.08)`
          : filled ? `0 3px 12px ${c}35` : '0 2px 8px rgba(0,0,0,0.07)',
        transition: 'all 0.16s cubic-bezier(.2,0,0,1)',
        fontFamily: `'${font}', sans-serif`,
        userSelect: 'none',
        overflow: 'hidden',
      }}>
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
