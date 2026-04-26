import { M, R } from '../lib/constants.js';

export default function AppToolbar({
  reservedDrawerSpace,
  styleDrawerOpen,
  templatesCount,
  stickersCount,
  page,
  totalPages,
  dlOpen,
  setDlOpen,
  onOpenStyles,
  onOpenTemplates,
  onOpenCsv,
  font,
  setFont,
  fonts,
  paperSize,
  setPaperSize,
  paperSizes,
  onGenerateImage,
  onGeneratePDF,
  pagesCount,
  selectedStyleName,
  clearConfirm,
  onClearAll,
  icons,
}) {
  const { cardStack, layers, upload, chevDown, image, file } = icons;

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 500,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(22px)',
          borderBottom: `1px solid ${M.outlineVar}`,
          padding: `0 ${20 + reservedDrawerSpace}px 0 20px`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 64,
          boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: M.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            boxShadow: M.shadowGlow,
          }}
        >
          ST
        </div>
        <div>
          <div className="grad-text" style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>Sticker Studio</div>
          <div style={{ fontSize: 10, color: M.onSurfaceVar }}>{stickersCount} stickers | page {page + 1}/{totalPages}</div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="appbar-desktop-controls" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <select className="ctrl-select appbar-chip-select" value={font} onChange={event => setFont(event.target.value)} style={{ fontFamily: `'${font}', sans-serif`, minWidth: 150 }}>
            {fonts.map(fontOption => <option key={fontOption.name} value={fontOption.name}>{fontOption.name}</option>)}
          </select>
          <select className="ctrl-select appbar-chip-select" value={paperSize} onChange={event => setPaperSize(event.target.value)} style={{ minWidth: 180 }}>
            {paperSizes.map(size => <option key={size.id} value={size.id}>{size.label} - {size.desc}</option>)}
          </select>
        </div>

        <div
          style={{
            padding: '8px 12px',
            borderRadius: R.full,
            background: M.primaryContainer,
            color: M.primary,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <span className="bar-label">New style: </span>{selectedStyleName}
        </div>

        <button onClick={onOpenStyles} title="Sticker styles"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: R.full,
            background: styleDrawerOpen ? M.primaryContainer : 'rgba(0,0,0,0.04)',
            color: styleDrawerOpen ? M.primary : M.onSurfaceVar,
            border: styleDrawerOpen ? `1px solid ${M.outlineVar}` : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all .15s',
          }}>
          {cardStack}
        </button>

        <button onClick={onOpenTemplates} title="Workspace templates"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: R.full,
            background: templatesCount > 0 ? M.primaryContainer : 'rgba(0,0,0,0.04)',
            color: templatesCount > 0 ? M.primary : M.onSurfaceVar,
            border: templatesCount > 0 ? `1px solid ${M.outlineVar}` : '1px solid transparent',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
          {layers}
          <span className="bar-label">{templatesCount > 0 ? `Templates (${templatesCount})` : 'Templates'}</span>
        </button>

        <button onClick={onOpenCsv} title="Import CSV"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: R.full,
            background: 'rgba(0,0,0,0.04)',
            color: M.onSurfaceVar,
            border: '1px solid transparent',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
          {upload}
          <span className="bar-label">Import</span>
        </button>

        <button onClick={onClearAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: R.full,
            background: '#fff',
            color: clearConfirm ? M.error : M.onSurface,
            border: `1px solid ${clearConfirm ? M.error : M.outlineVar}`,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
          <span>{clearConfirm ? 'Confirm Clear' : 'Clear All'}</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setDlOpen(open => !open)} title="Download options"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: R.full,
              background: dlOpen ? M.primaryContainer : 'rgba(0,0,0,0.04)',
              color: dlOpen ? M.primary : M.onSurfaceVar,
              border: dlOpen ? `1px solid ${M.outlineVar}` : '1px solid transparent',
              cursor: 'pointer',
            }}>
            {chevDown}
          </button>

          {dlOpen && (
            <div className="dl-panel" style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: '#fff',
              border: `1px solid ${M.outlineVar}`,
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
              minWidth: 220,
              zIndex: 300,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px 8px', fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Download Options
              </div>
              {[
                { icon: image, label: 'PNG', sub: 'Download captured page as image', action: onGenerateImage },
                { icon: file, label: 'PDF', sub: 'Convert captured pages into PDF', action: onGeneratePDF },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    fontFamily: 'inherit',
                  }}>
                  <span style={{ color: M.primary, display: 'flex', background: M.primaryContainer, borderRadius: 8, padding: 6 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: M.onSurface }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: M.onSurfaceVar }}>{item.sub}</div>
                  </div>
                </button>
              ))}
              <div style={{ padding: '8px 16px 12px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 11, color: M.onSurfaceVar }}>{stickersCount} stickers | {pagesCount} pages</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {dlOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 400 }} onClick={() => setDlOpen(false)} />}
    </>
  );
}
