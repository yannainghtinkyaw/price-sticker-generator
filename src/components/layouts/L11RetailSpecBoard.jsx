import { BB, BAR, DM, fmtP } from "../../lib/cardHelpers.js";

const SPEC_ITEMS = [
  {
    key: "display",
    icon: "LCD",
    title: "DISPLAY",
    fallback: '6.78" 1.5K 3D Curved AMOLED',
  },
  {
    key: "battery",
    icon: "BAT",
    title: "BATTERY",
    fallback: "5500mAh 45W Fast Charge",
  },
  {
    key: "software",
    icon: "OS",
    title: "SOFTWARE",
    fallback: "Android 15, 3 Major Updates",
  },
  {
    key: "chip",
    icon: "CPU",
    title: "CHIP",
    fallback: "MediaTek Dimensity 7100 SoC",
  },
  {
    key: "memory",
    icon: "MEM",
    title: "MEMORY",
    fallback: "8GB LPDDR5X / 128GB UFS 2.2",
  },
  {
    key: "connectivity",
    icon: "WIFI",
    title: "CONNECTIVITY",
    fallback: "5.5G / Wi‑Fi 6 / BT 5.4 / NFC",
  },
  {
    key: "camera",
    icon: "CAM",
    title: "CAMERA",
    fallback: "50MP AI Triple (108MP Mode)",
  },
  {
    key: "audio",
    icon: "JBL",
    title: "AUDIO",
    fallback: "Dual Stereo, Tuned by JBL",
  },
  {
    key: "durability",
    icon: "IP65",
    title: "DURABILITY",
    fallback: "IP65 Dust & Water Resistant",
  },
];

const BOTTOM_FEATURES = [
  { title: "GT-LIGHTING", text: "Interactive Mecha Light" },
  { title: "GT-TRIGGER", text: "Pressure-Sensitive" },
  { title: "COOLING", text: "Micro-Pump Liquid" },
  { title: "G-NETWORK", text: "AI Gaming Network" },
];

const BOTTOM_STATS = [
  { value: "90+", label: "FPS STABILITY" },
  { value: "2160Hz", label: "TOUCH RESPONSE" },
  { value: "Bypass", label: "HEAT REDUCTION" },
];

function specValue(phone, item) {
  switch (item.key) {
    case "display":
      return phone.display ? `${phone.display}" AMOLED` : item.fallback;
    case "battery":
      return phone.battery ? `${phone.battery}mAh Fast Charge` : item.fallback;
    case "chip":
      return phone.chip || item.fallback;
    case "camera":
      return phone.camera
        ? `${phone.camera}MP AI Triple Camera`
        : item.fallback;
    case "memory":
      if (phone.ram || phone.rom)
        return `${phone.ram || "8"}GB / ${phone.rom || "128"}GB`;
      return item.fallback;
    case "software":
      return phone.has5g ? "Android 15, 5G Ready" : item.fallback;
    case "connectivity":
      return phone.has5g ? "5G / Wi‑Fi / BT / NFC" : "Wi‑Fi / BT / NFC";
    case "audio":
      return phone.featuredSpec || item.fallback;
    default:
      return item.fallback;
  }
}

const PLACEHOLDER_STYLE = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderRadius: 12,
  border: "1.5px dashed rgba(0,0,0,0.15)",
  background: "rgba(0,0,0,0.03)",
  color: "rgba(0,0,0,0.25)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
};

function PhoneImage({ src, label, mainSlot }) {
  const size = mainSlot
    ? { width: "44%", maxHeight: 280 }
    : { width: "26%", maxHeight: 220 };

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        style={{
          ...size,
          objectFit: "contain",
          opacity: mainSlot ? 1 : 0.82,
          transform: mainSlot ? "none" : "scale(0.9)",
          transition: "transform .2s",
        }}
      />
    );
  }
  return (
    <div style={{ ...PLACEHOLDER_STYLE, ...size, minHeight: mainSlot ? 200 : 160 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <circle cx="12" cy="18" r="1" />
      </svg>
      {label}
    </div>
  );
}

export default function L11RetailSpecBoard({ phone }) {
  const title = phone.name || "INFINIX NOTE EDGE 5G";
  const memoryLine = `${phone.ram || "8"}GB RAM / ${phone.rom || "128"}GB ROM`;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        color: "#111",
        padding: "28px 26px 26px",
        minHeight: 980,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
      }}
    >
      {/* Title + memory */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: BB,
            fontSize: 38,
            lineHeight: 0.95,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: BAR,
            fontSize: 20,
            fontWeight: 800,
            color: "#4b4b4b",
            textAlign: "center",
          }}
        >
          {memoryLine}
        </div>
      </div>

      {/* Image row */}
      <div
        style={{
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.07)",
          background: "linear-gradient(180deg, #f8f9fb 0%, #ffffff 100%)",
          padding: "24px 20px 16px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <PhoneImage src={phone.imageBack} label="BACK" mainSlot={false} />
        <PhoneImage src={phone.imageFront} label="FRONT" mainSlot={true} />
        <PhoneImage src={phone.imageSide} label="SIDE" mainSlot={false} />
      </div>

      {/* Price tag — centred below images */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "12px 32px 10px",
            borderRadius: 16,
            background: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {!!phone.oldPrice && (
            <div
              style={{
                fontFamily: DM,
                fontSize: 14,
                color: "rgba(0,0,0,0.32)",
                textDecoration: "line-through",
              }}
            >
              {fmtP(phone.oldPrice)}
            </div>
          )}
          <div
            style={{
              fontFamily: BB,
              fontSize: 48,
              lineHeight: 0.92,
              color: "#111",
            }}
          >
            {fmtP(phone.price)}
          </div>
          <div
            style={{
              fontFamily: BAR,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1,
              color: "#888",
              marginTop: 4,
            }}
          >
            SPECIAL CASH PRICE
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {SPEC_ITEMS.map((item) => (
          <div
            key={item.key}
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr",
              gap: 10,
              alignItems: "start",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1.5px solid #111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: BAR,
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div style={{ fontFamily: BAR, fontSize: 14, fontWeight: 800 }}>
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: BAR,
                  fontSize: 11.5,
                  lineHeight: 1.28,
                  color: "#4b4b4b",
                }}
              >
                {specValue(phone, item)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "auto",
          borderRadius: 18,
          background: "linear-gradient(135deg, #161f33 0%, #20293d 100%)",
          color: "#fff",
          padding: "22px 24px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 2,
              background: "linear-gradient(90deg, transparent, #31b5ff)",
            }}
          />
          <div
            style={{
              fontFamily: BAR,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            SPECIAL FOR GAMING
          </div>
          <div
            style={{
              flex: 1,
              height: 2,
              background: "linear-gradient(90deg, #31b5ff, transparent)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {BOTTOM_FEATURES.map((item) => (
            <div key={item.title} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: BAR,
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "#37b8ff",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: BAR,
                  fontSize: 9.5,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 3,
                }}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.12)",
            marginBottom: 16,
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {BOTTOM_STATS.map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: BAR, fontSize: 17, fontWeight: 800 }}>
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: BAR,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.62)",
                  marginTop: 2,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
