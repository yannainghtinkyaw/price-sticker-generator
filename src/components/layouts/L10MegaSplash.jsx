import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';

const P1 = '#2D0050';
const P2 = '#5C0099';
const AC = '#CF6BFF';

export default function L10MegaSplash({ phone, brand, model, specs, theme }) {
  const pills = [
    phone.has5g   && '5G',
    phone.ram     && `${phone.ram} RAM`,
    phone.chip    && phone.chip,
  ].filter(Boolean);

  return (
    <div style={{
      background: `linear-gradient(160deg, ${P1} 0%, ${P2} 60%, ${P1} 100%)`,
      borderRadius: 13, overflow: 'hidden', color: '#fff',
    }}>

      {/* Offer top banner */}
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        padding: '6px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9 }}>⚡</span>
          <span style={{ fontFamily: BAR, fontSize: 8.5, color: 'rgba(255,255,255,0.7)',
            letterSpacing: 1, textTransform: 'uppercase' }}>
            {theme.badgeText === 'OFFER' ? 'WEEKEND OFFER · LIMITED STOCK' : 'LIMITED STOCK OFFER'}
          </span>
        </div>
        {theme.discount > 0 && (
          <div style={{ background: '#fff', color: P1, borderRadius: 20, padding: '2px 7px',
            fontFamily: BAR, fontSize: 9.5, fontWeight: 800 }}>
            -{theme.discount}%
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px 12px' }}>
        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 9, color: 'rgba(255,255,255,0.5)',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
            {brand}
          </div>
        )}
        <div style={{ fontFamily: BB, fontSize: 21, letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 9 }}>
          {model || phone.name}
        </div>

        {/* 2×2 hero spec grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
          {specs.slice(0, 4).map(s => (
            <div key={s.key} style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '7px 8px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: 14, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 500, color: '#fff', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: BAR, fontSize: 7.5, color: 'rgba(255,255,255,0.45)',
                letterSpacing: 0.5, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tag pills */}
        {pills.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 9 }}>
            {pills.map(p => (
              <div key={p} style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 20, padding: '2px 8px',
                fontFamily: BAR, fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 600,
              }}>
                {p}
              </div>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {phone.oldPrice && (
              <div style={{ fontFamily: DM, fontSize: 9.5, color: 'rgba(255,255,255,0.35)',
                textDecoration: 'line-through' }}>
                {fmtP(phone.oldPrice)}
              </div>
            )}
            <div style={{ fontFamily: BB, fontSize: 26, color: AC, letterSpacing: 0.5, lineHeight: 1 }}>
              {fmtP(phone.price)}
            </div>
          </div>
          <div style={{ background: AC, color: P1, borderRadius: 20, padding: '6px 14px',
            fontFamily: BAR, fontSize: 11, fontWeight: 800, cursor: 'default' }}>
            BUY NOW
          </div>
        </div>
      </div>
    </div>
  );
}
