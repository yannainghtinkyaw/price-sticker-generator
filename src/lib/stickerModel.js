import { EMPTY } from './constants.js';

export const BASE_GRID_COLS = 6;
export const STICKER_GRID_OPTIONS = [1, 2, 3, 4, 5, 6];

export const STYLE_CATALOG = [
  { key: 'classic', icon: 'Tag', name: 'Classic', desc: 'Simple price tag card', layout: null, defaultGridCols: 2, defaultGridRows: 2, fixedSize: true },
  { key: 'L1', icon: 'Dark', name: 'Dark Hero', desc: 'Flagship dark card', layout: 1, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L2', icon: 'Bright', name: 'Bright Card', desc: 'Clean premium layout', layout: 2, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L3', icon: 'Battery', name: 'Battery Focus', desc: 'Battery-first callout', layout: 3, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L4', icon: 'Camera', name: 'Camera Pro', desc: 'Camera highlight layout', layout: 4, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L5', icon: 'Flash', name: 'Flash Deal', desc: 'Promo deal card', layout: 5, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L6', icon: 'Gold', name: 'Luxury Gold', desc: 'Premium elegant card', layout: 6, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L7', icon: 'Grid', name: 'Spec Grid', desc: 'Wide comparison card', layout: 7, defaultGridCols: 3, defaultGridRows: 1 },
  { key: 'L8', icon: 'Neon', name: 'Neon Glow', desc: 'Gaming neon style', layout: 8, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L9', icon: 'Split', name: 'Minimal Split', desc: 'Modern split layout', layout: 9, defaultGridCols: 2, defaultGridRows: 1 },
  { key: 'L10', icon: 'Splash', name: 'Mega Splash', desc: 'Wide promo banner', layout: 10, defaultGridCols: 3, defaultGridRows: 1 },
];

export const SAMPLE_STICKER_DATA = {
  name: 'Samsung Galaxy S25 Ultra',
  brand: 'Samsung',
  ram: '12',
  rom: '256',
  battery: '5000',
  camera: '200',
  chip: 'Snapdragon 8 Gen 3',
  display: '6.8',
  has5g: true,
  price: '49900',
  oldPrice: '55000',
  featuredSpec: '',
  theme: 0,
  filled: false,
  ellipsis: false,
  classic: false,
  romColor: '',
  batteryColor: '',
};

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getStyleMeta(styleKey) {
  return STYLE_CATALOG.find(style => style.key === styleKey) || STYLE_CATALOG[0];
}

export function normalizeStickerData(data = {}, styleKey = 'classic') {
  return {
    ...EMPTY,
    ...data,
    classic: styleKey === 'classic',
  };
}

export function clampGridCols(value) {
  const num = Number(value) || 1;
  return Math.max(1, Math.min(BASE_GRID_COLS, num));
}

export function clampGridRows(value) {
  const num = Number(value) || 1;
  return Math.max(1, Math.min(12, num));
}

export function createSticker({
  id,
  styleKey = 'classic',
  data = {},
  gridCols,
  gridRows,
} = {}) {
  const style = getStyleMeta(styleKey);
  return {
    id: id || createId('stk'),
    styleKey: style.key,
    gridCols: style.fixedSize
      ? clampGridCols(style.defaultGridCols ?? 1)
      : clampGridCols(gridCols ?? style.defaultGridCols ?? 1),
    gridRows: style.fixedSize
      ? clampGridRows(style.defaultGridRows ?? 1)
      : clampGridRows(gridRows ?? style.defaultGridRows ?? 1),
    data: normalizeStickerData(data, style.key),
  };
}

export function cloneSticker(sticker, overrides = {}) {
  return createSticker({
    styleKey: overrides.styleKey ?? sticker.styleKey,
    gridCols: overrides.gridCols ?? sticker.gridCols,
    gridRows: overrides.gridRows ?? sticker.gridRows,
    data: { ...sticker.data, ...(overrides.data || {}) },
  });
}

export function createShelfItem(sticker) {
  return {
    id: createId('shelf'),
    sticker: cloneSticker(sticker),
    savedAt: new Date().toISOString(),
  };
}

export function createInitialStickers() {
  return [];
}

export function getPageRowsForPaper(paper) {
  const ratio = Number(paper?.h) > 0 && Number(paper?.w) > 0 ? paper.h / paper.w : 1.414;
  return Math.max(2, Math.ceil(BASE_GRID_COLS * ratio));
}

export function getPageCapacityForPaper(paper) {
  return BASE_GRID_COLS * getPageRowsForPaper(paper);
}

export function packStickerPages(stickers, paper) {
  const pageRows = getPageRowsForPaper(paper);
  const pages = [];
  let placements = [];
  let occupied = new Set();

  const pushPage = () => {
    pages.push({
      placements,
      usedCells: placements.reduce((sum, item) => sum + item.span * item.rowSpan, 0),
    });
    placements = [];
    occupied = new Set();
  };

  const canPlace = (row, col, span, rowSpan) => {
    if (col + span > BASE_GRID_COLS) return false;
    if (row + rowSpan > pageRows) return false;
    for (let dr = 0; dr < rowSpan; dr += 1) {
      for (let dc = 0; dc < span; dc += 1) {
        if (occupied.has(`${row + dr},${col + dc}`)) return false;
      }
    }
    return true;
  };

  const placeSticker = (sticker, row, col, span, rowSpan) => {
    placements.push({
      sticker,
      row,
      col,
      span,
      rowSpan,
    });
    for (let dr = 0; dr < rowSpan; dr += 1) {
      for (let dc = 0; dc < span; dc += 1) {
        occupied.add(`${row + dr},${col + dc}`);
      }
    }
  };

  for (const sticker of stickers) {
    const span = clampGridCols(sticker.gridCols);
    const rowSpan = Math.min(pageRows, clampGridRows(sticker.gridRows));
    let placed = false;

    for (let row = 0; row < pageRows && !placed; row += 1) {
      for (let col = 0; col < BASE_GRID_COLS; col += 1) {
        if (!canPlace(row, col, span, rowSpan)) continue;
        placeSticker(sticker, row, col, span, rowSpan);
        placed = true;
        break;
      }
    }

    if (!placed) {
      pushPage();
      placeSticker(sticker, 0, 0, span, rowSpan);
    }
  }

  pushPage();
  return pages.length ? pages : [{ placements: [], usedCells: 0 }];
}

export function createWorkspaceSnapshot({
  name = '',
  font,
  paperSize,
  defaultGridCols,
  selectedStyleKey,
  stickers,
} = {}) {
  return {
    version: 3,
    kind: 'workspace',
    name: name || `Workspace ${new Date().toLocaleString()}`,
    exportedAt: new Date().toISOString(),
    font,
    paperSize,
    defaultGridCols,
    selectedStyleKey,
    stickers: stickers.map(sticker => ({
      styleKey: sticker.styleKey,
      gridCols: sticker.gridCols,
      gridRows: sticker.gridRows,
      data: { ...sticker.data },
    })),
  };
}

export function hydrateWorkspaceSnapshot(snapshot = {}) {
  const sourceStickers = Array.isArray(snapshot.stickers)
    ? snapshot.stickers
    : Array.isArray(snapshot.products)
      ? snapshot.products.map(product => ({
        styleKey: snapshot.selectedStyleKey || snapshot.cardStyle || 'classic',
        gridCols: snapshot.defaultGridCols || snapshot.gridCols || 1,
        gridRows: snapshot.defaultGridRows || snapshot.gridRows || 1,
        data: product,
      }))
      : [];

  const stickers = sourceStickers.map(sticker => createSticker(sticker));

  return {
    name: snapshot.name || '',
    font: snapshot.font || 'Kanit',
    paperSize: snapshot.paperSize || 'a4',
    defaultGridCols: clampGridCols(snapshot.defaultGridCols || snapshot.gridCols || 1),
    selectedStyleKey: getStyleMeta(snapshot.selectedStyleKey || snapshot.cardStyle || 'classic').key,
    stickers,
  };
}

export function hydrateShelfItems(payload) {
  if (!Array.isArray(payload)) return [];
  return payload
    .map(item => {
      const sticker = item?.sticker
        ? createSticker(item.sticker)
        : item?.styleKey || item?.data
          ? createSticker(item)
          : item?.name || item?.price
            ? createSticker({
              styleKey: item.classic ? 'classic' : (item.styleKey || 'classic'),
              gridCols: item.gridCols || item.defaultGridCols || 1,
              gridRows: item.gridRows || item.defaultGridRows || 1,
              data: item,
            })
          : null;

      if (!sticker) return null;
      return {
        id: item.id || createId('shelf'),
        sticker,
        savedAt: item.savedAt || new Date().toISOString(),
      };
    })
    .filter(Boolean);
}
