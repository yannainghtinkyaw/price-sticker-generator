import { useState, useRef, useEffect } from 'react';
import { M, R, THEMES, FONTS, GRID_OPTIONS, PAPER_SIZES, INITIAL, EMPTY, PER_PAGE, CARD_STYLES } from './lib/constants.js';
import { rrect, drawSticker } from './lib/canvas.js';
import Btn          from './components/Btn.jsx';
import Switch       from './components/Switch.jsx';
import Field        from './components/Field.jsx';
import Snack        from './components/Snack.jsx';
import StyleToggle  from './components/StyleToggle.jsx';
import ShelfCard    from './components/ShelfCard.jsx';
import StickerCard  from './components/StickerCard.jsx';
import PriceTagCard from './components/PriceTagCard.jsx';
import ShelfPickDialog        from './dialogs/ShelfPickDialog.jsx';
import CsvDialog              from './dialogs/CsvDialog.jsx';
import TemplatesDialog        from './dialogs/TemplatesDialog.jsx';
import CardStylePickerDialog  from './dialogs/CardStylePickerDialog.jsx';

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
  const [cardStyle,     setCardStyle]     = useState(0);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [pendingStyle,  setPendingStyle]  = useState(null);

  const canvasRef           = useRef(null);
  const premiumGridRef      = useRef(null);
  const savedLoadedRef      = useRef(false);
  const touchDragRef        = useRef(null);
  const templatesInitRef    = useRef(false);
  const defaultStyleInitRef = useRef(false);
  const cardStyleInitRef    = useRef(false);

  /* ── cardStyle persistence ──────────────────────────────────── */
  useEffect(() => {
    const v = lsGet('pts_card_style');
    if (v !== null) {
      if (v === 'classic') { setCardStyle(0); }
      else if (v === 'premium') { setCardStyle(1); }
      else {
        const n = Number(v);
        if (!isNaN(n) && n >= 0 && n <= 10) setCardStyle(n);
      }
    }
    cardStyleInitRef.current = true;
  }, []);
  useEffect(() => {
    if (!cardStyleInitRef.current) return;
    lsSet('pts_card_style', cardStyle);
  }, [cardStyle]);

  const totalPages  = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const pageProds   = products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const emptySlots  = PER_PAGE - pageProds.length;
  const paper       = PAPER_SIZES.find(s => s.id === paperSize) || PAPER_SIZES[1];
  const isDragging  = dragSrcId !== null;
  const activeColor = THEMES[form.theme]?.color || M.primary;
  const canSave = cardStyle === 0
    ? !!(form.name && form.rom && form.battery && form.price)
    : !!(form.name && form.price);
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
    setForm({
      name: p.name, brand: p.brand || '', ram: p.ram, rom: p.rom,
      battery: p.battery, camera: p.camera || '', chip: p.chip || '',
      display: p.display || '', has5g: !!p.has5g,
      price: p.price, oldPrice: p.oldPrice || '', featuredSpec: p.featuredSpec || '',
      theme: p.theme, filled: !!p.filled, ellipsis: !!p.ellipsis,
    });
    setAddToShelf(false); setModal(p.id);
  }

  function save() {
    if (!canSave) return;
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
    setSavedCards(prev => [...prev, {
      name: p.name, brand: p.brand, ram: p.ram, rom: p.rom,
      battery: p.battery, camera: p.camera, chip: p.chip,
      display: p.display, has5g: p.has5g,
      price: p.price, oldPrice: p.oldPrice, featuredSpec: p.featuredSpec,
      theme: p.theme, filled: p.filled, savedId: Date.now(),
    }]);
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

  /* ── Card style switch ──────────────────────────────────────── */
  function handleStyleChange(newStyle) {
    if (newStyle === cardStyle) { setStylePickerOpen(false); return; }
    setStylePickerOpen(false);
    if (products.length > 0) { setPendingStyle(newStyle); return; }
    applyStyleChange(newStyle);
  }
  function applyStyleChange(style) {
    setCardStyle(style);
    setProducts([]); setPage(0); setPendingStyle(null);
    showToast(`Switched to ${CARD_STYLES[style]?.name ?? style}`);
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
    if (dragSrcType === 'shelf') {
      if (!dragShelfCard) { resetDrag(); return; }
      const clone = { ...dragShelfCard, id: Date.now() }; delete clone.savedId;
      setProducts(prev => [clone, ...prev]);
      setPage(0);
      resetDrag(); showToast('📋 Added to top!'); return;
    }
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
        if (dr.type === 'shelf' && dr.shelfCard) {
          const clone = { ...dr.shelfCard, id: Date.now() }; delete clone.savedId;
          setProducts(prev => [clone, ...prev]);
          setPage(0); showToast('📋 Added to top!');
        } else { const src = products.find(p => p.id === dr.id); if (src) { setProducts(prev => [...prev, { ...src, id: Date.now() }]); showToast('📋 Duplicated!'); } }
      }
    }
    resetDrag();
  }

  /* ── Canvas render ───────────────────────────────────────── */
  async function renderToCanvas() {
    const { w: W, h: H } = paper;

    /* Premium: capture DOM grid with html2canvas */
    if (cardStyle > 0) {
      const el = premiumGridRef.current;
      if (!el) { showToast('⚠️ Grid not ready'); return null; }
      await new Promise(r => setTimeout(r, 400)); // let fonts settle
      const { default: html2canvas } = await import('html2canvas');
      const cap = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const mx = 70, my = 80, maxW = W - mx * 2, maxH = H - my * 2;
      const nw = cap.width / 3, nh = cap.height / 3;
      const fit = Math.min(maxW / nw, maxH / nh);
      const dw = Math.round(nw * fit), dh = Math.round(nh * fit);
      const dx = mx + Math.round((maxW - dw) / 2);
      const canvas = canvasRef.current;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';    ctx.fillRect(30, 30, W - 60, H - 60);
      ctx.drawImage(cap, dx, my, dw, dh);
      return canvas.toDataURL('image/png');
    }

    /* Classic: manual canvas draw */
    try { await Promise.all([`400 22px '${font}'`, `700 28px '${font}'`, `900 44px '${font}'`].map(s => document.fonts.load(s))); } catch {}
    await new Promise(r => setTimeout(r, 300));
    const canvas = canvasRef.current;
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
    if (!imgData) { setBusy(false); return; }
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F7F7F7 0%, #F2F2F2 50%, #F5F5F5 100%)', fontFamily: `'${font}',sans-serif` }}>

      {/* ── Top App Bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', gap: 8,
        height: 64, boxShadow: '0 1px 24px rgba(99,102,241,0.08)',
      }}>
        {/* Logo */}
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          background: M.gradient, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: M.shadowGlow,
        }}>
          <span style={{ fontSize: 20 }}>🏷️</span>
        </div>
        <div style={{ marginRight: 4 }}>
          <div className="grad-text" style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.4 }}>Price Tag Studio</div>
          <div style={{ fontSize: 10, color: M.onSurfaceVar, lineHeight: 1, fontWeight: 500 }}>
            {products.length} stickers · P{page + 1}/{totalPages}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Templates */}
        <button onClick={() => setTemplatesOpen(true)} title="Workspace Templates"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: R.full,
            background: templates.length > 0 ? M.primaryContainer : 'rgba(0,0,0,0.04)',
            color: templates.length > 0 ? M.primary : M.onSurfaceVar,
            border: templates.length > 0 ? `1px solid ${M.outlineVar}` : '1px solid transparent',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s',
          }}>
          <IcLayers s={14} />
          <span className="bar-label">
            {templates.length > 0 ? `Templates (${templates.length})` : 'Templates'}
          </span>
        </button>

        {/* Import CSV */}
        <button onClick={() => setCsvOpen(true)} title="Import CSV"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: R.full,
            background: 'rgba(0,0,0,0.04)', color: M.onSurfaceVar,
            border: '1px solid transparent',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s',
          }}>
          <IcUpload s={14} />
          <span className="bar-label">Import</span>
        </button>

        {/* Export PNG — gradient pill */}
        <button onClick={generateImage} disabled={busy} title={`Export PNG ${paper.label}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: R.full,
            background: busy ? M.s3 : M.gradient,
            color: busy ? M.onSurfaceVar : '#fff',
            border: 'none', fontSize: 13, fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: busy ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { if (!busy) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = busy ? 'none' : '0 4px 14px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'none'; }}>
          <IcImage s={14} />
          <span className="bar-label">{busy ? 'Exporting…' : `PNG ${paper.label}`}</span>
        </button>

        {/* Downloads dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setDlOpen(o => !o)} title="Download options"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: R.full,
              background: dlOpen ? M.primaryContainer : 'rgba(0,0,0,0.04)',
              color: dlOpen ? M.primary : M.onSurfaceVar,
              border: dlOpen ? `1px solid ${M.outlineVar}` : '1px solid transparent',
              cursor: 'pointer', transition: 'all .15s',
            }}>
            <IcChevDown s={16} />
          </button>

          {dlOpen && (
            <div className="dl-panel" style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: `1px solid ${M.outlineVar}`,
              borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
              minWidth: 220, zIndex: 300, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px 8px', fontSize: 10, fontWeight: 800, color: M.onSurfaceVar, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Download Options
              </div>
              {[
                { ic: <IcImage s={18} />,  label: 'PNG Image',       sub: 'High-res print-ready',    fn: () => { generateImage(); setDlOpen(false); } },
                { ic: <IcFile s={18} />,   label: 'PDF Document',    sub: 'Print via browser dialog', fn: generatePDF },
                { ic: <IcFile s={18} />,   label: 'HTML Document',   sub: 'Open in Word / browser',   fn: generateDoc },
                { ic: <IcGrid s={18} />,   label: 'CSV Spreadsheet', sub: 'All product data rows',    fn: generateCSV },
              ].map(({ ic, label, sub, fn }) => (
                <button key={label} onClick={fn}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '10px 16px', border: 'none', background: 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                    borderTop: `1px solid rgba(0,0,0,0.04)`, transition: 'background .12s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = M.s2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{
                    color: M.primary, display: 'flex', flexShrink: 0,
                    background: M.primaryContainer, borderRadius: 8, padding: 6,
                  }}>{ic}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: M.onSurface }}>{label}</div>
                    <div style={{ fontSize: 11, color: M.onSurfaceVar }}>{sub}</div>
                  </div>
                </button>
              ))}
              <div style={{ padding: '8px 16px 12px', borderTop: `1px solid rgba(0,0,0,0.04)` }}>
                <div style={{ fontSize: 11, color: M.onSurfaceVar }}>Page {page + 1} of {totalPages} · {products.length} products</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close download panel on outside click */}
      {dlOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setDlOpen(false)} />}

      <div style={{ padding: '20px 16px 100px', maxWidth: 840, margin: '0 auto' }}>

        {/* ── Controls Panel ── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', marginBottom: 16, border: `1px solid ${M.outlineVar}`, boxShadow: M.shadowMd }}>

          {/* Row 0: Card Style */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Card Style</div>
            <button
              onClick={() => setStylePickerOpen(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid rgba(0,0,0,0.12)', background: '#fff',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{CARD_STYLES[cardStyle]?.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: M.onSurface }}>{CARD_STYLES[cardStyle]?.name}</div>
                  <div style={{ fontSize: 10, color: M.onSurfaceVar }}>{CARD_STYLES[cardStyle]?.desc}</div>
                </div>
              </div>
              <IcChevDown s={16} />
            </button>
          </div>

          {/* Row 1: Font (full width) */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Font</div>
            <select className="ctrl-select" value={font} onChange={e => setFont(e.target.value)}
              style={{ fontFamily: `'${font}', sans-serif`, width: '100%' }}>
              {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
          </div>

          {/* Row 2: Columns | Paper */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 14 }}>

            {/* Columns dropdown */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Columns</div>
              <select className="ctrl-select" value={gridCols} onChange={e => setGridCols(Number(e.target.value))}>
                {GRID_OPTIONS.map(n => <option key={n} value={n}>{n} col</option>)}
              </select>
            </div>

            {/* Paper dropdown */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                Paper <span style={{ color: M.error, fontSize: 9, fontWeight: 400, textTransform: 'none', marginLeft: 3 }}>PNG</span>
              </div>
              <select className="ctrl-select" value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                {PAPER_SIZES.map(s => <option key={s.id} value={s.id}>{s.label} — {s.desc}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Paper info badge + Clear */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              padding: '7px 12px', borderRadius: 10,
              background: M.s2, border: `1px solid ${M.outlineVar}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: Math.round(22 * (paper.w / paper.h)), height: 22, border: `1.5px solid ${M.primary}`, borderRadius: 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
                  {[0, 1, 2].slice(0, gridCols === 3 ? 3 : 2).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 1.5 }}>
                      {Array.from({ length: gridCols }).map((_, j) => (
                        <div key={j} style={{ width: 2.5, height: 2.5, background: M.primary, borderRadius: 0.5, opacity: .6 }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: M.onSurface, fontWeight: 700 }}>{paper.label} · {paper.w}×{paper.h}px</div>
                <div style={{ fontSize: 10, color: M.onSurfaceVar }}>200 DPI · {paper.desc}</div>
              </div>
            </div>
            <Btn variant={clearConfirm ? 'error' : 'outlined'} label={clearConfirm ? '⚠️ Confirm?' : '🗑️ Clear All'} onClick={clearAll} style={{ fontSize: 12, padding: '8px 16px' }} />
          </div>
        </div>

        {/* ── Shelf ── */}
        <div
          onDragOver={e  => { if (dragSrcType === 'grid') { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOverShelf(true); } }}
          onDragEnter={e => { if (dragSrcType === 'grid') { e.preventDefault(); setDragOverShelf(true); } }}
          onDragLeave={e => { const rc = e.currentTarget.getBoundingClientRect(); if (e.clientX < rc.left || e.clientX > rc.right || e.clientY < rc.top || e.clientY > rc.bottom) setDragOverShelf(false); }}
          onDrop={handleDropOnShelf}
          style={{
            background: dragOverShelf ? 'rgba(0,0,0,0.02)' : (savedCards.length > 0 ? '#fff' : 'transparent'),
            border: dragOverShelf
              ? `2px dashed ${M.primary}`
              : (savedCards.length > 0 ? `1px solid ${M.outlineVar}` : `2px dashed rgba(0,0,0,0.12)`),
            borderRadius: 20,
            padding: savedCards.length > 0 || dragOverShelf ? '14px 16px' : '12px 16px',
            marginBottom: 16,
            boxShadow: dragOverShelf ? `0 0 0 4px rgba(0,0,0,0.05)` : (savedCards.length > 0 ? M.shadowMd : 'none'),
            transition: 'all 0.18s',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: savedCards.length > 0 || dragOverShelf ? 12 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {savedCards.length > 0 && (
                <div style={{ padding: '2px 10px', borderRadius: R.full, background: M.gradient, color: '#fff', fontSize: 11, fontWeight: 700 }}>⭐ {savedCards.length}</div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: dragOverShelf ? M.primary : (savedCards.length > 0 ? M.onSurface : M.onSurfaceVar) }}>
                {dragOverShelf ? 'Drop here to save to shelf'
                  : savedCards.length > 0 ? 'Shelf — tap to add · drag to card'
                  : 'Shelf empty — drag a card here or use ★'}
              </div>
            </div>
            {savedCards.length > 0 && !dragOverShelf && (
              <button onClick={() => { setSavedCards([]); showToast('Shelf cleared'); }}
                style={{ fontSize: 11, color: M.onSurfaceVar, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>Clear</button>
            )}
          </div>
          {(savedCards.length > 0 || dragOverShelf) && (
            <div className="ss" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {savedCards.length === 0 && dragOverShelf && (
                <div style={{ fontSize: 13, color: M.primary, fontWeight: 600, padding: '8px 0' }}>📋 Release to save</div>
              )}
              {savedCards.map(s => (
                <ShelfCard key={s.savedId} s={s} font={font}
                  cardStyle={cardStyle}
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

        {/* Drag hint */}
        {isDragging && (
          <div style={{
            textAlign: 'center', fontSize: 12, fontWeight: 600, marginBottom: 14,
            padding: '10px 16px', borderRadius: 12,
            background: 'rgba(0,0,0,0.04)',
            color: M.onSurface,
            border: `1px solid ${M.outlineVar}`,
          }}>
            {dragSrcType === 'shelf'
              ? '⭐ Drop onto any slot — card goes to top of grid'
              : '⠿ Drop onto a card to insert before it · empty slot to append · drag UP to shelf to save ⭐'}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ padding: '7px 20px', borderRadius: R.full, border: `1.5px solid ${M.outlineVar}`, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: M.primary, opacity: page === 0 ? .35 : 1, fontFamily: 'inherit', boxShadow: M.shadowSm, transition: 'all .15s' }}>◀ Prev</button>
            <span style={{ fontSize: 13, color: M.onSurfaceVar, fontWeight: 600, minWidth: 100, textAlign: 'center' }}>Page {page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              style={{ padding: '7px 20px', borderRadius: R.full, border: `1.5px solid ${M.outlineVar}`, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: M.primary, opacity: page >= totalPages - 1 ? .35 : 1, fontFamily: 'inherit', boxShadow: M.shadowSm, transition: 'all .15s' }}>Next ▶</button>
          </div>
        )}

        {/* ── Sticker Grid ── */}
        <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 20, padding: '16px 14px', border: `1px solid ${M.outlineVar}`, boxShadow: M.shadowSm }}>
          <div ref={premiumGridRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols},1fr)`, gap: 10 }}>
            {pageProds.map(p => {
              const CardComp = cardStyle === 0 ? StickerCard : PriceTagCard;
              return (
              <CardComp key={p.id} p={p} font={font}
                onClick={() => { if (!isDragging) openEdit(p); }}
                onDelete={() => remove(p.id)}
                onSave={() => saveCardToShelf(p)}
                active={modal === p.id}
                {...(cardStyle > 0 ? { layout: cardStyle } : {})}
                {...cdp(p)} />
              );
            })}
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
                  border: `2px dashed rgba(0,0,0,0.14)`, borderRadius: 14, minHeight: 96,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(0,0,0,0.2)', fontSize: 22, cursor: 'pointer', transition: 'all .15s', gap: 4,
                  background: 'transparent',
                }}
                onMouseEnter={e => { if (!isDragging) { e.currentTarget.style.borderColor = M.primary; e.currentTarget.style.color = M.primary; e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)'; e.currentTarget.style.color = 'rgba(0,0,0,0.2)'; e.currentTarget.style.background = 'transparent'; }}>
                {isDragging ? <span style={{ fontSize: 18 }}>📋</span> : <span style={{ fontSize: 24, fontWeight: 300 }}>+</span>}
                {isDragging && <span style={{ fontSize: 9, fontWeight: 700, color: M.primary }}>drop here</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAB ── */}
      <div style={{ position: 'fixed', bottom: 28, right: 24, zIndex: 200 }}>
        <button onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '15px 28px',
            background: M.gradient, color: '#fff',
            border: 'none', borderRadius: R.full,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(99,102,241,0.42), 0 3px 10px rgba(99,102,241,0.25)',
            fontFamily: `'${font}',sans-serif`,
            transition: 'all .2s cubic-bezier(.2,0,0,1)',
            letterSpacing: 0.2,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.52), 0 6px 16px rgba(99,102,241,0.32)'; e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.42), 0 3px 10px rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'none'; }}>
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
        cardStyle={cardStyle}
        onPickShelf={sc => { addSavedToGrid(sc); }}
        onNewCreate={() => {
          setForm({ ...EMPTY, theme: defaultStyle.theme, filled: defaultStyle.filled, ellipsis: defaultStyle.ellipsis });
          setAddToShelf(false); setModal('add');
        }}
        onRemoveShelf={removeSavedCard}
      />

      {/* ── Edit / Add Modal ── */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,50,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(10px)' }}>
          <div className="modal-card" style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 440, boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.1)', maxHeight: '92vh', overflowY: 'auto', border: `1px solid ${M.outlineVar}` }}>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: M.onSurface, letterSpacing: -0.4, lineHeight: 1.2 }}>
                {modal === 'add' ? '✨ New Sticker' : '✏️ Edit Sticker'}
              </div>
              <div style={{ fontSize: 13, color: M.onSurfaceVar, marginTop: 3 }}>Fill in product details below</div>
            </div>

            {/* ── CLASSIC fields ── */}
            {cardStyle === 0 && (<>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Product Name',       key: 'name',    ph: 'e.g. Samsung Galaxy A55 5G' },
                  { label: 'RAM (GB)',            key: 'ram',     ph: 'e.g. 8 or 8+8',  tag: v => `RAM: ${v} GB` },
                  { label: 'Storage / ROM (GB)', key: 'rom',     ph: 'e.g. 256',        tag: v => `ROM: ${v} GB` },
                  { label: 'Battery (mAh)',       key: 'battery', ph: 'e.g. 5000' },
                  { label: 'Price (THB)',         key: 'price',   ph: 'e.g. 9990' },
                ].map(f => (
                  <div key={f.key}>
                    <Field label={f.label} value={form[f.key]}
                      onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && save()}
                      placeholder={f.ph} />
                    {f.tag && form[f.key] && (
                      <div style={{ marginTop: 5 }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: `${THEMES[form.theme].color}18`,
                          color: THEMES[form.theme].color,
                          border: `1px solid ${THEMES[form.theme].color}40`,
                        }}>{f.tag(form[f.key])}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Colour picker */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Sticker Color</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {THEMES.map((t, i) => (
                    <div key={i} onClick={() => setForm(v => ({ ...v, theme: i }))} title={t.label} style={{
                      width: 36, height: 36, borderRadius: '50%', background: t.color, cursor: 'pointer',
                      border: form.theme === i ? '3px solid #fff' : '3px solid transparent',
                      boxShadow: form.theme === i ? `0 0 0 3px ${t.color}, 0 4px 12px ${t.color}60` : '0 2px 6px rgba(0,0,0,0.15)',
                      transform: form.theme === i ? 'scale(1.18)' : 'scale(1)',
                      transition: 'all .15s cubic-bezier(.2,0,0,1)',
                    }} />
                  ))}
                </div>
              </div>

              {/* Style toggle */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Sticker Style</div>
                <StyleToggle value={form.filled} onChange={v => setForm(f => ({ ...f, filled: v }))} color={activeColor} />
              </div>

              {/* Set as default style */}
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 12,
                background: isCurrentDefault ? `rgba(99,102,241,0.06)` : M.s2,
                border: `1px solid ${isCurrentDefault ? M.outlineVar : 'rgba(0,0,0,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                transition: 'all .2s',
              }}>
                <div style={{ fontSize: 12, color: isCurrentDefault ? M.primary : M.onSurfaceVar, fontWeight: isCurrentDefault ? 600 : 400 }}>
                  {isCurrentDefault ? '✓ This is your default card style' : 'Save color & style as default for new cards'}
                </div>
                {!isCurrentDefault && (
                  <button onClick={applyDefaultStyle} style={{
                    padding: '5px 13px', borderRadius: R.full, flexShrink: 0,
                    background: M.s3, color: M.onSurfaceVar,
                    border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>Set Default</button>
                )}
              </div>

              {/* One-line name */}
              <div style={{
                marginBottom: 14, padding: '12px 14px', borderRadius: 12,
                background: form.ellipsis ? `rgba(99,102,241,0.06)` : M.s2,
                border: `1px solid ${form.ellipsis ? M.outlineVar : 'rgba(0,0,0,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all .2s',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface, lineHeight: 1.3 }}>
                    One-line name
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 700,
                      padding: '2px 7px', borderRadius: R.full,
                      background: form.ellipsis ? M.primary : M.s4,
                      color: form.ellipsis ? '#fff' : M.onSurfaceVar,
                      transition: 'all .2s',
                    }}>{form.ellipsis ? 'ON' : 'OFF'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>
                    {form.ellipsis ? 'Long names truncated with …' : 'Names wrap to multiple lines'}
                  </div>
                </div>
                <Switch value={form.ellipsis} onChange={v => setForm(f => ({ ...f, ellipsis: v }))} />
              </div>
            </>)}

            {/* ── PREMIUM fields ── */}
            {cardStyle > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                <Field label="Brand" value={form.brand || ''}
                  onChange={e => setForm(v => ({ ...v, brand: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  placeholder="e.g. Google" />
                <Field label="Product Name (Model)" value={form.name}
                  onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  placeholder="e.g. Pixel 9 Pro XL" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Battery (mAh)" value={form.battery}
                    onChange={e => setForm(v => ({ ...v, battery: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. 5100" />
                  <Field label="Camera (MP)" value={form.camera || ''}
                    onChange={e => setForm(v => ({ ...v, camera: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. 50" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Chip" value={form.chip || ''}
                    onChange={e => setForm(v => ({ ...v, chip: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. Tensor G4" />
                  <Field label='Display (")' value={form.display || ''}
                    onChange={e => setForm(v => ({ ...v, display: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. 6.8" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Storage (GB)" value={form.rom}
                    onChange={e => setForm(v => ({ ...v, rom: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. 256" />
                  <Field label="RAM (GB)" value={form.ram}
                    onChange={e => setForm(v => ({ ...v, ram: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. 12" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Price" value={form.price}
                    onChange={e => setForm(v => ({ ...v, price: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. 999000" />
                  <Field label="Original Price" value={form.oldPrice || ''}
                    onChange={e => setForm(v => ({ ...v, oldPrice: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    placeholder="e.g. 1200000" />
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: form.has5g ? 'rgba(26,115,232,0.06)' : M.s2,
                  border: `1px solid ${form.has5g ? 'rgba(26,115,232,0.2)' : 'rgba(0,0,0,0.06)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>📶 5G</div>
                  <Switch value={!!form.has5g} onChange={v => setForm(f => ({ ...f, has5g: v }))} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                    Featured Spec
                  </div>
                  <select className="ctrl-select"
                    value={form.featuredSpec || ''}
                    onChange={e => setForm(v => ({ ...v, featuredSpec: e.target.value }))}>
                    <option value="">Auto (based on specs + price)</option>
                    <option value="camera">📸 Camera Pro layout</option>
                  </select>
                </div>
              </div>
            )}

            {/* Save to shelf — both styles */}
            <div style={{
              marginBottom: 16, padding: '12px 14px', borderRadius: 12,
              background: addToShelf ? `rgba(139,92,246,0.06)` : M.s2,
              border: `1px solid ${addToShelf ? 'rgba(139,92,246,0.2)' : 'rgba(0,0,0,0.06)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all .2s',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: M.onSurface }}>Save to shelf ⭐</div>
                {addToShelf && <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 2 }}>Card saved for quick reuse</div>}
              </div>
              <Switch value={addToShelf} onChange={setAddToShelf} />
            </div>

            {/* Live preview — both styles */}
            {form.name && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                <div style={{ maxWidth: 180 }}>
                  {cardStyle === 0 ? (
                    <StickerCard p={{ ...form, id: 0 }} font={font}
                      onClick={() => {}} onDelete={() => {}} onSave={() => {}}
                      active={false} isDragging={false} dragOverClass=""
                      onDragStart={() => {}} onDragEnd={() => {}} onDragOver={() => {}}
                      onDragEnter={() => {}} onDragLeave={() => {}} onDrop={() => {}} />
                  ) : (
                    <PriceTagCard p={{ ...form, id: 0 }} font={font} layout={cardStyle}
                      onClick={() => {}} onDelete={() => {}} onSave={() => {}}
                      active={false} isDragging={false} dragOverClass=""
                      onDragStart={() => {}} onDragEnd={() => {}} onDragOver={() => {}}
                      onDragEnter={() => {}} onDragLeave={() => {}} onDrop={() => {}} />
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: '12px 0', borderRadius: R.full,
                border: `1.5px solid ${M.outlineVar}`, background: '#fff',
                color: M.primary, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all .15s',
              }}>Cancel</button>
              <button onClick={save} disabled={!canSave} style={{
                flex: 2, padding: '12px 0', borderRadius: R.full, border: 'none',
                background: canSave ? M.gradient : M.s3,
                color: canSave ? '#fff' : M.onSurfaceVar,
                fontSize: 14, fontWeight: 700,
                cursor: canSave ? 'pointer' : 'not-allowed',
                boxShadow: canSave ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
                fontFamily: 'inherit', transition: 'all .15s',
              }}>
                {modal === 'add'
                  ? (addToShelf ? 'Add to Grid & Shelf ⭐' : 'Add Sticker')
                  : (addToShelf ? 'Save & Add to Shelf ⭐' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      <CardStylePickerDialog
        open={stylePickerOpen}
        current={cardStyle}
        onSelect={handleStyleChange}
        onClose={() => setStylePickerOpen(false)}
        font={font}
      />

      {/* ── Style Switch Warning Dialog ── */}
      {pendingStyle !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,50,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16, backdropFilter: 'blur(10px)' }}
          onClick={() => setPendingStyle(null)}
        >
          <div
            className="modal-card"
            style={{ background: '#fff', borderRadius: 24, padding: '32px 24px 24px', width: '100%', maxWidth: 380, boxShadow: '0 32px 80px rgba(0,0,0,0.24)', border: `1px solid ${M.outlineVar}` }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: M.onSurface, textAlign: 'center', letterSpacing: -0.3, marginBottom: 10 }}>
              Switch Card Style?
            </div>
            <div style={{ fontSize: 14, color: M.onSurfaceVar, textAlign: 'center', lineHeight: 1.65, marginBottom: 26 }}>
              Switching to{' '}
              <strong style={{ color: M.onSurface }}>
                {CARD_STYLES[pendingStyle]?.emoji} {CARD_STYLES[pendingStyle]?.name}
              </strong>{' '}
              will remove all{' '}
              <strong style={{ color: M.error }}>{products.length}</strong>{' '}
              card{products.length !== 1 ? 's' : ''} from the grid.
              <br />This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPendingStyle(null)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: R.full,
                  border: `1.5px solid ${M.outlineVar}`, background: '#fff',
                  color: M.onSurface, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                }}>Cancel</button>
              <button
                onClick={() => applyStyleChange(pendingStyle)}
                style={{
                  flex: 2, padding: '12px 0', borderRadius: R.full, border: 'none',
                  background: M.error, color: M.onError,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all .15s',
                  boxShadow: '0 4px 14px rgba(204,0,0,0.35)',
                }}>Clear Grid & Switch</button>
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
