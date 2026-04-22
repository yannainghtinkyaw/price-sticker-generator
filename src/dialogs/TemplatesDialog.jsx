import { useState } from 'react';
import { M, R } from '../lib/constants.js';

export default function TemplatesDialog({ open, onClose, templates, onSave, onLoad, onDelete, font }) {
  const [name,    setName]    = useState('');
  const [focused, setFocused] = useState(false);

  if (!open) return null;

  function handleSave() {
    const n = name.trim();
    if (!n) return;
    onSave(n);
    setName('');
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.52)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        fontFamily: `'${font}',sans-serif`,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: M.s1,
          borderRadius: `${R.xl}px ${R.xl}px 0 0`,
          width: '100%', maxWidth: 480,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp .25s cubic-bezier(.2,0,0,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: R.full, background: M.outlineVar }} />
        </div>

        {/* Header */}
        <div style={{ padding: '12px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: M.onSurface }}>Workspace Templates</div>
            <div style={{ fontSize: 12, color: M.onSurfaceVar, marginTop: 2 }}>
              {templates.length} saved · tap Load to restore · saved in browser
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none',
            background: M.s3, color: M.onSurfaceVar, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Save current as template */}
        <div style={{ padding: '0 20px 14px', flexShrink: 0, borderBottom: `1px solid ${M.outlineVar}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
            Save Current Workspace
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 1,
              border: `${focused ? 2 : 1}px solid ${focused ? M.primary : M.outlineVar}`,
              borderRadius: R.full, background: M.s0,
              padding: '9px 16px',
              transition: 'border .15s',
            }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Template name…"
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  width: '100%', fontSize: 14, color: M.onSurface, fontFamily: 'inherit',
                }}
                autoFocus
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              style={{
                padding: '9px 20px', borderRadius: R.full,
                background: name.trim() ? M.primary : M.s3,
                color: name.trim() ? M.onPrimary : M.onSurfaceVar,
                border: 'none', fontSize: 13, fontWeight: 600,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                flexShrink: 0, transition: 'all .15s', fontFamily: 'inherit',
              }}
            >Save</button>
          </div>
        </div>

        {/* Template list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 28px' }}>
          {templates.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 16px',
              color: M.onSurfaceVar, fontSize: 14,
              background: M.s2, borderRadius: R.md,
              border: `1.5px dashed ${M.outlineVar}`,
              marginTop: 4,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📑</div>
              <div style={{ fontWeight: 500 }}>No templates saved yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Enter a name above and click Save</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...templates].reverse().map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: R.md,
                  background: M.s0, border: `1px solid ${M.outlineVar}`,
                  transition: 'box-shadow .15s',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: M.onSurface,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>
                      {t.products.length} stickers · {t.font} · {t.gridCols} cols · {String(t.paperSize).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 10, color: M.outline, marginTop: 1 }}>
                      {new Date(t.savedAt).toLocaleDateString()} · browser storage
                    </div>
                  </div>
                  <button onClick={() => { onLoad(t); onClose(); }} style={{
                    padding: '7px 14px', borderRadius: R.full,
                    background: M.primaryContainer, color: M.onPrimaryContainer,
                    border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>Load</button>
                  <button onClick={() => onDelete(t.id)} style={{
                    width: 30, height: 30, borderRadius: '50%', border: 'none',
                    background: M.errorContainer, color: M.error,
                    fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
