export default function L0ClassicSimple({ phone, color, filled }) {
  const bg = filled ? `linear-gradient(145deg, ${color} 0%, ${color}CC 100%)` : '#fff';
  const fg = filled ? '#fff' : color;
  const romFg = phone.romColor || fg;
  const batteryFg = phone.batteryColor || fg;

  return (
    <div
      style={{
        borderRadius: 14,
        height: '100%',
        padding: '14px 12px 10px',
        background: bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!filled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color}, ${color}66)`,
            borderRadius: '14px 14px 0 0',
          }}
        />
      )}

      {filled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {filled && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 5,
            background: 'rgba(255,255,255,0.22)',
            color: '#fff',
            fontSize: 7,
            fontWeight: 800,
            borderRadius: 4,
            padding: '1px 5px',
            letterSpacing: 0.5,
          }}
        >
          FILL
        </div>
      )}

      <div
        style={{
          fontWeight: 900,
          fontSize: 14,
          color: fg,
          textAlign: 'center',
          lineHeight: 1.22,
          marginBottom: 6,
          marginTop: filled ? 12 : 8,
          ...(phone.ellipsis
            ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }
            : {}),
        }}
      >
        {phone.name}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: romFg,
          textAlign: 'center',
          lineHeight: 1.35,
          letterSpacing: 0.1,
          marginBottom: 4,
        }}
      >
        Storage / ROM {phone.rom} GB
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: batteryFg,
          textAlign: 'center',
          lineHeight: 1.3,
          letterSpacing: 0.1,
        }}
      >
        {phone.battery} mAh
      </div>

      <div
        style={{
          border: `1.5px solid ${filled ? 'rgba(255,255,255,0.55)' : color}`,
          background: filled ? 'rgba(255,255,255,0.14)' : 'transparent',
          borderRadius: 10,
          marginTop: 'auto',
          padding: '7px 0 6px',
          fontWeight: 900,
          fontSize: 18,
          color: fg,
          textAlign: 'center',
          letterSpacing: -0.3,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {phone.price}.-
      </div>
    </div>
  );
}
