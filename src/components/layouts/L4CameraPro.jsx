import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';

const PU = '#E040FB';

export default function L4CameraPro({ phone, brand, model, specs, theme }) {
  const cam  = specs.find(s => s.key === 'camera');
  const rest = specs.filter(s => s.key !== 'camera').slice(0, 3);

  return (
    <div style={{ background: '#120820', borderRadius: 13, overflow: 'hidden', color: '#fff' }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${PU}, #7C4DFF)` }} />
      <div style={{ padding: '10px 12px 12px' }}>

        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 9, color: '#9e40cc', letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 2 }}>
            {brand}
          </div>
        )}
        <div style={{ fontFamily: BB, fontSize: 20, letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 8 }}>
          {model || phone.name}
        </div>

        {/* Camera hero */}
        <div style={{
          background: 'rgba(224,64,251,0.1)',
          border: `1px solid ${PU}33`,
          borderRadius: 10, padding: '8px 10px', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 24 }}>📸</span>
          <div>
            <div style={{ fontFamily: BB, fontSize: 26, color: PU, letterSpacing: 1, lineHeight: 1 }}>
              {cam ? cam.value : `${phone.camera || '50'} MP`}
            </div>
            <div style={{ fontFamily: BAR, fontSize: 8, color: '#9e40cc', letterSpacing: 0.8 }}>
              MAIN CAMERA
            </div>
          </div>
        </div>

        {/* Other specs */}
        {rest.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rest.length},1fr)`,
            gap: 4, marginBottom: 9 }}>
            {rest.map(s => (
              <div key={s.key} style={{ background: '#1e0e30', borderRadius: 7,
                padding: '5px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 11 }}>{s.icon}</div>
                <div style={{ fontFamily: DM, fontSize: 10, color: '#ddd', marginTop: 2 }}>{s.value}</div>
                <div style={{ fontFamily: BAR, fontSize: 7, color: '#9e40cc', letterSpacing: 0.5 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {phone.oldPrice && (
              <div style={{ fontFamily: DM, fontSize: 9, color: '#4a2060', textDecoration: 'line-through' }}>
                {fmtP(phone.oldPrice)}
              </div>
            )}
            <div style={{ fontFamily: BB, fontSize: 26, color: PU, letterSpacing: 0.5, lineHeight: 1 }}>
              {fmtP(phone.price)}
            </div>
          </div>
          {theme.discount > 0 && (
            <div style={{ background: PU, color: '#000', borderRadius: 20, padding: '3px 9px',
              fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
              -{theme.discount}%
            </div>
          )}
          {phone.has5g && !theme.discount && (
            <div style={{ background: '#7C4DFF', color: '#fff', borderRadius: 20,
              padding: '3px 9px', fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
              5G
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
