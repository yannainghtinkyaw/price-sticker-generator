import { useState, useEffect } from 'react';
import { M, R, THEMES } from '../lib/constants.js';

export default function ShelfPickDialog({ open, onClose, savedCards, font, cardStyle, onPickShelf, onNewCreate, onRemoveShelf }) {
  const [search,        setSearch]        = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => { if (!open) setSearch(''); }, [open]);

  const filtered = savedCards.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.price.includes(search)
  );

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.52)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
      fontFamily: `'${font}',sans-serif`,
    }}>
      <div style={{
        background: M.s1,
        borderRadius: `${R.xl}px ${R.xl}px 0 0`,
        width: '100%', maxWidth: 480,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        maxHeight: '82vh',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp .25s cubic-bezier(.2,0,0,1)',
      }}>

        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: R.full, background: M.outlineVar }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: M.onSurface }}>Add from Shelf</div>
            <div style={{ fontSize: 12, color: M.onSurfaceVar, marginTop: 2 }}>
              {savedCards.length} saved · tap to add to grid
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none',
            background: M.s3, color: M.onSurfaceVar, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: `${searchFocused ? 2 : 1}px solid ${searchFocused ? M.primary : M.outlineVar}`,
            borderRadius: R.full,
            background: M.s0, padding: '9px 16px',
            transition: 'border .15s',
          }}>
            <span style={{ fontSize: 16, opacity: .5 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or price…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                flex: 1, fontSize: 14, color: M.onSurface, fontFamily: 'inherit',
              }}
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: M.onSurfaceVar, padding: 0 }}>✕</button>
            )}
          </div>
        </div>

        {/* Card list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 88 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: M.onSurfaceVar, fontSize: 14 }}>
              {search ? `No results for "${search}"` : 'Shelf is empty'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(s => {
                const c      = THEMES[s.theme].color;
                const filled = !!s.filled;
                return (
                  <div key={s.savedId}
                    onClick={() => { onPickShelf(s); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '11px 14px', borderRadius: R.md,
                      border: `1px solid ${c}33`,
                      background: filled ? c : M.s0,
                      cursor: 'pointer',
                      transition: 'all .14s cubic-bezier(.2,0,0,1)',
                      position: 'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = `0 3px 14px ${c}44`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

                    {/* Left colour accent */}
                    <div style={{
                      width: 4, height: '100%', position: 'absolute', left: 0, top: 0,
                      background: c, borderRadius: `${R.md}px 0 0 ${R.md}px`,
                    }} />

                    <div style={{ marginLeft: 4, flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 13,
                        color: filled ? '#fff' : M.onSurface,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: filled ? 'rgba(255,255,255,0.7)' : M.onSurfaceVar, marginTop: 1 }}>
                        {cardStyle === 'premium'
                          ? [s.brand, s.chip, s.camera ? `${s.camera}MP` : null].filter(Boolean).join(' · ') || `${s.battery || ''}mAh`
                          : `Ram ${s.ram} / Rom ${s.rom} GB · ${s.battery} mAh`
                        }
                      </div>
                    </div>

                    <div style={{
                      padding: '5px 14px', borderRadius: R.full,
                      border: `1.5px solid ${filled ? 'rgba(255,255,255,0.7)' : c}`,
                      background: filled ? 'rgba(255,255,255,0.14)' : 'transparent',
                      color: filled ? '#fff' : c,
                      fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap',
                    }}>{s.price}.-</div>

                    <button
                      onClick={e => { e.stopPropagation(); onRemoveShelf(s.savedId); }}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', border: 'none',
                        background: filled ? 'rgba(255,255,255,0.2)' : M.s3,
                        color: filled ? '#fff' : M.onSurfaceVar,
                        fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '14px 20px 20px',
          background: `linear-gradient(to top, ${M.s1} 70%, transparent)`,
          pointerEvents: 'none',
        }}>
          <button
            onClick={() => { onClose(); onNewCreate(); }}
            style={{
              width: '100%', padding: '14px 0', borderRadius: R.xl, border: 'none',
              background: M.primary, color: M.onPrimary,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,84,163,0.35)',
              fontFamily: `'${font}',sans-serif`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              pointerEvents: 'all',
              transition: 'all .15s cubic-bezier(.2,0,0,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,84,163,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,84,163,0.35)'; e.currentTarget.style.transform = 'none'; }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>＋</span>
            Create New Sticker
          </button>
        </div>
      </div>
    </div>
  );
}
