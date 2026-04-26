import { M, R, THEMES } from '../lib/constants.js';
import { STYLE_CATALOG, clampGridCols, clampGridRows, createSticker, getStyleMeta } from '../lib/stickerModel.js';
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
  onClose,
  onSave,
  previewCardProps,
}) {
  if (!open) return null;

  const activeColor = THEMES[formData.theme]?.color || M.primary;
  const formStyleMeta = getStyleMeta(formStyleKey);
  const previewSticker = createSticker({
    id: 'preview',
    styleKey: formStyleKey,
    gridCols: formGridCols,
    gridRows: formGridRows,
    data: formData,
  });

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase' }}>Product details</div>
          <Field label="Product Name" value={formData.name} onChange={event => setFormData(value => ({ ...value, name: event.target.value }))} placeholder="e.g. Samsung Galaxy A55 5G" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Brand" value={formData.brand} onChange={event => setFormData(value => ({ ...value, brand: event.target.value }))} placeholder="e.g. Samsung" />
            <Field label="Price (THB)" value={formData.price} onChange={event => setFormData(value => ({ ...value, price: event.target.value }))} placeholder="e.g. 9990" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Field label="RAM" value={formData.ram} onChange={event => setFormData(value => ({ ...value, ram: event.target.value }))} placeholder="8" />
            <Field label="ROM" value={formData.rom} onChange={event => setFormData(value => ({ ...value, rom: event.target.value }))} placeholder="256" />
            <Field label="Battery" value={formData.battery} onChange={event => setFormData(value => ({ ...value, battery: event.target.value }))} placeholder="5000" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Camera" value={formData.camera} onChange={event => setFormData(value => ({ ...value, camera: event.target.value }))} placeholder="50" />
            <Field label="Display" value={formData.display} onChange={event => setFormData(value => ({ ...value, display: event.target.value }))} placeholder="6.7" />
          </div>
          <Field label="Chip" value={formData.chip} onChange={event => setFormData(value => ({ ...value, chip: event.target.value }))} placeholder="e.g. Snapdragon 8 Gen 3" />
          <Field label="Old Price" value={formData.oldPrice} onChange={event => setFormData(value => ({ ...value, oldPrice: event.target.value }))} placeholder="optional" />
        </div>

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

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: M.onSurfaceVar, textTransform: 'uppercase', marginBottom: 10 }}>Sticker Style Fill</div>
          <StyleToggle value={formData.filled} onChange={value => setFormData(current => ({ ...current, filled: value }))} color={activeColor} />
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase' }}>Behavior</div>
          <div style={{ padding: '12px 14px', borderRadius: 12, background: M.s2, border: `1px solid ${M.outlineVar}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>One-line name</div>
              <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>Trim long names to a single line</div>
            </div>
            <Switch value={formData.ellipsis} onChange={value => setFormData(current => ({ ...current, ellipsis: value }))} />
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 12, background: M.s2, border: `1px solid ${M.outlineVar}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>5G Connectivity</div>
              <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>Show 5G data in premium layouts</div>
            </div>
            <Switch value={!!formData.has5g} onChange={value => setFormData(current => ({ ...current, has5g: value }))} />
          </div>

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
          <div style={{ maxWidth: formGridCols >= 3 ? 360 : formGridCols === 2 ? 240 : 160, padding: 10, borderRadius: 14, background: M.s2, border: `1px solid ${M.outlineVar}` }}>
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
