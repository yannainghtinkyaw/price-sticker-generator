import { BB, DM, BAR, fmtP, fmtSave } from '../../lib/cardHelpers.js';

const BL = '#1A73E8';

export default function L2BrightCard({ phone, brand, model, specs, theme }) {
  const save = fmtSave(phone.oldPrice, phone.price);

  const statCols = [
    phone.rom     && { val: phone.rom,          sub: 'GB' },
    phone.ram     && { val: phone.ram,           sub: 'GB RAM' },
    phone.display && { val: `${phone.display}"`, sub: 'OLED' },
  ].filter(Boolean).slice(0, 3);

  return (
    <div style={{ background: '#fff', borderRadius: 13, overflow: 'hidden', border: '1px solid #e8e8e8' }}>
      {/* Animated shimmer stripe */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${BL}, #34A853, #FBBC04, ${BL})`,
        backgroundSize: '300% 100%',
        animation: 'shimmerStripe 2.5s linear infinite',
      }} />

      <div style={{ padding: '10px 12px 12px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
          <div>
            {brand && (
              <div style={{ fontFamily: BAR, fontSize: 9, color: '#999', letterSpacing: 2,
                textTransform: 'uppercase' }}>
                {brand}
              </div>
            )}
            <div style={{ fontFamily: BB, fontSize: 20, letterSpacing: 0.5, color: '#111', lineHeight: 1.15 }}>
              {model || phone.name}
            </div>
          </div>
          {phone.has5g && (
            <div style={{ background: BL, color: '#fff', borderRadius: 20, padding: '3px 9px',
              fontFamily: BAR, fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
              5G
            </div>
          )}
        </div>

        {/* Spec pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {specs.slice(0, 3).map(s => (
            <div key={s.key} style={{ background: '#f0f4ff', borderRadius: 20,
              padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 10 }}>{s.icon}</span>
              <span style={{ fontFamily: DM, fontSize: 9.5, color: '#333' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* 3-col stat row */}
        {statCols.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4,
            marginBottom: 9, background: '#f8f8f8', borderRadius: 8, padding: '6px 4px' }}>
            {statCols.map((c, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DM, fontSize: 13, fontWeight: 500, color: '#111' }}>{c.val}</div>
                <div style={{ fontFamily: BAR, fontSize: 7.5, color: '#999', letterSpacing: 0.5 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {phone.oldPrice && (
              <div style={{ fontFamily: DM, fontSize: 9.5, color: '#bbb', textDecoration: 'line-through' }}>
                {fmtP(phone.oldPrice)}
              </div>
            )}
            <div style={{ fontFamily: BB, fontSize: 25, letterSpacing: 0.5, color: BL, lineHeight: 1 }}>
              {fmtP(phone.price)}
            </div>
          </div>
          {save ? (
            <div style={{ background: '#E53935', color: '#fff', borderRadius: 20,
              padding: '4px 9px', fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
              {save}
            </div>
          ) : theme.discount > 0 ? (
            <div style={{ background: '#E53935', color: '#fff', borderRadius: 20,
              padding: '3px 8px', fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
              -{theme.discount}%
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
