/* ─── Design Tokens (Black & White / Monochrome) ────────────── */
export const M = {
  primary:              '#111111',
  onPrimary:            '#FFFFFF',
  primaryContainer:     '#F0F0F0',
  onPrimaryContainer:   '#111111',
  secondary:            '#444444',
  onSecondary:          '#FFFFFF',
  secondaryContainer:   '#EBEBEB',
  onSecondaryContainer: '#111111',
  error:                '#CC0000',
  onError:              '#FFFFFF',
  errorContainer:       '#FFE8E8',
  onErrorContainer:     '#8B0000',
  surface:              '#F7F7F7',
  onSurface:            '#111111',
  surfaceVar:           '#E8E8E8',
  onSurfaceVar:         '#666666',
  outline:              '#BBBBBB',
  outlineVar:           'rgba(0,0,0,0.1)',
  inverseSurface:       '#111111',
  inverseOnSurface:     '#F7F7F7',
  s0: '#FFFFFF',
  s1: '#FAFAFA',
  s2: '#F4F4F4',
  s3: '#ECECEC',
  s4: '#E4E4E4',
  /* extended tokens */
  gradient:        'linear-gradient(135deg, #1a1a1a 0%, #444444 100%)',
  gradientSubtle:  'linear-gradient(135deg, #F7F7F7 0%, #F0F0F0 100%)',
  shadowSm:        '0 1px 4px rgba(0,0,0,0.07)',
  shadowMd:        '0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
  shadowLg:        '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
  shadowGlow:      '0 8px 28px rgba(0,0,0,0.22)',
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
