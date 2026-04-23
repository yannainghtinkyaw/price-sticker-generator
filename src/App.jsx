import { useState, useRef, useEffect } from 'react';
import { M, R, THEMES, FONTS, GRID_OPTIONS, PAPER_SIZES, INITIAL, EMPTY, PER_PAGE } from './lib/constants.js';
import { rrect, drawSticker } from './lib/canvas.js';
import Btn          from './components/Btn.jsx';
import Chip         from './components/Chip.jsx';
import Switch       from './components/Switch.jsx';
import Field        from './components/Field.jsx';
import Snack        from './components/Snack.jsx';
import StyleToggle  from './components/StyleToggle.jsx';
import ShelfCard    from './components/ShelfCard.jsx';
import StickerCard  from './components/StickerCard.jsx';
import ShelfPickDialog   from './dialogs/ShelfPickDialog.jsx';
import CsvDialog         from './dialogs/CsvDialog.jsx';
import TemplatesDialog   from './dialogs/TemplatesDialog.jsx';

/* ── localStorage helpers ───────────────────────────────────── */
function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch {} }

/* ── SVG icons (Feather-style, no extra dep) ────────────────── */
function IcUpload({ s = 16 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function IcImage({ s = 16 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
function IcChevDown({ s = 14 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IcLayers({ s = 16 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function IcFile({ s = 16 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IcGrid({ s = 16 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}

export default function App() {
  const [products,      setProducts]      = useState(INITIAL);
  const [font,          setFont]          = useState('Kanit');
  const [gridCols,      setGridCols]      = useState(3);
  const [paperSize,     setPaperSize]     = useState('a4');
  const [modal,         setModal]         = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [addToShelf,    setAddToShelf]    = useState(false);
  const [page,          setPage]          = useState(0);
  const [busy,          setBusy]          = useState(false);
  const [toast,         setToast]         = useState('');
  const [clearConfirm,  setClearConfirm]  = useState(false);
  const [savedCards,    setSavedCards]    = useState([]);
  const [csvOpen,       setCsvOpen]       = useState(false);
  const [shelfPickOpen, setShelfPickOpen] = useState(false);
  const [dlOpen,        setDlOpen]        = useState(false);
  const [previewImg,    setPreviewImg]    = useState(null);
  const [dragSrcId,     setDragSrcId]     = useState(null);
  const [dragSrcType,   setDragSrcType]   = useState(null);
  const [dragShelfCard, setDragShelfCard] = useState(null);
  const [dragOverSlot,  setDragOverSlot]  = useState(null);
  const [dragOverShelf, setDragOverShelf] = useState(false);
  /* ── new ── */
  const [templates,     setTemplates]     = useState([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [defaultStyle,  setDefaultStyle]  = useState({ theme: 0, filled: false, ellipsis: false });

  const canvasRef           = useRef(null);
  const savedLoadedRef      = useRef(false);
  const touchDragRef        = useRef(null);
  const templatesInitRef    = useRef(false);
  const defaultStyleInitRef = useRef(false);

  const totalPages  = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const pageProds   = products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const emptySlots  = PER_PAGE - pageProds.length;
  const paper       = PAPER_SIZES.find(s => s.id === paperSize) || PAPER_SIZES[1];
  const isDragging  = dragSrcId !== null;
  const activeColor = THEMES[form.theme]?.color || M.primary;
  const canSave     = !!(form.name && form.rom && form.battery && form.price);
  const isCurrentDefault =
    form.theme === defaultStyle.theme &&
    !!form.filled  === !!defaultStyle.filled &&
    !!form.ellipsis === !!defaultStyle.ellipsis;

  /* ── Shelf persistence (window.storage + localStorage fallback) */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage?.get('pts_saved');
        if (r?.value) { setSavedCards(JSON.parse(r.value)); savedLoadedRef.current = true; return; }
      } catch {}
      const v = lsGet('pts_saved');
      if (v) try { setSavedCards(JSON.parse(v)); } catch {}
      savedLoadedRef.current = true;
    })();
  }, []);
  useEffect(() => {
    if (!savedLoadedRef.current) return;
    window.storage?.set('pts_saved', JSON.stringify(savedCards)).catch(() => {});
    lsSet('pts_saved', JSON.stringify(savedCards));
  }, [savedCards]);

  /* ── Templates persistence (localStorage) ───────────────────── */
  useEffect(() => {
    const v = lsGet('pts_templates');
    if (v) try { setTemplates(JSON.parse(v)); } catch {}
    templatesInitRef.current = true;
  }, []);
  useEffect(() => {
    if (!templatesInitRef.current) return;
    lsSet('pts_templates', JSON.stringify(templates));
  }, [templates]);

  /* ── Default card style persistence (localStorage) ──────────── */
  useEffect(() => {
    const v = lsGet('pts_default_style');
    if (v) try { setDefaultStyle(JSON.parse(v)); } catch {}
    defaultStyleInitRef.current = true;
  }, []);
  useEffect(() => {
    if (!defaultStyleInitRef.current) return;
    lsSet('pts_default_style', JSON.stringify(defaultStyle));
  }, [defaultStyle]);

  /* ── CSS + Google Fonts ──────────────────────────────────── */
  useEffect(() => {
    FONTS.forEach(f => {
      const id = `gf-${f.name.replace(/\s/g, '-')}`;
      if (document.getElementById(id)) return;
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet';
      l.href = `https://fonts.googleapis.com/css2?family=${f.css}&display=swap`;
      document.head.appendChild(l);
    });
  }, []);

  /* ── Helpers ─────────────────────────────────────────────── */
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }
  function openAdd() {
    setForm({ ...EMPTY, theme: defaultStyle.theme, filled: defaultStyle.filled, ellipsis: defaultStyle.ellipsis });
    setAddToShelf(false); setModal('add');
  }
  function openEmptySlot() {
    if (savedCards.length > 0) { setShelfPickOpen(true); }
    else {
      setForm({ ...EMPTY, theme: defaultStyle.theme, filled: defaultStyle.filled, ellipsis: defaultStyle.ellipsis });
      setAddToShelf(false); setModal('add');
    }
  }
  function openEdit(p) {
    setForm({ name: p.name, ram: p.ram, rom: p.rom, battery: p.battery, price: p.price, theme: p.theme, filled: !!p.filled, ellipsis: !!p.ellipsis });
    setAddToShelf(false); setModal(p.id);
  }

  function save() {
    if (!form.name || !form.rom || !form.battery || !form.price) return;
    const nc = { ...form, id: Date.now() };
    if (modal === 'add') {
      setProducts(prev => { const n = [...prev, nc]; setPage(Math.ceil(n.length / PER_PAGE) - 1); return n; });
      if (addToShelf) { setSavedCards(prev => [...prev, { ...form, savedId: Date.now() + 1 }]); showToast('✅ Added to grid & shelf!'); }
      else showToast('✅ Added!');
    } else {
      setProducts(prev => prev.map(p => p.id === modal ? { ...form, id: modal } : p));
      if (addToShelf) { setSavedCards(prev => [...prev, { ...form, savedId: Date.now() + 1 }]); showToast('💾 Saved & added to shelf!'); }
      else showToast('💾 Saved!');
    }
    setModal(null);
  }

  function remove(id) {
    setProducts(prev => { const n = prev.filter(p => p.id !== id); const tp = Math.max(1, Math.ceil(n.length / PER_PAGE)); if (page >= tp) setPage(tp - 1); return n; });
    showToast('Deleted');
  }
  function clearAll() {
    if (!clearConfirm) { setClearConfirm(true); setTimeout(() => setClearConfirm(false), 3000); return; }
    setProducts([]); setPage(0); setClearConfirm(false); showToast('Grid cleared');
  }
  function saveCardToShelf(p) {
    setSavedCards(prev => [...prev, { name: p.name, ram: p.ram, rom: p.rom, battery: p.battery, price: p.price, theme: p.theme, filled: p.filled, savedId: Date.now() }]);
    showToast('⭐ Saved to shelf!');
  }
  function removeSavedCard(savedId) { setSavedCards(prev => prev.filter(s => s.savedId !== savedId)); }
  function addSavedToGrid(sc) {
    const clone = { ...sc, id: Date.now() }; delete clone.savedId;
    setProducts(prev => {
      const n = [...prev, clone];
      const cc = prev.slice(page * PER_PAGE, (page + 1) * PER_PAGE).length;
      if (cc >= PER_PAGE) setPage(Math.ceil(n.length / PER_PAGE) - 1);
      return n;
    });
    showToast('📋 Added to grid!');
  }

  function handleCsvImport(rows, mode) {
    const items = rows.map(r => ({ ...r, id: Date.now() + (Math.random() * 10000 | 0) }));
    if (mode === 'replace') { setProducts(items); setPage(0); showToast(`🎉 Imported ${items.length} products`); }
    else { setProducts(prev => { const n = [...prev, ...items]; setPage(Math.ceil(n.length / PER_PAGE) - 1); return n; }); showToast(`📥 Imported ${items.length} products`); }
  }

  /* ── Template helpers ───────────────────────────────────────── */
  function saveTemplate(name) {
    setTemplates(prev => [...prev, {
      id: Date.now(), name,
      products: [...products], font, gridCols, paperSize,
      savedAt: new Date().toISOString(),
    }]);
    showToast(`📑 Template "${name}" saved!`);
  }
  function loadTemplate(t) {
    setProducts(t.products.map(p => ({ ...p, id: Date.now() + (Math.random() * 10000 | 0) })));
    setFont(t.font); setGridCols(t.gridCols); setPaperSize(t.paperSize); setPage(0);
    showToast(`📑 "${t.name}" loaded!`);
  }
  function deleteTemplate(id) {
    setTemplates(prev => prev.filter(t => t.id !== id));
    showToast('Template deleted');
  }

  /* ── Default card style helper ──────────────────────────────── */
  function applyDefaultStyle() {
    setDefaultStyle({ theme: form.theme, filled: form.filled, ellipsis: form.ellipsis });
    showToast('✅ Default card style saved!');
  }

  /* ── Drag helpers ────────────────────────────────────────── */
  function resetDrag() { setDragSrcId(null); setDragSrcType(null); setDragOverSlot(null); setDragShelfCard(null); setDragOverShelf(false); }
  function handleGridDragStart(id, e)  { e.dataTransfer.effectAllowed = 'copy'; setDragSrcId(id); setDragSrcType('grid'); }
  function handleShelfDragStart(s, e)  { e.dataTransfer.effectAllowed = 'copy'; setDragSrcId(s.savedId); setDragSrcType('shelf'); setDragShelfCard(s); }

  function handleDropOnCard(targetId, e) {
    e.preventDefault(); setDragOverSlot(null);
    if (dragSrcType === 'shelf') {
      if (!dragShelfCard) { resetDrag(); return; }
      const clone = { ...dragShelfCard, id: Date.now() }; delete clone.savedId;
      setProducts(prev => { const idx = prev.findIndex(p => p.id === targetId); const n = [...prev]; n.splice(idx, 0, clone); return n; });
      resetDrag(); showToast('📋 Added from shelf!'); return;
    }
    if (!dragSrcId || dragSrcId === targetId) { resetDrag(); return; }
    const src = products.find(p => p.id === dragSrcId);
    if (!src) { resetDrag(); return; }
    setProducts(prev => { const idx = prev.findIndex(p => p.id === targetId); const n = [...prev]; n.splice(idx, 0, { ...src, id: Date.now() }); return n; });
    resetDrag(); showToast('📋 Duplicated!');
  }
  function handleDropOnEmpty(e) {
    e.preventDefault(); setDragOverSlot(null);
    if (dragSrcType === 'shelf') { if (!dragShelfCard) { resetDrag(); return; } addSavedToGrid(dragShelfCard); resetDrag(); return; }
    if (!dragSrcId) { resetDrag(); return; }
    const src = products.find(p => p.id === dragSrcId);
    if (!src) { resetDrag(); return; }
    setProducts(prev => [...prev, { ...src, id: Date.now() }]); resetDrag(); showToast('📋 Duplicated!');
  }
  function handleDropOnShelf(e) {
    e.preventDefault(); setDragOverShelf(false);
    if (dragSrcType !== 'grid') { resetDrag(); return; }
    const src = products.find(p => p.id === dragSrcId);
    if (!src) { resetDrag(); return; }
    saveCardToShelf(src); resetDrag();
  }

  /* ── Touch drag (mobile) ─────────────────────────────────── */
  function handleTouchDragStart(id, type, shelfCard, e) {
    const t = e.touches[0];
    touchDragRef.current = { id, type, shelfCard, startX: t.clientX, startY: t.clientY };
    setDragSrcId(id); setDragSrcType(type); if (shelfCard) setDragShelfCard(shelfCard);
  }
  function handleTouchDragMove(e) {
    if (!touchDragRef.current) return;
    e.preventDefault();
    const t  = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    if (el) { const card = el.closest('[data-cardid]'); setDragOverSlot(card ? `c-${card.dataset.cardid}` : null); }
  }
  function handleTouchDragEnd(e) {
    if (!touchDragRef.current) { resetDrag(); return; }
    const t  = e.changedTouches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const dr = touchDragRef.current;
    touchDragRef.current = null;
    if (el) {
      const card  = el.closest('[data-cardid]');
      const empty = el.closest('[data-emptyslot]');
      if (card) {
        const targetId = Number(card.dataset.cardid);
        if (dr.type === 'shelf' && dr.shelfCard) {
          const clone = { ...dr.shelfCard, id: Date.now() }; delete clone.savedId;
          setProducts(prev => { const idx = prev.findIndex(p => p.id === targetId); const n = [...prev]; n.splice(idx, 0, clone); return n; });
          showToast('📋 Added from shelf!');
        } else if (dr.id !== targetId) {
          const src = products.find(p => p.id === dr.id);
          if (src) { setProducts(prev => { const idx = prev.findIndex(p => p.id === targetId); const n = [...prev]; n.splice(idx, 0, { ...src, id: Date.now() }); return n; }); showToast('📋 Duplicated!'); }
        }
      } else if (empty) {
        if (dr.type === 'shelf' && dr.shelfCard) { addSavedToGrid(dr.shelfCard); }
        else { const src = products.find(p => p.id === dr.id); if (src) { setProducts(prev => [...prev, { ...src, id: Date.now() }]); showToast('📋 Duplicated!'); } }
      }
    }
    resetDrag();
  }

  /* ── Canvas render ───────────────────────────────────────── */
  async function renderToCanvas() {
    try { await Promise.all([`400 22px '${font}'`, `700 28px '${font}'`, `900 44px '${font}'`].map(s => document.fonts.load(s))); } catch {}
    await new Promise(r => setTimeout(r, 300));
    const canvas = canvasRef.current;
    const { w: W, h: H } = paper;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';    ctx.fillRect(30, 30, W - 60, H - 60);
    const cols  = gridCols;
    const rows2 = Math.ceil(PER_PAGE / cols);
    const mx = 70, my = 80, gx = 28, gy = 28;
    const sw = (W - mx * 2 - gx * (cols - 1)) / cols;
    const sh = (H - my * 2 - gy * (rows2 - 1)) / rows2;
    products.slice(page * PER_PAGE, (page + 1) * PER_PAGE).forEach((p, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      drawSticker(ctx, p, mx + col * (sw + gx), my + row * (sh + gy), sw, sh, font);
    });
    // Cut guides
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    for (let c = 1; c < cols; c++) {
      const cx = mx + c * (sw + gx) - gx / 2;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, H - 28); ctx.lineTo(cx, H); ctx.stroke();
    }
    for (let r = 1; r < rows2; r++) {
      const ry = my + r * (sh + gy) - gy / 2;
      ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(28, ry); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - 28, ry); ctx.lineTo(W, ry); ctx.stroke();
    }
    ctx.setLineDash([]);
    return canvas.toDataURL('image/png');
  }

  async function generateImage() {
    setBusy(true);
    const imgData = await renderToCanvas();
    const { label: sL } = paper;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setPreviewImg({ src: imgData, label: sL, page: page + 1 });
      setDlOpen(false);
    } else {
      const a = document.createElement('a');
      a.download = `stickers-${sL.toLowerCase()}-p${page + 1}.png`;
      a.href = imgData; a.click();
      showToast(`🖨️ Downloaded ${sL}!`);
    }
    setBusy(false);
  }

  async function generatePDF() {
    setBusy(true);
    const imgData = await renderToCanvas();
    const { label: sL } = paper;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>Price Tags — ${sL} Page ${page + 1}</title>
        <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f0f0f0;}
        img{width:100%;height:auto;display:block;}
        @media print{@page{margin:0;size:auto;}body{margin:0;}}</style></head>
        <body><img src="${imgData}" onload="window.print();"/></body></html>`);
      win.document.close();
    }
    showToast('📄 PDF dialog opened!'); setBusy(false); setDlOpen(false);
  }

  function generateDoc() {
    const rowsHtml = products.map(p => `
      <tr style="background:${THEMES[p.theme].color}${p.filled ? '' : '22'}">
        <td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;color:${p.filled ? '#fff' : THEMES[p.theme].color}">${p.name}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${p.ram}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${p.rom}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${p.battery}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:right;font-weight:900;color:${THEMES[p.theme].color}">${p.price}.-</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center">
          <span style="background:${THEMES[p.theme].color};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px">${THEMES[p.theme].label}</span>
        </td>
      </tr>`).join('');
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Price Tag Studio — Product List</title>
      <style>body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1a2e;background:#f9f9ff;}
      h1{font-size:26px;margin-bottom:4px;color:#0054A3;}
      .meta{font-size:13px;color:#74767F;margin-bottom:24px;}
      table{width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
      thead th{background:#0054A3;color:#fff;padding:10px 12px;text-align:left;font-size:13px;letter-spacing:.5px;}
      tbody tr:nth-child(even){filter:brightness(.97);}
      tfoot td{background:#f0f0f0;padding:10px 12px;font-size:12px;color:#555;}
      @media print{@page{margin:20mm;} body{padding:0;}}
      </style></head><body>
      <h1>🏷️ Price Tag Studio</h1>
      <div class="meta">Exported ${new Date().toLocaleString()} · ${products.length} products · Font: ${font}</div>
      <table><thead><tr>
        <th>Product Name</th><th>RAM (GB)</th><th>ROM (GB)</th><th>Battery (mAh)</th><th>Price (THB)</th><th>Theme</th>
      </tr></thead><tbody>${rowsHtml}</tbody>
      <tfoot><tr><td colspan="6">Generated by Price Tag Studio · ${products.length} total products</td></tr></tfoot>
      </table></body></html>`;
    const a = document.createElement('a');
    a.href = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    a.download = `price-tags-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    showToast('📋 Document downloaded!'); setDlOpen(false);
  }

  function generateCSV() {
    const header = 'Name,RAM (GB),ROM (GB),Battery (mAh),Price (THB),Theme,Style\n';
    const body   = products.map(p =>
      `"${p.name}","${p.ram}","${p.rom}","${p.battery}","${p.price}","${THEMES[p.theme].label}","${p.filled ? 'Filled' : 'Outline'}"`
    ).join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(header + body)}`;
    a.download = `price-tags-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('📊 CSV downloaded!'); setDlOpen(false);
  }

  /* Drag props factory for StickerCard */
  const cdp = p => ({
    isDragging:    dragSrcId === p.id && dragSrcType === 'grid',
    dragOverClass: dragOverSlot === `c-${p.id}` ? 'doc' : '',
    onDragStart:   e => handleGridDragStart(p.id, e),
    onDragEnd:     resetDrag,
    onDragOver:    e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; },
    onDragEnter:   e => { e.preventDefault(); setDragOverSlot(`c-${p.id}`); },
    onDragLeave:   () => setDragOverSlot(s => s === `c-${p.id}` ? null : s),
    onDrop:        e => handleDropOnCard(p.id, e),
    'data-cardid': p.id,
    onTouchStart:  e => handleTouchDragStart(p.id, 'grid', null, e),
    onTouchMove:   handleTouchDragMove,
    onTouchEnd:    handleTouchDragEnd,
  });

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: M.surface, fontFamily: `'${font}',sans-serif` }}>

      {/* ── Top App Bar (2 rows) ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: M.s1, borderBottom: `1px solid ${M.outlineVar}`,
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      }}>
        {/* Row 1: actions */}
        <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6, height: 56 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🏷️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: M.onSurface, letterSpacing: 0.2, lineHeight: 1.2 }}>Price Tag Studio</div>
            <div style={{ fontSize: 10, color: M.onSurfaceVar, lineHeight: 1 }}>{products.length} stickers · P{page + 1}/{totalPages}</div>
          </div>

          <button onClick={() => setTemplatesOpen(true)} title="Templates"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: R.full, background: templates.length > 0 ? M.primaryContainer : M.s3, color: templates.length > 0 ? M.primary : M.onSurfaceVar, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <IcLayers s={15} />
            <span className="bar-label">{templates.length > 0 ? `Templates (${templates.length})` : 'Templates'}</span>
          </button>

          <button onClick={() => setCsvOpen(true)} title="Import CSV"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: R.full, background: M.secondaryContainer, color: M.onSecondaryContainer, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <IcUpload s={15} />
            <span className="bar-label">Import</span>
          </button>

          <button onClick={generateImage} disabled={busy} title={`Export PNG ${paper.label}`}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: R.full, background: busy ? M.s3 : M.primary, color: busy ? M.onSurfaceVar : M.onPrimary, border: 'none', fontSize: 12, fontWeight: 500, cursor: busy ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <IcImage s={15} />
            <span className="bar-label">{busy ? 'Exporting…' : `PNG ${paper.label}`}</span>
          </button>

          <button onClick={() => setDlOpen(o => !o)} title="Download options"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: R.full, background: dlOpen ? M.primaryContainer : M.s3, color: dlOpen ? M.primary : M.onSurfaceVar, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <IcChevDown s={16} />
          </button>
        </div>

        {/* Row 2: font scroll + cols/paper dropdowns */}
        <div style={{ padding: '0 10px 0 8px', display: 'flex', alignItems: 'center', gap: 6, height: 40, borderTop: `1px solid ${M.outlineVar}` }}>
          <div className="ss" style={{ flex: 1, display: 'flex', gap: 5, overflowX: 'auto', flexWrap: 'nowrap', alignItems: 'center' }}>
            {FONTS.map(f => <Chip key={f.name} label={f.name} selected={font === f.name} onClick={() => setFont(f.name)} />)}
          </div>
          <select value={gridCols} onChange={e => setGridCols(Number(e.target.value))}
            style={{ padding: '5px 8px', borderRadius: R.sm, border: `1px solid ${M.outlineVar}`, background: M.s0, color: M.onSurface, fontSize: 12, fontWeight: 500, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', flexShrink: 0 }}>
            {GRID_OPTIONS.map(n => <option key={n} value={n}>{n} cols</option>)}
          </select>
          <select value={paperSize} onChange={e => setPaperSize(e.target.value)}
            style={{ padding: '5px 8px', borderRadius: R.sm, border: `1px solid ${M.outlineVar}`, background: M.s0, color: M.onSurface, fontSize: 12, fontWeight: 500, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', flexShrink: 0 }}>
            {PAPER_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Download panel + backdrop — rendered at root level (escapes top-bar stacking context) */}
      {dlOpen && <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 250 }} onClick={() => setDlOpen(false)} />
        <div className="dl-panel" style={{
          position: 'fixed', top: 97, right: 8,
          background: M.s0, border: `1px solid ${M.outlineVar}`,
          borderRadius: R.lg, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          minWidth: 210, zIndex: 301, overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 1, textTransform: 'uppercase' }}>
            Download Options
          </div>
          {[
            { ic: <IcImage s={18} />, label: 'PNG Image',       sub: 'High-res print-ready',     fn: generateImage },
            { ic: <IcFile s={18} />,  label: 'PDF Document',    sub: 'Print via browser dialog',  fn: generatePDF   },
            { ic: <IcFile s={18} />,  label: 'HTML Document',   sub: 'Open in Word / browser',    fn: generateDoc   },
            { ic: <IcGrid s={18} />,  label: 'CSV Spreadsheet', sub: 'All product data rows',     fn: generateCSV   },
          ].map(({ ic, label, sub, fn }) => (
            <button key={label} onClick={() => { setDlOpen(false); fn(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', borderTop: `1px solid ${M.s3}`, transition: 'background .12s', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = M.s2}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: M.primary, display: 'flex', flexShrink: 0 }}>{ic}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: M.onSurface }}>{label}</div>
                <div style={{ fontSize: 11, color: M.onSurfaceVar }}>{sub}</div>
              </div>
            </button>
          ))}
          <div style={{ padding: '8px 14px 10px', borderTop: `1px solid ${M.s3}` }}>
            <div style={{ fontSize: 11, color: M.onSurfaceVar }}>Page {page + 1} of {totalPages} · {products.length} products</div>
          </div>
        </div>
      </>}

      <div style={{ padding: '14px 14px 100px', maxWidth: 780, margin: '0 auto' }}>

        {/* ── Info strip ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: M.onSurfaceVar }}>
            {paper.label} · {paper.w}×{paper.h}px · 200 DPI · {paper.desc}
          </div>
          <Btn variant={clearConfirm ? 'error' : 'outlined'} label={clearConfirm ? '⚠️ Confirm?' : 'Clear All'} onClick={clearAll} style={{ fontSize: 11, padding: '5px 12px' }} />
        </div>

        {/* Drag hint */}
        {isDragging && (
          <div style={{
            textAlign: 'center', fontSize: 11, fontWeight: 600, marginBottom: 10,
            padding: '8px', borderRadius: R.sm,
            background: dragSrcType === 'shelf' ? `${M.secondary}14` : `${M.primary}12`,
            color:      dragSrcType === 'shelf' ? M.secondary : M.primary,
            border: `1px solid ${dragSrcType === 'shelf' ? M.secondary : M.primary}33`,
          }}>
            {dragSrcType === 'shelf'
              ? '⭐ Drop onto a card or empty slot to add from shelf'
              : '⠿ Drop onto a card to insert before it · empty slot to append · drag UP to shelf to save ⭐'}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ padding: '6px 18px', borderRadius: R.full, border: `1px solid ${M.outline}`, background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: M.primary, opacity: page === 0 ? .35 : 1, fontFamily: 'inherit', transition: 'opacity .15s' }}>◀</button>
            <span style={{ fontSize: 13, color: M.onSurfaceVar, fontWeight: 500, minWidth: 80, textAlign: 'center' }}>Page {page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              style={{ padding: '6px 18px', borderRadius: R.full, border: `1px solid ${M.outline}`, background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: M.primary, opacity: page >= totalPages - 1 ? .35 : 1, fontFamily: 'inherit', transition: 'opacity .15s' }}>▶</button>
          </div>
        )}

        {/* ── Shelf (above grid) ── */}
        <div
          onDragOver={e  => { if (dragSrcType === 'grid') { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOverShelf(true); } }}
          onDragEnter={e => { if (dragSrcType === 'grid') { e.preventDefault(); setDragOverShelf(true); } }}
          onDragLeave={e => { const rc = e.currentTarget.getBoundingClientRect(); if (e.clientX < rc.left || e.clientX > rc.right || e.clientY < rc.top || e.clientY > rc.bottom) setDragOverShelf(false); }}
          onDrop={handleDropOnShelf}
          style={{
            background: dragOverShelf ? `${M.primary}0E` : (savedCards.length > 0 ? M.s1 : 'transparent'),
            border: dragOverShelf ? `2px dashed ${M.primary}` : (savedCards.length > 0 ? `1px solid ${M.outlineVar}` : `1.5px dashed ${M.outlineVar}`),
            borderRadius: R.lg,
            padding: savedCards.length > 0 || dragOverShelf ? '10px 14px' : '8px 14px',
            marginBottom: 10,
            boxShadow: dragOverShelf ? `0 0 0 4px ${M.primary}18` : 'none',
            transition: 'all 0.18s',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: savedCards.length > 0 || dragOverShelf ? 8 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: dragOverShelf ? M.primary : M.onSurfaceVar }}>
              {dragOverShelf ? '⭐ Drop here to save' : savedCards.length > 0 ? `⭐ Shelf (${savedCards.length}) — tap to add · drag to card` : '⭐ Shelf empty — drag a card here or use ★'}
            </div>
            {savedCards.length > 0 && !dragOverShelf && (
              <button onClick={() => { setSavedCards([]); showToast('Shelf cleared'); }}
                style={{ fontSize: 11, color: M.onSurfaceVar, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: '2px 6px', borderRadius: R.xs }}>Clear</button>
            )}
          </div>
          {(savedCards.length > 0 || dragOverShelf) && (
            <div className="ss" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {savedCards.length === 0 && dragOverShelf && (
                <div style={{ fontSize: 13, color: M.primary, fontWeight: 600, padding: '8px 0' }}>📋 Release to save</div>
              )}
              {savedCards.map(s => (
                <ShelfCard key={s.savedId} s={s} font={font}
                  onAdd={() => addSavedToGrid(s)}
                  onRemove={() => removeSavedCard(s.savedId)}
                  onDragStart={e => handleShelfDragStart(s, e)}
                  onDragEnd={resetDrag}
                  isDragging={dragSrcId === s.savedId && dragSrcType === 'shelf'}
                  isDropTarget={false} />
              ))}
              {dragOverShelf && savedCards.length > 0 && (
                <div style={{ width: 86, flexShrink: 0, border: `2px dashed ${M.primary}`, borderRadius: R.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: M.primary }}>⭐</div>
              )}
            </div>
          )}
        </div>

        {/* ── Sticker Grid ── */}
        <div style={{ background: M.s1, borderRadius: R.lg, padding: '14px 12px', border: `1px solid ${M.outlineVar}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols},1fr)`, gap: 10 }}>
            {pageProds.map(p => (
              <StickerCard key={p.id} p={p} font={font}
                onClick={() => { if (!isDragging) openEdit(p); }}
                onDelete={() => remove(p.id)}
                onSave={() => saveCardToShelf(p)}
                active={modal === p.id}
                {...cdp(p)} />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`e${i}`}
                data-emptyslot="1"
                onClick={() => { if (!isDragging) openEmptySlot(); }}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDragEnter={e => { e.preventDefault(); setDragOverSlot(`e-${i}`); }}
                onDragLeave={() => setDragOverSlot(s => s === `e-${i}` ? null : s)}
                onDrop={handleDropOnEmpty}
                className={dragOverSlot === `e-${i}` ? 'doe' : ''}
                style={{
                  border: `2px dashed ${M.outlineVar}`, borderRadius: R.md, minHeight: 88,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: M.outlineVar, fontSize: 20, cursor: 'pointer', transition: 'all .15s', gap: 3,
                }}
                onMouseEnter={e => { if (!isDragging) { e.currentTarget.style.borderColor = M.primary; e.currentTarget.style.color = M.primary; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = M.outlineVar; e.currentTarget.style.color = M.outlineVar; }}>
                {isDragging ? <span style={{ fontSize: 18 }}>📋</span> : '+'}
                {isDragging && <span style={{ fontSize: 9, fontWeight: 700, color: M.primary }}>drop here</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAB ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 200 }}>
        <button onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 22px',
            background: M.primaryContainer, color: M.onPrimaryContainer,
            border: 'none', borderRadius: R.xl,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,84,163,0.28)',
            fontFamily: `'${font}',sans-serif`,
            transition: 'all .15s cubic-bezier(.2,0,0,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,84,163,0.38)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,84,163,0.28)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>＋</span>
          <span className="fab-label">Add Sticker</span>
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Snack msg={toast} />
      <CsvDialog open={csvOpen} onClose={() => setCsvOpen(false)} onImport={handleCsvImport} />
      <TemplatesDialog
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={templates}
        onSave={saveTemplate}
        onLoad={loadTemplate}
        onDelete={deleteTemplate}
        font={font}
      />
      <ShelfPickDialog
        open={shelfPickOpen}
        onClose={() => setShelfPickOpen(false)}
        savedCards={savedCards}
        font={font}
        onPickShelf={sc => { addSavedToGrid(sc); }}
        onNewCreate={() => {
          setForm({ ...EMPTY, theme: defaultStyle.theme, filled: defaultStyle.filled, ellipsis: defaultStyle.ellipsis });
          setAddToShelf(false); setModal('add');
        }}
        onRemoveShelf={removeSavedCard}
      />

      {/* ── Edit / Add Modal ── */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: M.s1, borderRadius: R.xl, padding: '24px 20px', width: '100%', maxWidth: 400, boxShadow: '0 20px 64px rgba(0,0,0,0.3)', maxHeight: '92vh', overflowY: 'auto' }}>

            <div style={{ fontSize: 20, fontWeight: 400, color: M.onSurface, marginBottom: 18 }}>
              {modal === 'add' ? 'Add Product' : 'Edit Product'}
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Product Name',     key: 'name',    ph: 'e.g. Samsung Galaxy A55 5G' },
                { label: 'RAM (GB)',          key: 'ram',     ph: 'e.g. 8 or 8+8' },
                { label: 'Storage / ROM (GB)', key: 'rom',   ph: 'e.g. 256' },
                { label: 'Battery (mAh)',     key: 'battery', ph: 'e.g. 5000' },
                { label: 'Price (THB)',       key: 'price',   ph: 'e.g. 9990' },
              ].map(f => (
                <Field key={f.key} label={f.label} value={form[f.key]}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  placeholder={f.ph} />
              ))}
            </div>

            {/* Colour picker */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Sticker Color</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {THEMES.map((t, i) => (
                  <div key={i} onClick={() => setForm(v => ({ ...v, theme: i }))} title={t.label} style={{
                    width: 30, height: 30, borderRadius: '50%', background: t.color, cursor: 'pointer',
                    border: form.theme === i ? '3px solid #fff' : '3px solid transparent',
                    boxShadow: form.theme === i ? `0 0 0 2.5px ${t.color},0 2px 8px ${t.color}60` : '0 1px 4px rgba(0,0,0,0.15)',
                    transition: 'all .15s',
                  }} />
                ))}
              </div>
            </div>

            {/* Style toggle */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Style</div>
              <StyleToggle value={form.filled} onChange={v => setForm(f => ({ ...f, filled: v }))} color={activeColor} />
            </div>

            {/* Save Self Card — set as default style */}
            <div style={{
              marginBottom: 14, padding: '9px 12px', borderRadius: R.md,
              background: isCurrentDefault ? `${M.primary}0A` : M.s2,
              border: `1px solid ${isCurrentDefault ? M.primary + '55' : M.outlineVar}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              transition: 'all .2s',
            }}>
              <div style={{ fontSize: 11, color: isCurrentDefault ? M.primary : M.onSurfaceVar, fontWeight: isCurrentDefault ? 600 : 400 }}>
                {isCurrentDefault ? '✓ This is your default card style' : 'Save color & style as default for new cards'}
              </div>
              {!isCurrentDefault && (
                <button onClick={applyDefaultStyle} style={{
                  padding: '5px 12px', borderRadius: R.full, flexShrink: 0,
                  background: M.s3, color: M.onSurfaceVar,
                  border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>Set Default</button>
              )}
            </div>

            {/* One-line name */}
            <div style={{
              marginBottom: 14, padding: '11px 14px', borderRadius: R.md,
              background: form.ellipsis ? `${M.primary}0C` : M.s2,
              border: `1px solid ${form.ellipsis ? M.primary : M.outlineVar}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all .2s',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface, lineHeight: 1.3 }}>
                  One-line name
                  <span style={{
                    marginLeft: 8, fontSize: 10, fontWeight: 700,
                    padding: '2px 6px', borderRadius: R.full,
                    background: form.ellipsis ? M.primary : M.outlineVar,
                    color: form.ellipsis ? M.onPrimary : M.onSurfaceVar,
                    transition: 'all .2s',
                  }}>{form.ellipsis ? 'ON' : 'OFF'}</span>
                </div>
                <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>
                  {form.ellipsis ? 'Long names truncated with …' : 'Names wrap to multiple lines'}
                </div>
              </div>
              <Switch value={form.ellipsis} onChange={v => setForm(f => ({ ...f, ellipsis: v }))} />
            </div>

            {/* Save to shelf */}
            <div style={{
              marginBottom: 16, padding: '12px 14px', borderRadius: R.md,
              background: addToShelf ? `${M.secondary}0D` : M.s2,
              border: `1px solid ${addToShelf ? M.secondary : M.outlineVar}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all .2s',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>Save to shelf ⭐</div>
                {addToShelf && <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>Card saved for quick reuse</div>}
              </div>
              <Switch value={addToShelf} onChange={setAddToShelf} />
            </div>

            {/* Live preview */}
            {form.name && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                <div style={{ maxWidth: 148 }}>
                  <StickerCard p={{ ...form, id: 0 }} font={font}
                    onClick={() => {}} onDelete={() => {}} onSave={() => {}}
                    active={false} isDragging={false} dragOverClass=""
                    onDragStart={() => {}} onDragEnd={() => {}} onDragOver={() => {}}
                    onDragEnter={() => {}} onDragLeave={() => {}} onDrop={() => {}} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="outlined" label="Cancel" onClick={() => setModal(null)} style={{ flex: 1 }} />
              <Btn variant="filled" disabled={!canSave}
                label={modal === 'add'
                  ? (addToShelf ? 'Add to grid & shelf ⭐' : 'Add Sticker')
                  : (addToShelf ? 'Save & add to shelf ⭐' : 'Save Changes')}
                onClick={save} style={{ flex: 2 }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Image Preview Modal ── */}
      {previewImg && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.6)', flexShrink: 0 }}>
            <div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>🖼️ {previewImg.label} · Page {previewImg.page}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>📱 Long-press the image → "Save to Photos"</div>
            </div>
            <button onClick={() => setPreviewImg(null)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12px 0' }}>
            <img src={previewImg.src} alt="Price tags" style={{ width: '100%', maxWidth: 640, height: 'auto', display: 'block', userSelect: 'none' }} />
          </div>

          <div style={{ width: '100%', padding: '14px 18px 28px', background: 'rgba(0,0,0,0.6)', flexShrink: 0, display: 'flex', gap: 10 }}>
            <a href={previewImg.src}
              download={`stickers-${previewImg.label.toLowerCase()}-p${previewImg.page}.png`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: R.xl, background: M.primary, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ⬇️ Download (desktop)
            </a>
            <button onClick={() => setPreviewImg(null)}
              style={{ flex: 1, padding: '13px 0', borderRadius: R.xl, border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
