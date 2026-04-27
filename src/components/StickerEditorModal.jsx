import { useRef } from 'react';
import { M, R, THEMES } from '../lib/constants.js';
import { STYLE_CATALOG, clampGridCols, clampGridRows, createSticker, getStyleEditorConfig, getStyleMeta } from '../lib/stickerModel.js';
import Field from './Field.jsx';
import Switch from './Switch.jsx';
import StyleToggle from './StyleToggle.jsx';
import PriceTagCard from './PriceTagCard.jsx';
import StickerCard from './StickerCard.jsx';

function compressImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          const s = MAX / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function ImageUploadSlot({ label, value, onChange }) {
  const ref = useRef(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div
        onClick={() => ref.current?.click()}
        style={{
          height: 120,
          borderRadius: 12,
          border: value ? 'none' : `1.5px dashed ${M.outline}`,
          background: value ? 'transparent' : M.s2,
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {value ? (
          <>
            <img src={value} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <button
              onClick={e => { e.stopPropagation(); onChange(''); }}
              style={{
                position: 'absolute', top: 4, right: 4,
                width: 20, height: 20, borderRadius: 999,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: 11, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: M.onSurfaceVar }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 4px' }}>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <div style={{ fontSize: 10, fontWeight: 700 }}>Upload</div>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async e => {
          const file = e.target.files?.[0];
          if (file) onChange(await compressImage(file));
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function StickerEditorModal({
  open,
  editingId,
  formStyleKey,
  setFormStyleKey,
  formGridCols,
  setFormGridCols,
  formGridRows,
  setFormGridRows,
  formData,
  setFormData,
  addToShelf,
  setAddToShelf,
  font,
  canSave,
  pageRows,
  onClose,
  onSave,
  previewCardProps,
}) {
  if (!open) return null;

  const activeColor = THEMES[formData.theme]?.color || M.primary;
  const formStyleMeta = getStyleMeta(formStyleKey);
  const editorConfig = getStyleEditorConfig(formStyleKey);
  const visibleFields = new Set([...editorConfig.fields, ...(editorConfig.optionalFields || [])]);
  const visibleBehavior = new Set(editorConfig.behavior || []);
  const visibleAppearance = new Set(editorConfig.appearance || []);
  const isFullPagePoster = formStyleMeta.layout === 11;
  const previewSticker = createSticker({
    id: 'preview',
    styleKey: formStyleKey,
    gridCols: formGridCols,
    gridRows: formGridRows,
    data: formData,
  });

  const fieldMeta = {
    name: { label: 'Product Name', placeholder: 'e.g. Samsung Galaxy A55 5G' },
    brand: { label: 'Brand', placeholder: 'e.g. Samsung' },
    price: { label: 'Price (THB)', placeholder: 'e.g. 9990' },
    ram: { label: 'RAM', placeholder: '8' },
    rom: { label: 'ROM', placeholder: '256' },
    battery: { label: 'Battery', placeholder: '5000' },
    camera: { label: 'Camera', placeholder: '50' },
    display: { label: 'Display', placeholder: '6.7' },
    chip: { label: 'Chip', placeholder: 'e.g. Snapdragon 8 Gen 3' },
    oldPrice: { label: 'Old Price', placeholder: 'optional' },
    featuredSpec: { label: 'Feature Note', placeholder: 'e.g. Dual Stereo, Tuned by JBL' },
  };

  const renderField = key => {
    if (!visibleFields.has(key)) return null;
    const meta = fieldMeta[key];
    return (
      <Field
        key={key}
        label={meta.label}
        value={formData[key]}
        onChange={event => setFormData(value => ({ ...value, [key]: event.target.value }))}
        placeholder={meta.placeholder}
      />
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,50,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 16, backdropFilter: 'blur(10px)' }}>
      <div className="modal-card" style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', maxHeight: '92vh', overflowY: 'auto', border: `1px solid ${M.outlineVar}` }}>
        <div style={{ padding: '22px 22px 14px', borderBottom: `1px solid ${M.outlineVar}`, position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: M.onSurface, lineHeight: 1.2 }}>
            {editingId ? 'Edit Sticker Model' : 'Create Sticker Model'}
          </div>
          <div style={{ fontSize: 13, color: M.onSurfaceVar, marginTop: 3 }}>
            Build a clear shelf tag first, then tune the style.
          </div>
        </div>

        <div style={{ padding: '18px 22px 20px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', marginBottom: 6 }}>Style</div>
            <select className="ctrl-select" value={formStyleKey} onChange={event => {
              const style = getStyleMeta(event.target.value);
              setFormStyleKey(style.key);
              setFormGridCols(clampGridCols(style.defaultGridCols ?? 1));
              setFormGridRows(clampGridRows(style.defaultGridRows ?? 1));
            }}>
              {STYLE_CATALOG.map(style => <option key={style.key} value={style.key}>{style.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', marginBottom: 6 }}>Grid Size</div>
            <div style={{ height: 39, borderRadius: 10, border: `1.5px solid ${M.outlineVar}`, background: M.s2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: M.onSurface }}>
              {formStyleMeta.fixedSize ? `${formStyleMeta.defaultGridCols} x ${formStyleMeta.defaultGridRows}` : `${formGridCols} x ${formGridRows}`}
            </div>
          </div>
        </div>

        {isFullPagePoster && (
          <div style={{
            marginBottom: 18,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(0,0,0,0.04)',
            border: `1px solid ${M.outlineVar}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: M.onSurface }}>
              Full-page poster style
            </div>
            <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 4 }}>
              This layout uses 6 x {formStyleMeta.defaultGridRows} grid cells and works best on an empty A4 page. If the current page has no room, it will move to another page.
            </div>
            {pageRows < formStyleMeta.defaultGridRows && (
              <div style={{ fontSize: 11, color: M.error, marginTop: 6, fontWeight: 700 }}>
                Current paper grid is shorter than this poster style.
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase' }}>Product details</div>
          {renderField('name')}
          {(visibleFields.has('price') || visibleFields.has('brand')) && (
            <div style={{ display: 'grid', gridTemplateColumns: visibleFields.has('price') && visibleFields.has('brand') ? '1fr 1fr' : '1fr', gap: 8 }}>
              {renderField('brand')}
              {renderField('price')}
            </div>
          )}
          {(visibleFields.has('ram') || visibleFields.has('rom') || visibleFields.has('battery')) && (
            <div style={{ display: 'grid', gridTemplateColumns: [visibleFields.has('ram'), visibleFields.has('rom'), visibleFields.has('battery')].filter(Boolean).length >= 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
              {renderField('ram')}
              {renderField('rom')}
              {renderField('battery')}
            </div>
          )}
          {(visibleFields.has('camera') || visibleFields.has('display')) && (
            <div style={{ display: 'grid', gridTemplateColumns: visibleFields.has('camera') && visibleFields.has('display') ? '1fr 1fr' : '1fr', gap: 8 }}>
              {renderField('camera')}
              {renderField('display')}
            </div>
          )}
          {renderField('chip')}
          {renderField('featuredSpec')}
          {renderField('oldPrice')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
            {[...editorConfig.required].map(key => (
              <div key={key} style={{ padding: '4px 8px', borderRadius: 999, background: M.s2, border: `1px solid ${M.outlineVar}`, fontSize: 10, fontWeight: 700, color: M.onSurfaceVar }}>
                Required: {fieldMeta[key]?.label || key}
              </div>
            ))}
          </div>
        </div>

        {formStyleKey === 'L11' && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>Product Images</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <ImageUploadSlot label="Back View" value={formData.imageBack} onChange={v => setFormData(d => ({ ...d, imageBack: v }))} />
              <ImageUploadSlot label="Front View" value={formData.imageFront} onChange={v => setFormData(d => ({ ...d, imageFront: v }))} />
              <ImageUploadSlot label="Side View" value={formData.imageSide} onChange={v => setFormData(d => ({ ...d, imageSide: v }))} />
            </div>
          </div>
        )}

        {visibleAppearance.has('theme') && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Visual style</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', marginBottom: 10 }}>Sticker Color</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {THEMES.map((theme, index) => (
              <div key={theme.label}
                onClick={() => setFormData(value => ({ ...value, theme: index }))}
                title={theme.label}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: theme.color,
                  cursor: 'pointer',
                  border: formData.theme === index ? '3px solid #fff' : '3px solid transparent',
                  boxShadow: formData.theme === index ? `0 0 0 3px ${theme.color}` : '0 2px 6px rgba(0,0,0,0.15)',
                  transform: formData.theme === index ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all .15s',
                }}
              />
            ))}
          </div>
        </div>
        )}

        {visibleAppearance.has('filled') && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', marginBottom: 10 }}>Sticker Style Fill</div>
          <StyleToggle value={formData.filled} onChange={value => setFormData(current => ({ ...current, filled: value }))} color={activeColor} />
        </div>
        )}

        {formStyleKey === 'classic' && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', marginBottom: 10 }}>Text Colors</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[
              { colorKey: 'nameColor', label: 'Name' },
              { colorKey: 'priceColor', label: 'Price' },
              { colorKey: 'ramColor', label: 'RAM' },
              { colorKey: 'romColor', label: 'ROM' },
              { colorKey: 'batteryColor', label: 'Battery' },
            ].map(({ colorKey, label }) => {
              const currentColor = formData[colorKey];
              return (
                <div key={colorKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: currentColor || '#e0e0e0',
                      border: currentColor ? '3px solid #fff' : '2px dashed #bbb',
                      boxShadow: currentColor ? `0 0 0 3px ${currentColor}` : '0 2px 6px rgba(0,0,0,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all .15s',
                    }}>
                      <input
                        type="color"
                        value={currentColor || '#000000'}
                        onChange={e => setFormData(v => ({ ...v, [colorKey]: e.target.value }))}
                        style={{ position: 'absolute', opacity: 0, width: '200%', height: '200%', top: '-50%', left: '-50%', cursor: 'pointer' }}
                      />
                    </div>
                  </label>
                  <div style={{ fontSize: 9, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  {currentColor && (
                    <button
                      onClick={() => setFormData(v => ({ ...v, [colorKey]: '' }))}
                      style={{ fontSize: 8, color: M.onSurfaceVar, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                    >
                      reset
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: M.onSurfaceVar, marginTop: 8 }}>
            Leave unset to use the sticker color.
          </div>
        </div>
        )}

        <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase' }}>Behavior</div>
          {visibleBehavior.has('ellipsis') && (
          <div style={{ padding: '12px 14px', borderRadius: 12, background: M.s2, border: `1px solid ${M.outlineVar}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>One-line name</div>
              <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>Trim long names to a single line</div>
            </div>
            <Switch value={formData.ellipsis} onChange={value => setFormData(current => ({ ...current, ellipsis: value }))} />
          </div>
          )}

          {visibleBehavior.has('has5g') && (
          <div style={{ padding: '12px 14px', borderRadius: 12, background: M.s2, border: `1px solid ${M.outlineVar}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>5G Connectivity</div>
              <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>Show 5G data in premium layouts</div>
            </div>
            <Switch value={!!formData.has5g} onChange={value => setFormData(current => ({ ...current, has5g: value }))} />
          </div>
          )}

          <div style={{ padding: '12px 14px', borderRadius: 12, background: addToShelf ? 'rgba(0,0,0,0.05)' : M.s2, border: `1px solid ${M.outlineVar}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>Save to shelf too</div>
              <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>Store this exact sticker model for reuse</div>
            </div>
            <Switch value={addToShelf} onChange={setAddToShelf} />
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', marginBottom: 8 }}>
            Preview
          </div>
          <div style={{ maxWidth: isFullPagePoster ? 420 : (formGridCols >= 3 ? 360 : formGridCols === 2 ? 240 : 160), padding: 10, borderRadius: 14, background: M.s2, border: `1px solid ${M.outlineVar}` }}>
            {formStyleKey === 'classic'
              ? <StickerCard p={previewSticker.data} font={font} {...previewCardProps} />
              : <PriceTagCard p={previewSticker.data} font={font} forcedLayout={getStyleMeta(formStyleKey).layout} {...previewCardProps} />}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '12px 0', borderRadius: R.full, border: `1.5px solid ${M.outlineVar}`, background: '#fff', color: M.primary, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={!canSave}
            style={{ flex: 2, padding: '12px 0', borderRadius: R.full, border: 'none', background: canSave ? M.gradient : M.s3, color: canSave ? '#fff' : M.onSurfaceVar, fontSize: 14, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
            {editingId ? 'Save Sticker Model' : 'Create Sticker Model'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
