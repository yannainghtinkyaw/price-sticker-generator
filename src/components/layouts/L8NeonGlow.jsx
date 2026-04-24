import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';

const CYAN = '#00FFEE';
const MAG  = '#FF00CC';

export default function L8NeonGlow({ phone, brand, model, specs, theme }) {
  return (
    <div style={{ background: '#080808', borderRadius: 13, overflow: 'hidden', color: '#fff' }}>
      {/* Neon gradient top border */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${CYAN}, ${MAG}, ${CYAN})` }} />

      <div style={{ padding: '10px 12px 12px' }}>
        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 9, color: CYAN, letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 2 }}>
            {brand}
          </div>
        )}
        <div style={{
          fontFamily: BB, fontSize: 21, letterSpacing: 1, lineHeight: 1.1, marginBottom: 9,
          textShadow: `0 0 12px ${CYAN}66`,
        }}>
          {model || phone.name}
        </div>

        {/* 2×2 spec grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 9 }}>
          {specs.slice(0, 4).map((s, i) => {
            const accent = i % 2 === 0 ? CYAN : MAG;
            return (
              <div key={s.key} style={{
                background: '#111', borderRadius: 7, padding: '5px 7px',
                border: `1px solid ${accent}22`,
              }}>
                <div style={{ fontSize: 12, filter: `drop-shadow(0 0 4px ${accent})` }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: BAR, fontSize: 7.5, color: accent,
                  letterSpacing: 0.8, marginTop: 1, opacity: 0.8 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: DM, fontSize: 10, fontWeight: 500, marginTop: 1 }}>
                  {s.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {phone.oldPrice && (
              <div style={{ fontFamily: DM, fontSize: 9.5, color: '#444', textDecoration: 'line-through' }}>
                {fmtP(phone.oldPrice)}
              </div>
            )}
            <div style={{
              fontFamily: BB, fontSize: 26, letterSpacing: 0.5, lineHeight: 1,
              color: CYAN, textShadow: `0 0 14px ${CYAN}88`,
            }}>
              {fmtP(phone.price)}
            </div>
          </div>
          {theme.discount > 0 ? (
            <div style={{ background: MAG, color: '#000', borderRadius: 20, padding: '3px 9px',
              fontFamily: BAR, fontSize: 11, fontWeight: 700,
              boxShadow: `0 0 10px ${MAG}66` }}>
              -{theme.discount}%
            </div>
          ) : phone.has5g ? (
            <div style={{ border: `1px solid ${CYAN}`, color: CYAN, borderRadius: 20,
              padding: '3px 9px', fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
              5G
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
