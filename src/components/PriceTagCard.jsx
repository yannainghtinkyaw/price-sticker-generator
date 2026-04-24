import { useState, useRef } from 'react';
import { getCardTheme, getPrioritySpecs, parseBrand, parseModel } from '../lib/phoneTheme.js';

import L1  from './layouts/L1DarkHero.jsx';
import L2  from './layouts/L2BrightCard.jsx';
import L3  from './layouts/L3BatteryFocus.jsx';
import L4  from './layouts/L4CameraPro.jsx';
import L5  from './layouts/L5FlashDeal.jsx';
import L6  from './layouts/L6LuxuryGold.jsx';
import L7  from './layouts/L7SpecGrid.jsx';
import L8  from './layouts/L8NeonGlow.jsx';
import L9  from './layouts/L9MinimalSplit.jsx';
import L10 from './layouts/L10MegaSplash.jsx';

const LAYOUTS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default function PriceTagCard({
  p, font, onClick, onDelete, onSave, active,
  isDragging, dragOverClass,
  onDragStart, onDragEnd, onDragOver, onDragEnter, onDragLeave, onDrop,
  ...rest
}) {
  const [hov, setHov]       = useState(false);
  const prevLayoutRef        = useRef(null);

  const theme  = getCardTheme(p);
  const specs  = getPrioritySpecs(p, 4);
  const specs6 = getPrioritySpecs(p, 6);
  const brand  = parseBrand(p);
  const model  = parseModel(p);

  const Layout = LAYOUTS[theme.layout] ?? L1;

  /* Trigger fade+scale only when layout number changes */
  const layoutChanged = prevLayoutRef.current !== null && prevLayoutRef.current !== theme.layout;
  prevLayoutRef.current = theme.layout;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`${isDragging ? 'dc' : ''} ${dragOverClass || ''}`}
      style={{
        position:   'relative',
        cursor:     'grab',
        userSelect: 'none',
        fontFamily: `'${font}', sans-serif`,
        outline:    active ? '2.5px solid rgba(99,102,241,0.6)' : 'none',
        outlineOffset: 3,
        borderRadius: 13,
        transition: 'transform 0.18s, box-shadow 0.18s',
        transform:  hov && !isDragging ? 'translateY(-2px) scale(1.02)' : 'scale(1)',
        boxShadow:  hov && !isDragging ? '0 8px 28px rgba(0,0,0,0.18)' : 'none',
      }}
      {...rest}
    >
      {/* Save to shelf ★ */}
      {hov && (
        <button
          onClick={e => { e.stopPropagation(); onSave(); }}
          title="Save to shelf"
          style={{
            position: 'absolute', bottom: 6, left: 6, zIndex: 10,
            width: 22, height: 22, borderRadius: 6, border: 'none',
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 11, cursor: 'pointer', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          ★
        </button>
      )}

      {/* Drag handle */}
      {hov && (
        <div style={{
          position: 'absolute', bottom: 6, right: 30, zIndex: 10,
          background: 'rgba(0,0,0,0.45)', color: '#fff',
          fontSize: 7, fontWeight: 700, borderRadius: 4, padding: '2px 5px',
          pointerEvents: 'none', backdropFilter: 'blur(4px)',
        }}>
          ⠿
        </div>
      )}

      {/* Delete ✕ */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        title="Delete"
        style={{
          position: 'absolute', top: 6, right: 6, zIndex: 10,
          width: 22, height: 22, borderRadius: 6, border: 'none',
          background: 'rgba(0,0,0,0.45)', color: '#fff',
          fontSize: 11, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hov ? 1 : 0.4, transition: 'opacity 0.15s',
          backdropFilter: 'blur(4px)',
        }}>
        ✕
      </button>

      {/* Layout — key change triggers cardSwap animation */}
      <div
        key={theme.layout}
        style={{ animation: layoutChanged ? 'cardSwap 0.35s cubic-bezier(0.2,0,0,1)' : undefined }}
      >
        <Layout
          phone={p}
          brand={brand}
          model={model}
          specs={specs}
          specs6={specs6}
          theme={theme}
          font={font}
        />
      </div>
    </div>
  );
}
