import { useRef, useState } from 'react';
import { getCardTheme, getPrioritySpecs, parseBrand, parseModel } from '../lib/phoneTheme.js';

import L1 from './layouts/L1DarkHero.jsx';
import L2 from './layouts/L2BrightCard.jsx';
import L3 from './layouts/L3BatteryFocus.jsx';
import L4 from './layouts/L4CameraPro.jsx';
import L5 from './layouts/L5FlashDeal.jsx';
import L6 from './layouts/L6LuxuryGold.jsx';
import L7 from './layouts/L7SpecGrid.jsx';
import L8 from './layouts/L8NeonGlow.jsx';
import L9 from './layouts/L9MinimalSplit.jsx';
import L10 from './layouts/L10MegaSplash.jsx';
import L11 from './layouts/L11RetailSpecBoard.jsx';

const LAYOUTS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10, 11: L11 };

function OverlayButton({ title, onClick, style, children }) {
  return (
    <button
      onClick={event => {
        event.stopPropagation();
        onClick?.(event);
      }}
      title={title}
      style={{
        width: 22,
        height: 22,
        border: 'none',
        borderRadius: 6,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function PriceTagCard({
  p, font, onClick, onDoubleClick, onDelete, onSave, active,
  isDragging, dragOverClass,
  onDragStart, onDragEnd, onDragOver, onDragEnter, onDragLeave, onDrop,
  forcedLayout,
  ...rest
}) {
  const [hov, setHov] = useState(false);
  const prevLayoutRef = useRef(null);
  const clickTimerRef = useRef(null);

  const theme = getCardTheme(p);
  const specs = getPrioritySpecs(p, 4);
  const specs6 = getPrioritySpecs(p, 6);
  const brand = parseBrand(p);
  const model = parseModel(p);

  const Layout = LAYOUTS[forcedLayout ?? theme.layout] ?? L1;
  const layoutChanged = prevLayoutRef.current !== null && prevLayoutRef.current !== theme.layout;
  prevLayoutRef.current = theme.layout;

  function handleCardClick() {
    if (!onClick) return;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      onClick();
    }, 220);
  }

  function handleCardDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onDoubleClick?.();
  }

  return (
    <div
      draggable
      onDragStart={event => {
        onDragStart?.(event);
      }}
      onDragEnd={event => {
        onDragEnd?.(event);
      }}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`${isDragging ? 'dc' : ''} ${dragOverClass || ''}`}
      style={{
        position: 'relative',
        cursor: hov ? 'grab' : 'default',
        userSelect: 'none',
        height: '100%',
        fontFamily: `'${font}', sans-serif`,
        outline: active ? '2.5px solid rgba(99,102,241,0.6)' : 'none',
        outlineOffset: 3,
        borderRadius: 13,
        transition: 'transform 0.18s, box-shadow 0.18s',
        transform: hov && !isDragging ? 'translateY(-2px) scale(1.02)' : 'scale(1)',
        boxShadow: hov && !isDragging ? '0 8px 28px rgba(0,0,0,0.18)' : 'none',
      }}
      {...rest}
    >
      {hov && !isDragging && (
        <>
          <OverlayButton
            onClick={() => onSave?.()}
            title="Save to shelf"
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              zIndex: 10,
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </OverlayButton>

          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              zIndex: 10,
              display: 'flex',
              gap: 6,
            }}
          >
            <OverlayButton
              onClick={() => onClick?.()}
              title="Edit"
              style={{
                background: 'rgba(0,0,0,0.45)',
                color: '#fff',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </OverlayButton>

            <OverlayButton
              onClick={() => onDelete?.()}
              title="Delete"
              style={{
                background: 'rgba(0,0,0,0.45)',
                color: '#fff',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </OverlayButton>
          </div>

          <button
            onDragStart={event => {
              event.stopPropagation();
              onDragStart?.(event);
            }}
            onDragEnd={event => {
              event.stopPropagation();
              onDragEnd?.(event);
            }}
            onClick={event => event.stopPropagation()}
            title="Drag"
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              zIndex: 10,
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(0,0,0,0.45)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              border: 'none',
              padding: 0,
              backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="9" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="15" cy="19" r="1.5" />
            </svg>
          </button>
        </>
      )}

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
