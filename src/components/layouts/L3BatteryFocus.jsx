import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';

const GR = '#4CAF50';

export default function L3BatteryFocus({ phone, brand, model, specs, theme }) {
  const rest = specs.filter(s => s.key !== 'battery').slice(0, 3);

  return (
    <div style={{ background: '#0a1a0a', borderRadius: 13, overflow: 'hidden', color: '#fff' }}>
      <div style={{ padding: '10px 12px 2px' }}>
        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 9, color: GR, letterSpacing: 2,
            textTransform: 'uppercase' }}>
            {brand}
          </div>
        )}
        <div style={{ fontFamily: BB, fontSize: 20, letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 8 }}>
          {model || phone.name}
        </div>
      </div>

      {/* Battery hero */}
      <div style={{ background: '#0f2b0f', margin: '0 8px 8px', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🔋</span>
          <div>
            <div style={{ fontFamily: BB, fontSize: 28, color: GR, letterSpacing: 1, lineHeight: 1 }}>
              {phone.battery} mAh
            </div>
            <div style={{ fontFamily: BAR, fontSize: 8.5, color: '#4a7a4a', letterSpacing: 0.8 }}>
              All-Day Battery
            </div>
          </div>
        </div>
        {phone.chargeWatt ? (
          <div style={{ fontFamily: BAR, fontSize: 9, color: '#3a9c3a', marginTop: 5,
            display: 'flex', alignItems: 'center', gap: 3 }}>
            ⚡ {phone.chargeWatt}W Fast Charge
          </div>
        ) : (
          <div style={{ fontFamily: BAR, fontSize: 9, color: '#3a9c3a', marginTop: 5 }}>
            ⚡ Fast Charge
          </div>
        )}
      </div>

      {/* Other spec boxes */}
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rest.length}, 1fr)`,
          gap: 5, padding: '0 8px 8px' }}>
          {rest.map(s => (
            <div key={s.key} style={{ background: '#0f2b0f', borderRadius: 7,
              padding: '6px 5px', textAlign: 'center' }}>
              <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 500, color: '#fff' }}>
                {s.value.replace(' GB', '').replace(' MP', '')}
              </div>
              <div style={{ fontFamily: BAR, fontSize: 7, color: '#4a7a4a',
                letterSpacing: 0.5, marginTop: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price */}
      <div style={{ padding: '0 12px 11px', display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between' }}>
        <div>
          {phone.oldPrice && (
            <div style={{ fontFamily: DM, fontSize: 9, color: '#2e4a2e', textDecoration: 'line-through' }}>
              {fmtP(phone.oldPrice)}
            </div>
          )}
          <div style={{ fontFamily: BB, fontSize: 26, color: GR, letterSpacing: 0.5, lineHeight: 1 }}>
            {fmtP(phone.price)}
          </div>
        </div>
        {theme.discount > 0 ? (
          <div style={{ background: GR, color: '#000', borderRadius: 20, padding: '3px 9px',
            fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
            -{theme.discount}%
          </div>
        ) : (
          <div style={{ background: GR, color: '#000', borderRadius: 20, padding: '3px 9px',
            fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
            BEST VALUE
          </div>
        )}
      </div>
    </div>
  );
}
