import { useState, useEffect } from 'react';
import { BB, DM, BAR, fmtP } from '../../lib/cardHelpers.js';

const RED = '#E53935';

function useCountdown(seed) {
  const init = 7200 + ((seed || 1) % 7) * 900;
  const [secs, setSecs] = useState(init);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor(secs % 3600 / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function L5FlashDeal({ phone, brand, model, specs, theme }) {
  const timer = useCountdown(phone.id || 1);

  return (
    <div style={{ background: '#fff', borderRadius: 13, overflow: 'hidden', border: '1px solid #f0f0f0' }}>

      {/* Red header */}
      <div style={{ background: RED, padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11 }}>⚡</span>
          <span style={{ fontFamily: BAR, fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
            FLASH DEAL
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: BAR, fontSize: 7.5, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8 }}>
            ENDS IN
          </div>
          <div style={{ fontFamily: DM, fontSize: 12, color: '#fff', fontWeight: 500 }}>{timer}</div>
        </div>
      </div>

      <div style={{ padding: '8px 12px 11px' }}>
        {brand && (
          <div style={{ fontFamily: BAR, fontSize: 9, color: '#999', letterSpacing: 2,
            textTransform: 'uppercase' }}>
            {brand}
          </div>
        )}
        <div style={{ fontFamily: BB, fontSize: 20, color: '#111', letterSpacing: 0.5,
          lineHeight: 1.1, marginBottom: 8 }}>
          {model || phone.name}
        </div>

        {/* 3 spec boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginBottom: 8 }}>
          {specs.slice(0, 3).map(s => (
            <div key={s.key} style={{ border: '1px solid #eee', borderRadius: 7,
              padding: '6px 4px', textAlign: 'center' }}>
              <div style={{ fontSize: 13 }}>{s.icon}</div>
              <div style={{ fontFamily: DM, fontSize: 9.5, color: '#111', fontWeight: 500, marginTop: 2 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: BAR, fontSize: 7, color: '#aaa', letterSpacing: 0.5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              {phone.oldPrice && (
                <div style={{ fontFamily: DM, fontSize: 9.5, color: '#bbb',
                  textDecoration: 'line-through' }}>
                  {fmtP(phone.oldPrice)}
                </div>
              )}
              <div style={{ fontFamily: BB, fontSize: 26, color: RED, letterSpacing: 0.5, lineHeight: 1 }}>
                {fmtP(phone.price)}
              </div>
            </div>
            {theme.discount > 0 && (
              <div style={{ background: RED, color: '#fff', borderRadius: 20, padding: '3px 9px',
                fontFamily: BAR, fontSize: 11, fontWeight: 700 }}>
                -{theme.discount}%
              </div>
            )}
          </div>

          {/* Blinking stock warning */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0,
              animation: 'blink 1.1s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: BAR, fontSize: 9.5, color: RED, fontWeight: 700 }}>
              Only 3 left!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
