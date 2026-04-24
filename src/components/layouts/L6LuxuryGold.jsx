import { BB, DM, BAR, PF, fmtP } from '../../lib/cardHelpers.js';

const GD = '#C9A84C';

export default function L6LuxuryGold({ phone, brand, model, specs, theme }) {
  return (
    <div style={{ background: '#0d0d0d', borderRadius: 13, overflow: 'hidden', color: '#fff' }}>
      {/* Gold gradient top rule */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${GD}00, ${GD}, ${GD}00)` }} />

      <div style={{ padding: '12px 14px 13px' }}>
        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 8.5, color: GD, letterSpacing: 3,
            textTransform: 'uppercase', marginBottom: 4 }}>
            {brand}
          </div>
        )}

        {/* Playfair model name */}
        <div style={{ fontFamily: PF, fontSize: 20, color: GD, fontWeight: 700,
          lineHeight: 1.2, marginBottom: 10 }}>
          {model || phone.name}
        </div>

        {/* Vertical spec list with rules */}
        {specs.map((s, i) => (
          <div key={s.key}>
            {i > 0 && (
              <div style={{ height: 1, background: '#222', margin: '5px 0' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: BAR, fontSize: 9, color: '#666', letterSpacing: 0.8,
                display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </div>
              <div style={{ fontFamily: DM, fontSize: 10.5, color: '#ccc' }}>{s.value}</div>
            </div>
          </div>
        ))}

        {/* Gold bottom rule */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, ${GD}00, ${GD}66, ${GD}00)`,
          margin: '10px 0 8px',
        }} />

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {phone.oldPrice && (
              <div style={{ fontFamily: DM, fontSize: 9, color: '#444', textDecoration: 'line-through' }}>
                {fmtP(phone.oldPrice)}
              </div>
            )}
            <div style={{ fontFamily: BB, fontSize: 26, color: GD, letterSpacing: 1, lineHeight: 1 }}>
              {fmtP(phone.price)}
            </div>
          </div>
          {theme.discount > 0 && (
            <div style={{ border: `1px solid ${GD}`, color: GD, borderRadius: 20,
              padding: '3px 9px', fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
              -{theme.discount}%
            </div>
          )}
          {!theme.discount && (
            <div style={{ fontFamily: BAR, fontSize: 8, color: '#555', letterSpacing: 1 }}>
              {phone.has5g ? '5G · LUXURY' : 'LUXURY'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
