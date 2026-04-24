import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';

const OG = '#FF6B35';

export default function L1DarkHero({ phone, brand, model, specs, theme }) {
  return (
    <div style={{ background: '#0e0e0e', borderRadius: 13, overflow: 'hidden', color: '#fff' }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${OG}, ${OG}77)` }} />
      <div style={{ padding: '10px 12px 12px' }}>

        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 9, color: '#777', letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 2 }}>
            {brand}
          </div>
        )}
        <div style={{ fontFamily: BB, fontSize: 22, letterSpacing: 1, lineHeight: 1.1, marginBottom: 9 }}>
          {model || phone.name}
        </div>

        {/* 2×2 spec grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 9 }}>
          {specs.slice(0, 4).map(s => (
            <div key={s.key} style={{ background: '#1c1c1c', borderRadius: 7, padding: '5px 7px' }}>
              <div style={{ fontSize: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: BAR, fontSize: 7.5, color: '#666', letterSpacing: 0.8, marginTop: 1 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: DM, fontSize: 10, fontWeight: 500, marginTop: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {phone.oldPrice && (
              <div style={{ fontFamily: DM, fontSize: 9.5, color: '#555', textDecoration: 'line-through' }}>
                {fmtP(phone.oldPrice)}
              </div>
            )}
            <div style={{ fontFamily: BB, fontSize: 26, letterSpacing: 0.5, lineHeight: 1 }}>
              {fmtP(phone.price)}
            </div>
          </div>
          {theme.discount > 0 ? (
            <div style={{ background: OG, color: '#fff', borderRadius: 20, padding: '3px 9px',
              fontFamily: BAR, fontSize: 11, fontWeight: 700 }}>
              -{theme.discount}%
            </div>
          ) : phone.has5g ? (
            <div style={{ background: '#0f2a45', color: '#5aacff', borderRadius: 20,
              padding: '3px 9px', fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
              5G
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
