import { useState } from 'react';
import { THEMES } from '../lib/constants.js';
import L0ClassicSimple from './layouts/L0ClassicSimple.jsx';

export default function StickerCard({
  p, font, onClick, onDelete, onSave, active,
  isDragging, dragOverClass,
  onDragStart, onDragEnd, onDragOver, onDragEnter, onDragLeave, onDrop,
  ...rest
}) {
  const [hov, setHov] = useState(false);
  const c = THEMES[p.theme].color;
  const filled = !!p.filled;

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
        border: active ? `2px solid ${c}` : (filled ? 'none' : `1.5px solid ${c}`),
        borderRadius: 14,
        height: '100%',
        background: filled ? `linear-gradient(145deg, ${c} 0%, ${c}CC 100%)` : '#fff',
        cursor: 'grab',
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
      {hov && (
        <button
          onClick={e => { e.stopPropagation(); onSave(); }}
          title="Save to shelf"
          style={{
            position: 'absolute',
            bottom: 5,
            left: 5,
            background: filled ? 'rgba(255,255,255,0.22)' : `${c}18`,
            color: filled ? '#fff' : c,
            border: 'none',
            borderRadius: 6,
            width: 22,
            height: 22,
            fontSize: 11,
            cursor: 'pointer',
            zIndex: 3,
            fontWeight: 900,
            padding: 0,
            lineHeight: '22px',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          ★
        </button>
      )}

      {hov && (
        <div
          style={{
            position: 'absolute',
            bottom: 5,
            right: 5,
            background: 'rgba(0,0,0,0.18)',
            color: '#fff',
            fontSize: 7,
            fontWeight: 700,
            borderRadius: 4,
            padding: '2px 5px',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
            zIndex: 3,
          }}
        >
          ...
        </div>
      )}

      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        title="Delete"
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          width: 22,
          height: 22,
          border: 'none',
          borderRadius: 6,
          background: filled ? 'rgba(255,255,255,0.22)' : 'rgba(239,68,68,0.1)',
          color: filled ? '#fff' : '#EF4444',
          cursor: 'pointer',
          zIndex: 3,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          lineHeight: 1,
          opacity: hov ? 1 : 0.45,
          transform: hov ? 'scale(1.1)' : 'scale(1)',
          transition: 'all .15s',
        }}
      >
        x
      </button>

      <L0ClassicSimple phone={p} color={c} filled={filled} />
    </div>
  );
}
