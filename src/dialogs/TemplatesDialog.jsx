import { useRef, useState } from 'react';
import { M, R } from '../lib/constants.js';

export default function TemplatesDialog({
  open,
  onClose,
  templates,
  onSave,
  onLoad,
  onDelete,
  onExportCurrentJson,
  onImportJson,
  font,
}) {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const fileRef = useRef(null);

  if (!open) return null;

  function handleSave() {
    const value = name.trim();
    if (!value) return;
    onSave(value);
    setName('');
  }

  return (
    <div
      style={{
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
      onClick={onClose}
    >
      <div
        style={{
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
        onClick={event => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: R.full, background: M.outlineVar }} />
        </div>

        <div style={{ padding: '12px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: M.onSurface }}>Workspace Templates</div>
            <div style={{ fontSize: 12, color: M.onSurfaceVar, marginTop: 2 }}>
              Save a full sticker workspace, export it as JSON, or import one back.
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

        <div style={{ padding: '0 20px 14px', flexShrink: 0, borderBottom: `1px solid ${M.outlineVar}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
            Save Current Workspace
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{
              flex: 1,
              border: `${focused ? 2 : 1}px solid ${focused ? M.primary : M.outlineVar}`,
              borderRadius: R.full,
              background: M.s0,
              padding: '9px 16px',
            }}>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && handleSave()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Template name..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: 14,
                  color: M.onSurface,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              style={{
                padding: '9px 20px',
                borderRadius: R.full,
                background: name.trim() ? M.primary : M.s3,
                color: name.trim() ? M.onPrimary : M.onSurfaceVar,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              Save
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => onExportCurrentJson(name.trim())}
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
              Export Current JSON
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
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 28px' }}>
          {templates.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: M.onSurfaceVar,
              fontSize: 14,
              background: M.s2,
              borderRadius: R.md,
              border: `1.5px dashed ${M.outlineVar}`,
              marginTop: 4,
            }}>
              <div style={{ fontWeight: 500 }}>No templates saved yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Save the current workspace or import a JSON template.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...templates].reverse().map(template => {
                const snapshot = template.snapshot || template;
                const count = snapshot.stickers?.length || 0;
                return (
                  <div key={template.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: R.md,
                    background: M.s0,
                    border: `1px solid ${M.outlineVar}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: M.onSurface,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>
                        {count} stickers | {snapshot.font} | {String(snapshot.paperSize).toUpperCase()} | fixed 6-col page
                      </div>
                      <div style={{ fontSize: 10, color: M.outline, marginTop: 1 }}>
                        {template.savedAt ? new Date(template.savedAt).toLocaleString() : 'Imported template'}
                      </div>
                    </div>
                    <button onClick={() => onLoad(template)} style={{
                      padding: '7px 14px',
                      borderRadius: R.full,
                      background: M.primaryContainer,
                      color: M.onPrimaryContainer,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      Load
                    </button>
                    <button onClick={() => onDelete(template.id)} style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: 'none',
                      background: M.errorContainer,
                      color: M.error,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}>
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
