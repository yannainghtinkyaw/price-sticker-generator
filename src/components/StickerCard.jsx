import { useRef, useState } from 'react';
import { THEMES } from '../lib/constants.js';
import L0ClassicSimple from './layouts/L0ClassicSimple.jsx';

function OverlayButton({ title, onClick, style, children }) {
  return (
    <button
      onClick={event => {
        event.stopPropagation();
        onClick?.(event);
      }}
      title={title}
      style={{
        width: 22,
        height: 22,
        border: 'none',
        borderRadius: 6,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function StickerCard({
  p, font, onClick, onDoubleClick, onDelete, onSave, active,
  isDragging, dragOverClass,
  onDragStart, onDragEnd, onDragOver, onDragEnter, onDragLeave, onDrop,
  ...rest
}) {
  const [hov, setHov] = useState(false);
  const clickTimerRef = useRef(null);
  const c = THEMES[p.theme].color;
  const filled = !!p.filled;

  const shadow = hov
    ? `0 10px 32px ${c}55, 0 4px 12px rgba(0,0,0,0.1)`
    : filled
      ? `0 4px 18px ${c}45, 0 2px 6px rgba(0,0,0,0.08)`
      : '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)';

  function handleCardClick() {
    if (!onClick) return;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      onClick();
    }, 220);
  }

  function handleCardDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onDoubleClick?.();
  }

  return (
    <div
      draggable
      onDragStart={event => {
        onDragStart?.(event);
      }}
      onDragEnd={event => {
        onDragEnd?.(event);
      }}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`${isDragging ? 'dc' : ''} ${dragOverClass || ''}`}
      style={{
        border: active ? `2px solid ${c}` : (filled ? 'none' : `1.5px solid ${c}`),
        borderRadius: 14,
        height: '100%',
        background: filled ? `linear-gradient(145deg, ${c} 0%, ${c}CC 100%)` : '#fff',
        cursor: hov ? 'grab' : 'default',
        position: 'relative',
        fontFamily: `'${font}',sans-serif`,
        userSelect: 'none',
        boxShadow: shadow,
        transform: hov ? 'translateY(-3px) scale(1.03)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(.2,0,0,1)',
        outline: active ? `3px solid ${c}70` : 'none',
        outlineOffset: 3,
        overflow: 'hidden',
      }}
      {...rest}
    >
      {hov && !isDragging && (
        <>
          <OverlayButton
            onClick={() => onSave?.()}
            title="Save to shelf"
            style={{
              position: 'absolute',
              top: 5,
              left: 5,
              background: filled ? 'rgba(255,255,255,0.22)' : `${c}18`,
              color: filled ? '#fff' : c,
              cursor: 'pointer',
              zIndex: 3,
              backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </OverlayButton>

          <div
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              display: 'flex',
              gap: 6,
              zIndex: 3,
            }}
          >
            <OverlayButton
              onClick={() => onClick?.()}
              title="Edit"
              style={{
                background: filled ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.92)',
                color: filled ? '#fff' : '#111827',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </OverlayButton>

            <OverlayButton
              onClick={() => onDelete?.()}
              title="Delete"
              style={{
                background: filled ? 'rgba(255,255,255,0.22)' : 'rgba(239,68,68,0.1)',
                color: filled ? '#fff' : '#EF4444',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </OverlayButton>
          </div>

          <button
            onDragStart={event => {
              event.stopPropagation();
              onDragStart?.(event);
            }}
            onDragEnd={event => {
              event.stopPropagation();
              onDragEnd?.(event);
            }}
            onClick={event => event.stopPropagation()}
            title="Drag"
            style={{
              position: 'absolute',
              bottom: 5,
              right: 5,
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(0,0,0,0.18)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              border: 'none',
              padding: 0,
              backdropFilter: 'blur(4px)',
              zIndex: 3,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="9" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="15" cy="19" r="1.5" />
            </svg>
          </button>
        </>
      )}

      <L0ClassicSimple phone={p} color={c} filled={filled} />
    </div>
  );
}
