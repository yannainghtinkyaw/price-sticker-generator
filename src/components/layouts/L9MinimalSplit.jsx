import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';
import { barPct } from '../../lib/phoneTheme.js';

export default function L9MinimalSplit({ phone, brand, model, specs, theme }) {
  return (
    <div style={{ borderRadius: 13, overflow: 'hidden', border: '1px solid #e8e8e8' }}>

      {/* White body */}
      <div style={{ background: '#fff', padding: '10px 13px 12px' }}>
        {/* Sub-brand label */}
        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 8.5, color: '#bbb', letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 3 }}>
            {brand}
          </div>
        )}

        {/* Large model name */}
        <div style={{ fontFamily: BB, fontSize: 34, letterSpacing: 0.5, color: '#111',
          lineHeight: 1, marginBottom: 10 }}>
          {model || phone.name}
        </div>

        {/* Progress bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {specs.slice(0, 4).map(s => {
            const pct = barPct(s);
            return (
              <div key={s.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10 }}>{s.icon}</span>
                    <span style={{ fontFamily: BAR, fontSize: 8.5, color: '#aaa',
                      letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      {s.label}
                    </span>
                  </div>
                  <span style={{ fontFamily: DM, fontSize: 9.5, color: '#444' }}>
                    {s.value}
                  </span>
                </div>
                {/* Bar track */}
                <div style={{ height: 4, background: '#eee', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: '#111',
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Black footer */}
      <div style={{ background: '#111', padding: '9px 13px 10px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          {phone.oldPrice && (
            <div style={{ fontFamily: DM, fontSize: 9.5, color: '#555', textDecoration: 'line-through' }}>
              {fmtP(phone.oldPrice)}
            </div>
          )}
          <div style={{ fontFamily: BB, fontSize: 26, color: '#fff', letterSpacing: 0.5, lineHeight: 1 }}>
            {fmtP(phone.price)}
          </div>
        </div>
        {theme.discount > 0 && (
          <div style={{ border: '1px solid #444', color: '#ccc', borderRadius: 20,
            padding: '3px 9px', fontFamily: BAR, fontSize: 10, fontWeight: 700 }}>
            -{theme.discount}%
          </div>
        )}
      </div>

    </div>
  );
}
