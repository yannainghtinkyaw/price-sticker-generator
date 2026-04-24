import { M, R, CARD_STYLES } from '../lib/constants.js';
import StickerCard  from '../components/StickerCard.jsx';
import PriceTagCard from '../components/PriceTagCard.jsx';

const SAMPLE = {
  id: 0, name: 'Galaxy S25 Ultra', brand: 'Samsung',
  ram: '12', rom: '256', battery: '5000', camera: '200',
  chip: 'Snapdragon 8 Gen 3', display: '6.8', has5g: true,
  price: '49900', oldPrice: '54900', featuredSpec: '',
  theme: 0, filled: false, ellipsis: false,
};

const THUMB_W = 190;
const THUMB_H = 130;
const THUMB_SCALE = (THUMB_W) / 200;

const NOOP = () => {};
const NOOPPROPS = {
  onClick: NOOP, onDelete: NOOP, onSave: NOOP,
  active: false, isDragging: false, dragOverClass: '',
  onDragStart: NOOP, onDragEnd: NOOP, onDragOver: NOOP,
  onDragEnter: NOOP, onDragLeave: NOOP, onDrop: NOOP,
};

function StylePreview({ styleId, font }) {
  return (
    <div style={{ width: '100%', height: THUMB_H, overflow: 'hidden', background: '#f0f0f0', borderRadius: '12px 12px 0 0', position: 'relative' }}>
      <div style={{ width: 200, transform: `scale(${THUMB_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
        {styleId === 0 ? (
          <StickerCard p={{ ...SAMPLE, theme: 2, filled: false }} font={font} {...NOOPPROPS} />
        ) : (
          <PriceTagCard p={SAMPLE} font={font} layout={styleId} thumbnail {...NOOPPROPS} />
        )}
      </div>
    </div>
  );
}

export default function CardStylePickerDialog({ open, current, onSelect, onClose, font }) {
  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.54)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: M.s1, borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 540, maxHeight: '88vh', display: 'flex', flexDirection: 'column', animation: 'slideUp .25s cubic-bezier(.2,0,0,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: R.full, background: M.outlineVar }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: M.onSurface, letterSpacing: -0.3 }}>Card Style</div>
            <div style={{ fontSize: 12, color: M.onSurfaceVar, marginTop: 2 }}>Choose how your price tags look</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: M.s3, color: M.onSurfaceVar, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Scrollable grid */}
        <div style={{ overflowY: 'auto', padding: '12px 16px 32px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {CARD_STYLES.map(style => {
              const sel = current === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => onSelect(style.id)}
                  style={{
                    borderRadius: 14,
                    border: `2.5px solid ${sel ? M.primary : 'rgba(0,0,0,0.07)'}`,
                    background: sel ? 'rgba(0,0,0,0.02)' : '#fff',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all .15s cubic-bezier(.2,0,0,1)',
                    boxShadow: sel ? `0 0 0 4px rgba(0,0,0,0.05)` : '0 1px 6px rgba(0,0,0,0.07)',
                  }}
                >
                  <StylePreview styleId={style.id} font={font} />

                  <div style={{ padding: '9px 12px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: M.onSurface, lineHeight: 1.2 }}>
                        {style.emoji} {style.name}
                      </div>
                      <div style={{ fontSize: 10, color: M.onSurfaceVar, marginTop: 2, lineHeight: 1.3 }}>{style.desc}</div>
                    </div>
                    {sel && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: M.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, fontWeight: 800 }}>✓</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
