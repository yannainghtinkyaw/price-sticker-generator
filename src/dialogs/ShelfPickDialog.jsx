import { useEffect, useRef, useState } from 'react';
import { M, R, THEMES } from '../lib/constants.js';
import { getStyleMeta } from '../lib/stickerModel.js';

export default function ShelfPickDialog({
  open,
  onClose,
  savedCards,
  font,
  onPickShelf,
  onNewCreate,
  onRemoveShelf,
  onExportJson,
  onImportJson,
}) {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  if (!open) return null;

  const filtered = savedCards.filter(item => {
    const name = item.sticker?.data?.name || '';
    const price = item.sticker?.data?.price || '';
    return name.toLowerCase().includes(search.toLowerCase()) || String(price).includes(search);
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.52)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
      fontFamily: `'${font}',sans-serif`,
    }}
      onClick={onClose}>
      <div style={{
        background: M.s1,
        borderRadius: `${R.xl}px ${R.xl}px 0 0`,
        width: '100%',
        maxWidth: 560,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp .25s cubic-bezier(.2,0,0,1)',
      }}
        onClick={event => event.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: R.full, background: M.outlineVar }} />
        </div>

        <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: M.onSurface }}>Shelf Library</div>
            <div style={{ fontSize: 12, color: M.onSurfaceVar, marginTop: 2 }}>
              Every shelf item keeps its own style, data, and grid span.
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: M.s3,
            color: M.onSurfaceVar,
            fontSize: 16,
            cursor: 'pointer',
          }}>x</button>
        </div>

        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onExportJson}
            disabled={savedCards.length === 0}
            style={{
              padding: '8px 14px',
              borderRadius: R.full,
              border: `1px solid ${M.outlineVar}`,
              background: savedCards.length === 0 ? M.s3 : '#fff',
              color: savedCards.length === 0 ? M.onSurfaceVar : M.onSurface,
              fontSize: 12,
              fontWeight: 600,
              cursor: savedCards.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Export Shelf JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '8px 14px',
              borderRadius: R.full,
              border: `1px solid ${M.outlineVar}`,
              background: '#fff',
              color: M.onSurface,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) onImportJson(file);
              event.target.value = '';
            }}
          />
        </div>

        <div style={{ padding: '0 20px 12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: `${searchFocused ? 2 : 1}px solid ${searchFocused ? M.primary : M.outlineVar}`,
            borderRadius: R.full,
            background: M.s0,
            padding: '9px 16px',
          }}>
            <span style={{ fontSize: 16, opacity: 0.5 }}>S</span>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name or price..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                flex: 1,
                fontSize: 14,
                color: M.onSurface,
                fontFamily: 'inherit',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: M.onSurfaceVar, padding: 0 }}>
                x
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 88 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: M.onSurfaceVar, fontSize: 14 }}>
              {search ? `No results for "${search}"` : 'Shelf is empty'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(item => {
                const data = item.sticker.data;
                const theme = THEMES[data.theme].color;
                const filled = !!data.filled;
                const style = getStyleMeta(item.sticker.styleKey);
                return (
                  <div key={item.id}
                    onClick={() => onPickShelf(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '11px 14px',
                      borderRadius: R.md,
                      border: `1px solid ${theme}33`,
                      background: filled ? theme : M.s0,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                    <div style={{
                      width: 4,
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      background: theme,
                    }} />

                    <div style={{ marginLeft: 4, flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: filled ? '#fff' : M.onSurface,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {data.name}
                      </div>
                      <div style={{ fontSize: 11, color: filled ? 'rgba(255,255,255,0.72)' : M.onSurfaceVar, marginTop: 1 }}>
                        {style.name} | {item.sticker.gridCols} col | RAM {data.ram} | ROM {data.rom}
                      </div>
                    </div>

                    <div style={{
                      padding: '5px 12px',
                      borderRadius: R.full,
                      border: `1.5px solid ${filled ? 'rgba(255,255,255,0.7)' : theme}`,
                      background: filled ? 'rgba(255,255,255,0.14)' : 'transparent',
                      color: filled ? '#fff' : theme,
                      fontWeight: 800,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                    }}>
                      {data.price}.-
                    </div>

                    <button
                      onClick={event => {
                        event.stopPropagation();
                        onRemoveShelf(item.id);
                      }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: 'none',
                        background: filled ? 'rgba(255,255,255,0.2)' : M.s3,
                        color: filled ? '#fff' : M.onSurfaceVar,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 20px 20px',
          background: `linear-gradient(to top, ${M.s1} 70%, transparent)`,
          pointerEvents: 'none',
        }}>
          <button
            onClick={() => {
              onClose();
              onNewCreate();
            }}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: R.xl,
              border: 'none',
              background: M.primary,
              color: M.onPrimary,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: `'${font}',sans-serif`,
              pointerEvents: 'all',
            }}
          >
            Create New Sticker
          </button>
        </div>
      </div>
    </div>
  );
}
