/* ─── M3 Design Tokens ─────────────────────────────────────── */
export const M = {
  primary:              '#0054A3',
  onPrimary:            '#FFFFFF',
  primaryContainer:     '#D5E3FF',
  onPrimaryContainer:   '#001B3D',
  secondary:            '#575E71',
  onSecondary:          '#FFFFFF',
  secondaryContainer:   '#DBE2F9',
  onSecondaryContainer: '#131C2C',
  error:                '#BA1A1A',
  onError:              '#FFFFFF',
  errorContainer:       '#FFDAD6',
  onErrorContainer:     '#410002',
  surface:              '#F9F9FF',
  onSurface:            '#1A1B1F',
  surfaceVar:           '#E0E2EE',
  onSurfaceVar:         '#44464F',
  outline:              '#74767F',
  outlineVar:           '#C4C6D0',
  inverseSurface:       '#2F3036',
  inverseOnSurface:     '#F2F0F7',
  s0: '#FFFFFF',
  s1: '#F2F2FA',
  s2: '#ECECF4',
  s3: '#E6E6EE',
  s4: '#E1E1E8',
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
