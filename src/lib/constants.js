/* ─── Design Tokens (Dribbble-style Indigo/Violet palette) ─── */
export const M = {
  primary:              '#6366F1',   // Indigo-500
  onPrimary:            '#FFFFFF',
  primaryContainer:     '#EDE9FE',   // Violet-100
  onPrimaryContainer:   '#3730A3',   // Indigo-800
  secondary:            '#8B5CF6',   // Violet-500
  onSecondary:          '#FFFFFF',
  secondaryContainer:   '#F5F3FF',   // Violet-50
  onSecondaryContainer: '#5B21B6',   // Violet-800
  error:                '#EF4444',   // Red-500
  onError:              '#FFFFFF',
  errorContainer:       '#FEE2E2',   // Red-100
  onErrorContainer:     '#991B1B',   // Red-800
  surface:              '#F1F2FC',   // Lavender-tinted bg
  onSurface:            '#1E1B4B',   // Deep navy
  surfaceVar:           '#E5E7FB',
  onSurfaceVar:         '#6B7280',   // Gray-500
  outline:              '#A5B4FC',   // Indigo-300
  outlineVar:           'rgba(99,102,241,0.14)',
  inverseSurface:       '#1E1B4B',
  inverseOnSurface:     '#F1F2FC',
  s0: '#FFFFFF',
  s1: '#F8F9FF',
  s2: '#F1F2FC',
  s3: '#EAEBF8',
  s4: '#E2E4F8',
  /* extended tokens */
  gradient:        'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  gradientSubtle:  'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
  shadowSm:        '0 1px 4px rgba(0,0,0,0.06)',
  shadowMd:        '0 4px 20px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)',
  shadowLg:        '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
  shadowGlow:      '0 8px 32px rgba(99,102,241,0.35)',
};

export const R = { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 };

/* ─── Theme colours ─────────────────────────────────────────── */
export const THEMES = [
  { color: '#C9A84C', label: 'Gold'   },
  { color: '#29ABE2', label: 'Blue'   },
  { color: '#C0392B', label: 'Red'    },
  { color: '#1a1a1a', label: 'Onyx'   },
  { color: '#0E7A6E', label: 'Teal'   },
  { color: '#8E44AD', label: 'Purple' },
  { color: '#E67E22', label: 'Amber'  },
];

/* ─── Google Fonts ──────────────────────────────────────────── */
export const FONTS = [
  { name: 'Kanit',          css: 'Kanit:wght@400;700;900'          },
  { name: 'Prompt',         css: 'Prompt:wght@400;700;900'         },
  { name: 'Mitr',           css: 'Mitr:wght@400;500;700'           },
  { name: 'Sarabun',        css: 'Sarabun:wght@400;700;800'        },
  { name: 'Noto Sans Thai', css: 'Noto+Sans+Thai:wght@400;700;900' },
  { name: 'Inter',          css: 'Inter:wght@400;700;900'          },
  { name: 'Poppins',        css: 'Poppins:wght@400;700;900'        },
  { name: 'Roboto',         css: 'Roboto:wght@400;700;900'         },
  { name: 'Nunito',         css: 'Nunito:wght@400;700;900'         },
  { name: 'Outfit',         css: 'Outfit:wght@400;700;900'         },
  { name: 'Sora',           css: 'Sora:wght@400;700;800'           },
];

export const GRID_OPTIONS = [3, 4, 5];

/* ─── Paper sizes (200 DPI pixel dimensions) ────────────────── */
export const PAPER_SIZES = [
  { id: 'a3',     label: 'A3',     desc: '297×420mm',  w: 2339, h: 3307 },
  { id: 'a4',     label: 'A4',     desc: '210×297mm',  w: 1654, h: 2339 },
  { id: 'a5',     label: 'A5',     desc: '148×210mm',  w: 1169, h: 1654 },
  { id: 'letter', label: 'Letter', desc: '216×279mm',  w: 1700, h: 2200 },
  { id: 'b4',     label: 'B4',     desc: '250×353mm',  w: 1968, h: 2776 },
  { id: 'b5',     label: 'B5',     desc: '176×250mm',  w: 1386, h: 1968 },
];

/* ─── Default data ──────────────────────────────────────────── */
export const INITIAL = [
  { id: 1, name: 'Infinix Note Edge 5G', ram: '8+8', rom: '128', battery: '6500', price: '7490', theme: 0, filled: false },
];

export const EMPTY = { name: '', ram: '', rom: '', battery: '', price: '', theme: 0, filled: false, ellipsis: false };

export const PER_PAGE = 15;
