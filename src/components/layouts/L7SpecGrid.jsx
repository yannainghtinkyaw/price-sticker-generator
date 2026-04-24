import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';

export default function L7SpecGrid({ phone, brand, model, specs6, theme }) {
  const cells = specs6.length > 0 ? specs6 : [];

  return (
    <div style={{ background: '#fff', borderRadius: 13, overflow: 'hidden', border: '1px solid #e8e8e8' }}>

      {/* Dark header */}
      <div style={{ background: '#111', padding: '10px 12px 10px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#fff', borderRadius: 20, padding: '3px 9px', marginBottom: 7 }}>
          <span style={{ fontSize: 10 }}>🏆</span>
          <span style={{ fontFamily: BAR, fontSize: 9.5, fontWeight: 800, color: '#111', letterSpacing: 0.8 }}>
            TOP RATED
          </span>
        </div>
        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 9, color: '#777', letterSpacing: 2,
            textTransform: 'uppercase' }}>
            {brand}
          </div>
        )}
        <div style={{ fontFamily: BB, fontSize: 22, color: '#fff', letterSpacing: 0.5, lineHeight: 1.1 }}>
          {model || phone.name}
        </div>
      </div>

      {/* 6-cell spec grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '10px 10px 6px' }}>
        {cells.slice(0, 6).map(s => (
          <div key={s.key} style={{ background: '#f7f7f7', borderRadius: 8, padding: '7px 8px' }}>
            <div style={{ fontSize: 14 }}>{s.icon}</div>
            <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 500, color: '#111', marginTop: 3 }}>
              {s.value}
            </div>
            <div style={{ fontFamily: BAR, fontSize: 7.5, color: '#999', letterSpacing: 0.6, marginTop: 1 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Price + CTA */}
      <div style={{ padding: '4px 10px 10px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          {phone.oldPrice && (
            <div style={{ fontFamily: DM, fontSize: 9.5, color: '#aaa', textDecoration: 'line-through' }}>
              {fmtP(phone.oldPrice)}
            </div>
          )}
          <div style={{ fontFamily: BB, fontSize: 24, color: '#111', letterSpacing: 0.5, lineHeight: 1 }}>
            {fmtP(phone.price)}
          </div>
        </div>
        <div style={{ background: '#111', color: '#fff', borderRadius: 20,
          padding: '6px 14px', fontFamily: BAR, fontSize: 11, fontWeight: 700, cursor: 'default' }}>
          BUY NOW
        </div>
      </div>

    </div>
  );
}
