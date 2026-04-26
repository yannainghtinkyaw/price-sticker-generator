import { M, R, THEMES } from '../lib/constants.js';
import { STYLE_CATALOG, clampGridCols, clampGridRows, createSticker, getStyleEditorConfig, getStyleMeta } from '../lib/stickerModel.js';
import Field from './Field.jsx';
import Switch from './Switch.jsx';
import StyleToggle from './StyleToggle.jsx';
import PriceTagCard from './PriceTagCard.jsx';
import StickerCard from './StickerCard.jsx';

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
