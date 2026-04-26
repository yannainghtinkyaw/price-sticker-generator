import { useEffect, useRef, useState } from "react";
import { M, R, THEMES, FONTS, PAPER_SIZES } from "./lib/constants.js";
import { drawSticker } from "./lib/canvas.js";
import {
  BASE_GRID_COLS,
  SAMPLE_STICKER_DATA,
  STYLE_CATALOG,
  clampGridCols,
  clampGridRows,
  cloneSticker,
  createInitialStickers,
  createShelfItem,
  createSticker,
  createWorkspaceSnapshot,
  getPageRowsForPaper,
  getStyleMeta,
  getStyleEditorConfig,
  hydrateShelfItems,
  hydrateWorkspaceSnapshot,
  normalizeStickerData,
  packStickerPages,
} from "./lib/stickerModel.js";
import Snack from "./components/Snack.jsx";
import ShelfCard from "./components/ShelfCard.jsx";
import PriceTagCard from "./components/PriceTagCard.jsx";
import StickerCard from "./components/StickerCard.jsx";
import AppToolbar from "./components/AppToolbar.jsx";
import StickerEditorModal from "./components/StickerEditorModal.jsx";
import ShelfPickDialog from "./dialogs/ShelfPickDialog.jsx";
import CsvDialog from "./dialogs/CsvDialog.jsx";
import TemplatesDialog from "./dialogs/TemplatesDialog.jsx";

const LS_WORKSPACE = "pts_workspace_v4";
const LS_SHELF = "pts_shelf_v2";
const LS_TEMPLATES = "pts_templates_v2";

function lsGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        resolve(JSON.parse(String(event.target?.result || "{}")));
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

function triggerDownload(filename, href) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Canvas export failed"));
      },
      type,
      quality,
    );
  });
}

function IcUpload({ s = 16 }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IcImage({ s = 16 }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function IcChevDown({ s = 14 }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IcLayers({ s = 16 }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IcFile({ s = 16 }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function IcGrid({ s = 16 }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IcCardStack({ s = 16 }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7.5h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
      <path d="M8 5.5h8" />
      <path d="M9 3.5h6" />
    </svg>
  );
}

const PREVIEW_CARD_PROPS = {
  onClick: () => {},
  onDelete: () => {},
  onSave: () => {},
  active: false,
  isDragging: false,
  dragOverClass: "",
  onDragStart: () => {},
  onDragEnd: () => {},
  onDragOver: () => {},
  onDragEnter: () => {},
  onDragLeave: () => {},
  onDrop: () => {},
  preview: true,
};

function StyleSample({ styleKey, font, onCreate, onDragStart, onDragEnd }) {
  const meta = getStyleMeta(styleKey);
  const sampleSticker = createSticker({
    styleKey,
    gridCols: meta.defaultGridCols,
    gridRows: meta.defaultGridRows,
    data: SAMPLE_STICKER_DATA,
  });
  const cardEl =
    styleKey === "classic" ? (
      <StickerCard p={sampleSticker.data} font={font} {...PREVIEW_CARD_PROPS} />
    ) : (
      <PriceTagCard
        p={sampleSticker.data}
        font={font}
        forcedLayout={meta.layout}
        {...PREVIEW_CARD_PROPS}
      />
    );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onCreate}
      style={{
        border: `1px solid ${M.outlineVar}`,
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        cursor: "grab",
        boxShadow: M.shadowSm,
      }}
    >
      <div style={{ height: 126, overflow: "hidden", background: M.s2 }}>
        <div
          style={{
            transform: "scale(0.48)",
            transformOrigin: "top left",
            width: "208%",
            pointerEvents: "none",
          }}
        >
          {cardEl}
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: M.onSurface }}>
              {meta.name}
            </div>
            <div style={{ fontSize: 10, color: M.onSurfaceVar, marginTop: 2 }}>
              {meta.desc}
            </div>
          </div>
          <div
            style={{
              padding: "3px 8px",
              borderRadius: R.full,
              background: M.s2,
              color: M.onSurfaceVar,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {`${meta.defaultGridCols} x ${meta.defaultGridRows || 1}`}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function App() {
  const STYLE_DRAWER_WIDTH = 460;
  const initialWorkspace = hydrateWorkspaceSnapshot({
    stickers: createInitialStickers(),
    font: "Kanit",
    paperSize: "a4",
    defaultGridCols: 1,
    selectedStyleKey: "classic",
  });

  const [stickers, setStickers] = useState(initialWorkspace.stickers);
  const [font, setFont] = useState(initialWorkspace.font);
  const [paperSize, setPaperSize] = useState(initialWorkspace.paperSize);
  const [defaultGridCols, setDefaultGridCols] = useState(
    initialWorkspace.defaultGridCols,
  );
  const [selectedStyleKey, setSelectedStyleKey] = useState(
    initialWorkspace.selectedStyleKey,
  );
  const [savedCards, setSavedCards] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [csvOpen, setCsvOpen] = useState(false);
  const [shelfPickOpen, setShelfPickOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [styleDrawerOpen, setStyleDrawerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(normalizeStickerData({}, "classic"));
  const [formStyleKey, setFormStyleKey] = useState("classic");
  const [formGridCols, setFormGridCols] = useState(1);
  const [formGridRows, setFormGridRows] = useState(1);
  const [addToShelf, setAddToShelf] = useState(false);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [dlOpen, setDlOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [dragState, setDragState] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverStyleDrawer, setDragOverStyleDrawer] = useState(false);

  const canvasRef = useRef(null);
  const workspaceLoadedRef = useRef(false);
  const shelfLoadedRef = useRef(false);
  const templatesLoadedRef = useRef(false);

  const paper =
    PAPER_SIZES.find((size) => size.id === paperSize) || PAPER_SIZES[1];
  const pageRows = getPageRowsForPaper(paper);
  const pages = packStickerPages(stickers, paper);
  const totalPages = pages.length;
  const currentPage = pages[Math.min(page, totalPages - 1)] || pages[0];
  const currentPlacements = currentPage?.placements || [];
  const pagePreviewAspect = `${paper.h} / ${paper.w}`;
  const reservedDrawerSpace = styleDrawerOpen ? STYLE_DRAWER_WIDTH + 24 : 0;
  const editorConfig = getStyleEditorConfig(formStyleKey);
  const canSave = editorConfig.required.every((field) => {
    if (field === "has5g") return true;
    return !!String(formData[field] ?? "").trim();
  });
  const isDragging = !!dragState;

  useEffect(() => {
    const workspaceRaw = lsGet(LS_WORKSPACE);
    if (workspaceRaw) {
      try {
        const workspace = hydrateWorkspaceSnapshot(JSON.parse(workspaceRaw));
        setStickers(workspace.stickers);
        setFont(workspace.font);
        setPaperSize(workspace.paperSize);
        setDefaultGridCols(workspace.defaultGridCols);
        setSelectedStyleKey(workspace.selectedStyleKey);
      } catch {}
    }
    workspaceLoadedRef.current = true;
  }, []);

  useEffect(() => {
    const shelfRaw = lsGet(LS_SHELF);
    if (shelfRaw) {
      try {
        setSavedCards(hydrateShelfItems(JSON.parse(shelfRaw)));
      } catch {}
    }
    shelfLoadedRef.current = true;
  }, []);

  useEffect(() => {
    const templatesRaw = lsGet(LS_TEMPLATES);
    if (templatesRaw) {
      try {
        setTemplates(JSON.parse(templatesRaw));
      } catch {}
    }
    templatesLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!workspaceLoadedRef.current) return;
    lsSet(
      LS_WORKSPACE,
      JSON.stringify(
        createWorkspaceSnapshot({
          font,
          paperSize,
          defaultGridCols,
          selectedStyleKey,
          stickers,
        }),
      ),
    );
  }, [font, paperSize, defaultGridCols, selectedStyleKey, stickers]);

  useEffect(() => {
    if (!shelfLoadedRef.current) return;
    lsSet(LS_SHELF, JSON.stringify(savedCards));
  }, [savedCards]);

  useEffect(() => {
    if (!templatesLoadedRef.current) return;
    lsSet(LS_TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  useEffect(() => {
    FONTS.forEach((fontDef) => {
      const id = `gf-${fontDef.name.replace(/\s/g, "-")}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontDef.css}&display=swap`;
      document.head.appendChild(link);
    });
  }, []);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function createStickerFromStyle(
    styleKey,
    dataOverrides = {},
    gridColsOverride,
  ) {
    const style = getStyleMeta(styleKey);
    return createSticker({
      styleKey: style.key,
      gridCols: gridColsOverride ?? defaultGridCols ?? style.defaultGridCols,
      gridRows: style.defaultGridRows ?? 1,
      gridPage: null,
      gridRow: null,
      gridCol: null,
      data: {
        ...SAMPLE_STICKER_DATA,
        ...dataOverrides,
      },
    });
  }

  function openNewSticker(styleKey = selectedStyleKey) {
    const style = getStyleMeta(styleKey);
    setEditingId(null);
    setFormStyleKey(style.key);
    setFormGridCols(clampGridCols(defaultGridCols ?? style.defaultGridCols));
    setFormGridRows(clampGridRows(style.defaultGridRows ?? 1));
    setFormData(normalizeStickerData(SAMPLE_STICKER_DATA, style.key));
    setAddToShelf(false);
    setEditorOpen(true);
  }

  function openEditSticker(sticker) {
    setEditingId(sticker.id);
    setFormStyleKey(sticker.styleKey);
    setFormGridCols(clampGridCols(sticker.gridCols));
    setFormGridRows(clampGridRows(sticker.gridRows));
    setFormData(normalizeStickerData(sticker.data, sticker.styleKey));
    setAddToShelf(false);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingId(null);
  }

  function saveEditor() {
    if (!canSave) return;
    const style = getStyleMeta(formStyleKey);
    const currentSticker = editingId
      ? stickers.find((item) => item.id === editingId)
      : null;
    const sticker = createSticker({
      id: editingId || undefined,
      styleKey: formStyleKey,
      gridCols: style.fixedSize ? style.defaultGridCols : formGridCols,
      gridRows: style.fixedSize ? style.defaultGridRows : formGridRows,
      gridPage: currentSticker?.gridPage ?? null,
      gridRow: currentSticker?.gridRow ?? null,
      gridCol: currentSticker?.gridCol ?? null,
      data: formData,
    });
    const currentPagePlacement = findPlacementOnCurrentPage(
      sticker,
      editingId ? [editingId] : [],
    );

    if (editingId) {
      setStickers((prev) =>
        prev.map((item) => (item.id === editingId ? sticker : item)),
      );
      showToast(
        !currentPagePlacement &&
          sticker.gridCols === BASE_GRID_COLS &&
          sticker.gridRows >= pageRows
          ? "Sticker updated. Current page has no full-page space, so it may move to another page."
          : "Sticker updated",
      );
    } else {
      setStickers((prev) => [...prev, sticker]);
      showToast(
        !currentPagePlacement &&
          sticker.gridCols === BASE_GRID_COLS &&
          sticker.gridRows >= pageRows
          ? "Sticker added. Current page has no full-page space, so it will use another page."
          : "Sticker added",
      );
    }

    if (addToShelf) {
      setSavedCards((prev) => [...prev, createShelfItem(sticker)]);
    }

    closeEditor();
  }

  function orderStickersByVisualLayout(sourceStickers) {
    const placements = packStickerPages(sourceStickers, paper)
      .flatMap((pageData) => pageData.placements)
      .sort((a, b) => a.row - b.row || a.col - b.col);
    const byId = new Map(
      sourceStickers.map((sticker) => [sticker.id, sticker]),
    );
    return placements
      .map(({ sticker }) => byId.get(sticker.id))
      .filter(Boolean);
  }

  function removeSticker(id) {
    setStickers((prev) => {
      const filtered = prev.filter((sticker) => sticker.id !== id);
      return orderStickersByVisualLayout(filtered);
    });
    showToast("Sticker deleted");
  }

  function clearAll() {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 2500);
      return;
    }
    setStickers([]);
    setPage(0);
    setClearConfirm(false);
    showToast("Grid cleared");
  }

  function saveStickerToShelf(sticker) {
    setSavedCards((prev) => [...prev, createShelfItem(sticker)]);
    showToast("Saved to shelf");
  }

  function removeShelfItem(id) {
    setSavedCards((prev) => prev.filter((item) => item.id !== id));
  }

  function addShelfItemToGrid(item) {
    const clone = cloneSticker(item.sticker, {
      gridPage: null,
      gridRow: null,
      gridCol: null,
    });
    setStickers((prev) => [...prev, clone]);
    showToast("Added from shelf");
  }

  function duplicateStickerInGrid(sourceSticker) {
    const clone = cloneSticker(sourceSticker, {
      gridPage: null,
      gridRow: null,
      gridCol: null,
    });

    for (let row = 0; row < pageRows; row += 1) {
      for (let col = 0; col < BASE_GRID_COLS; col += 1) {
        if (!canPlaceStickerOnCurrentPage(clone, row, col)) continue;
        setStickers((prev) => [
          ...prev,
          { ...clone, gridPage: page, gridRow: row, gridCol: col },
        ]);
        showToast("Sticker duplicated");
        return;
      }
    }

    setStickers((prev) => [...prev, clone]);
    showToast("Sticker duplicated to next available space");
  }

  function snapshotCurrentWorkspace(name = "") {
    return createWorkspaceSnapshot({
      name,
      font,
      paperSize,
      defaultGridCols,
      selectedStyleKey,
      stickers,
    });
  }

  function loadWorkspace(snapshot) {
    const workspace = hydrateWorkspaceSnapshot(snapshot);
    setStickers(workspace.stickers);
    setFont(workspace.font);
    setPaperSize(workspace.paperSize);
    setDefaultGridCols(workspace.defaultGridCols);
    setSelectedStyleKey(workspace.selectedStyleKey);
    setPage(0);
  }

  function saveTemplate(name) {
    const snapshot = snapshotCurrentWorkspace(name);
    const template = {
      id: uid("tpl"),
      name: snapshot.name,
      savedAt: new Date().toISOString(),
      snapshot,
    };
    setTemplates((prev) => [...prev, template]);
    showToast("Template saved");
  }

  function loadTemplate(template) {
    loadWorkspace(template.snapshot || template);
    showToast("Template loaded");
  }

  function deleteTemplate(id) {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
    showToast("Template removed");
  }

  function exportCurrentWorkspaceJson(name = "") {
    const snapshot = snapshotCurrentWorkspace(name);
    downloadJson(
      `${(snapshot.name || "workspace").replace(/\s+/g, "-").toLowerCase()}.json`,
      snapshot,
    );
    showToast("Workspace JSON exported");
  }

  async function importTemplateJson(file) {
    try {
      const payload = await readJsonFile(file);
      const snapshot = payload.snapshot ? payload.snapshot : payload;
      const workspace = hydrateWorkspaceSnapshot(snapshot);
      const template = {
        id: uid("tpl"),
        name:
          workspace.name ||
          payload.name ||
          `Imported ${new Date().toLocaleDateString()}`,
        savedAt: new Date().toISOString(),
        snapshot,
      };
      setTemplates((prev) => [...prev, template]);
      loadWorkspace(snapshot);
      showToast("Workspace JSON imported");
    } catch (error) {
      showToast(error.message || "Import failed");
    }
  }

  function exportShelfJson() {
    downloadJson(`shelf-${new Date().toISOString().slice(0, 10)}.json`, {
      version: 2,
      kind: "shelf",
      exportedAt: new Date().toISOString(),
      items: savedCards,
    });
    showToast("Shelf JSON exported");
  }

  async function importShelfJson(file) {
    try {
      const payload = await readJsonFile(file);
      const items = hydrateShelfItems(payload.items || payload);
      setSavedCards((prev) => [...prev, ...items]);
      showToast(`Imported ${items.length} shelf items`);
    } catch (error) {
      showToast(error.message || "Import failed");
    }
  }

  function handleCsvImport(rows, mode) {
    const imported = rows.map((row) =>
      createSticker({
        styleKey: selectedStyleKey,
        gridCols: defaultGridCols,
        data: row,
      }),
    );

    if (mode === "replace") {
      setStickers(imported);
      setPage(0);
    } else {
      setStickers((prev) => [...prev, ...imported]);
    }
    showToast(`Imported ${imported.length} stickers`);
  }

  function buildStickerFromDrag() {
    if (!dragState) return null;

    if (dragState.type === "style") {
      return createStickerFromStyle(dragState.styleKey);
    }

    if (dragState.type === "shelf") {
      const shelfItem = savedCards.find((item) => item.id === dragState.itemId);
      return shelfItem
        ? cloneSticker(shelfItem.sticker, {
            gridPage: null,
            gridRow: null,
            gridCol: null,
          })
        : null;
    }

    if (dragState.type === "grid") {
      const sticker = stickers.find((item) => item.id === dragState.stickerId);
      return sticker || null;
    }

    return null;
  }

  function resetDrag() {
    setDragState(null);
    setDragOverId(null);
    setDragOverStyleDrawer(false);
  }

  function canPlaceStickerOnCurrentPage(sticker, row, col, ignoreIds = []) {
    if (!sticker) return false;
    const span = clampGridCols(sticker.gridCols);
    const rowSpan = clampGridRows(sticker.gridRows);
    if (col < 0 || row < 0) return false;
    if (col + span > BASE_GRID_COLS) return false;
    if (row + rowSpan > pageRows) return false;

    const ignored = new Set(ignoreIds);
    for (const placement of currentPlacements) {
      if (ignored.has(placement.sticker.id)) continue;
      const overlapsCols =
        col < placement.col + placement.span && col + span > placement.col;
      const overlapsRows =
        row < placement.row + placement.rowSpan &&
        row + rowSpan > placement.row;
      if (overlapsCols && overlapsRows) return false;
    }

    return true;
  }

  function findPlacementOnCurrentPage(sticker, ignoreIds = []) {
    if (!sticker) return null;
    for (let row = 0; row < pageRows; row += 1) {
      for (let col = 0; col < BASE_GRID_COLS; col += 1) {
        if (canPlaceStickerOnCurrentPage(sticker, row, col, ignoreIds)) {
          return { row, col };
        }
      }
    }
    return null;
  }

  function resolveDropPlacement(sticker, row, col, ignoreIds = []) {
    if (!sticker) return null;
    const span = clampGridCols(sticker.gridCols);
    const maxStartCol = Math.max(0, BASE_GRID_COLS - span);
    const minCandidateCol = Math.max(0, col - span + 1);
    const maxCandidateCol = Math.min(col, maxStartCol);

    for (
      let candidateCol = maxCandidateCol;
      candidateCol >= minCandidateCol;
      candidateCol -= 1
    ) {
      if (canPlaceStickerOnCurrentPage(sticker, row, candidateCol, ignoreIds)) {
        return { row, col: candidateCol };
      }
    }

    return null;
  }

  function getDragStickerForPlacement() {
    return buildStickerFromDrag();
  }

  function handleGridDragStart(sticker, event) {
    event.dataTransfer.setData("text/plain", sticker.id);
    event.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => {
      setDragState({ type: "grid", stickerId: sticker.id });
    });
  }

  function handleShelfDragStart(item, event) {
    event.dataTransfer.setData("text/plain", item.id);
    event.dataTransfer.effectAllowed = "copy";
    requestAnimationFrame(() => {
      setDragState({ type: "shelf", itemId: item.id });
    });
  }

  function handleStyleDragStart(styleKey, event) {
    event.dataTransfer.setData("text/plain", styleKey);
    event.dataTransfer.effectAllowed = "copy";
    setSelectedStyleKey(styleKey);
    requestAnimationFrame(() => {
      setDragState({ type: "style", styleKey });
    });
  }

  function insertStickerAt(index, sticker) {
    setStickers((prev) => {
      const next = [...prev];
      next.splice(index, 0, sticker);
      return next;
    });
  }

  function setStickerPlacement(stickerId, placement) {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === stickerId
          ? {
              ...sticker,
              gridPage: placement.page,
              gridRow: placement.row,
              gridCol: placement.col,
            }
          : sticker,
      ),
    );
  }

  function clearStickerPlacement(stickerId) {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === stickerId
          ? { ...sticker, gridPage: null, gridRow: null, gridCol: null }
          : sticker,
      ),
    );
  }

  function handleDropBeforeSticker(targetId) {
    if (dragState?.type === "grid" && dragState.stickerId === targetId) {
      resetDrag();
      return;
    }
    const targetPlacement = currentPlacements.find(
      (item) => item.sticker.id === targetId,
    );
    if (!targetPlacement) {
      resetDrag();
      return;
    }

    if (dragState?.type === "grid") {
      const sourcePlacement = currentPlacements.find(
        (item) => item.sticker.id === dragState.stickerId,
      );
      const sourceSticker = stickers.find(
        (item) => item.id === dragState.stickerId,
      );
      const targetSticker = stickers.find((item) => item.id === targetId);
      const canMoveDragged = canPlaceStickerOnCurrentPage(
        sourceSticker,
        targetPlacement.row,
        targetPlacement.col,
        [dragState.stickerId, targetId],
      );
      const canMoveTarget = sourcePlacement
        ? canPlaceStickerOnCurrentPage(
            targetSticker,
            sourcePlacement.row,
            sourcePlacement.col,
            [dragState.stickerId, targetId],
          )
        : true;

      if (!canMoveDragged || !canMoveTarget) {
        resetDrag();
        showToast("Can't place sticker there");
        return;
      }

      setStickers((prev) =>
        prev.map((sticker) => {
          if (sticker.id === dragState.stickerId) {
            return {
              ...sticker,
              gridPage: page,
              gridRow: targetPlacement.row,
              gridCol: targetPlacement.col,
            };
          }
          if (sticker.id === targetId) {
            return {
              ...sticker,
              gridPage: sourcePlacement ? page : null,
              gridRow: sourcePlacement?.row ?? null,
              gridCol: sourcePlacement?.col ?? null,
            };
          }
          return sticker;
        }),
      );
      resetDrag();
      showToast("Sticker moved");
      return;
    }

    const newSticker = buildStickerFromDrag();
    if (!newSticker) {
      resetDrag();
      return;
    }

    resetDrag();
    showToast("Drop on an empty grid slot");
  }

  function handleDropAtPageEnd() {
    if (dragState?.type === "grid") {
      clearStickerPlacement(dragState.stickerId);
      resetDrag();
      showToast("Sticker moved");
      return;
    }

    const newSticker = buildStickerFromDrag();
    if (!newSticker) {
      resetDrag();
      return;
    }

    const lastSticker =
      currentPlacements[currentPlacements.length - 1]?.sticker;
    if (!lastSticker) {
      insertStickerAt(stickers.length, newSticker);
    } else {
      const lastIndex = stickers.findIndex(
        (sticker) => sticker.id === lastSticker.id,
      );
      insertStickerAt(lastIndex + 1, newSticker);
    }
    resetDrag();
    showToast("Sticker added to grid");
  }

  function handleDropAtEmptySlot(targetRow, targetCol) {
    const dragSticker = getDragStickerForPlacement();
    const ignoreIds = dragState?.type === "grid" ? [dragState.stickerId] : [];
    const placement = resolveDropPlacement(
      dragSticker,
      targetRow,
      targetCol,
      ignoreIds,
    );
    if (!placement) {
      resetDrag();
      showToast("Can't place sticker there");
      return;
    }

    if (dragState?.type === "grid") {
      setStickerPlacement(dragState.stickerId, {
        page,
        row: placement.row,
        col: placement.col,
      });
      resetDrag();
      showToast("Sticker placed in grid");
      return;
    }

    const newSticker = buildStickerFromDrag();
    if (!newSticker) {
      resetDrag();
      return;
    }

    insertStickerAt(stickers.length, {
      ...newSticker,
      gridPage: page,
      gridRow: placement.row,
      gridCol: placement.col,
    });
    resetDrag();
    showToast("Sticker placed in grid");
  }

  async function renderPageToCanvas(pageIndex) {
    try {
      await Promise.all(
        [`400 22px '${font}'`, `700 28px '${font}'`, `900 44px '${font}'`].map(
          (fontSpec) => document.fonts.load(fontSpec),
        ),
      );
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 120));

    const pageData = pages[pageIndex] || pages[0];
    const canvas = canvasRef.current;
    const { w: width, h: height } = paper;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(30, 30, width - 60, height - 60);

    const cols = BASE_GRID_COLS;
    const rows = pageRows;
    const marginX = 70;
    const marginY = 80;
    const gapX = 18;
    const gapY = 18;
    const cellWidth = (width - marginX * 2 - gapX * (cols - 1)) / cols;
    const cellHeight = (height - marginY * 2 - gapY * (rows - 1)) / rows;

    pageData.placements.forEach(({ sticker, col, row, span }) => {
      const x = marginX + col * (cellWidth + gapX);
      const y = marginY + row * (cellHeight + gapY);
      const stickerWidth = cellWidth * span + gapX * (span - 1);
      const stickerHeight =
        cellHeight * (sticker.gridRows || 1) +
        gapY * ((sticker.gridRows || 1) - 1);
      drawSticker(ctx, sticker.data, x, y, stickerWidth, stickerHeight, font);
    });

    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    for (let col = 1; col < cols; col += 1) {
      const x = marginX + col * (cellWidth + gapX) - gapX / 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 28);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, height - 28);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let row = 1; row < rows; row += 1) {
      const y = marginY + row * (cellHeight + gapY) - gapY / 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(28, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width - 28, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    return canvas.toDataURL("image/png");
  }

  async function generateImage() {
    setBusy(true);
    try {
      const dataUrl = await renderPageToCanvas(page);
      const label = paper.label;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        setPreviewImg({ src: dataUrl, label, page: page + 1 });
      } else {
        const blob = await canvasToBlob(canvasRef.current, "image/png");
        const blobUrl = URL.createObjectURL(blob);
        triggerDownload(
          `stickers-${label.toLowerCase()}-p${page + 1}.png`,
          blobUrl,
        );
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        showToast("PNG exported");
      }
    } catch (error) {
      console.error(error);
      showToast("PNG export failed");
    } finally {
      setBusy(false);
      setDlOpen(false);
    }
  }

  async function generatePDF() {
    setBusy(true);
    try {
      const images = [];
      for (let index = 0; index < pages.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        images.push(await renderPageToCanvas(index));
      }

      const html = `<!DOCTYPE html><html><head><title>Sticker Pages</title>
        <meta charset="UTF-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #e9e9e9; padding: 24px; display: grid; gap: 20px; font-family: Arial, sans-serif; }
          img { width: 100%; max-width: 1100px; display: block; margin: 0 auto; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,0.12); break-after: page; page-break-after: always; }
          img:last-child { break-after: auto; page-break-after: auto; }
          @page { size: auto; margin: 12mm; }
          @media print {
            body { padding: 0; background: #fff; }
            img { max-width: 100%; box-shadow: none; }
          }
        </style></head><body>${images.map((src) => `<img src="${src}" alt="Sticker page" />`).join("")}</body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const printUrl = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = printUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        const frameWindow = iframe.contentWindow;
        if (!frameWindow) {
          showToast("PDF export failed");
          URL.revokeObjectURL(printUrl);
          iframe.remove();
          return;
        }

        const cleanup = () => {
          setTimeout(() => {
            URL.revokeObjectURL(printUrl);
            iframe.remove();
          }, 1000);
        };

        frameWindow.onafterprint = cleanup;
        frameWindow.focus();
        setTimeout(() => {
          frameWindow.print();
          cleanup();
        }, 250);
      };

      showToast("PDF dialog opened");
    } catch (error) {
      console.error(error);
      showToast("PDF export failed");
    } finally {
      setBusy(false);
      setDlOpen(false);
    }
  }

  function generateDoc() {
    const rowsHtml = stickers
      .map((sticker) => {
        const data = sticker.data;
        const theme = THEMES[data.theme].color;
        return `
        <tr style="background:${theme}${data.filled ? "" : "22"}">
          <td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;color:${data.filled ? "#fff" : theme}">${data.name}</td>
          <td style="padding:8px 12px;border:1px solid #ddd">${getStyleMeta(sticker.styleKey).name}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${sticker.gridCols}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${data.ram}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${data.rom}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;text-align:right;font-weight:900;color:${theme}">${data.price}.-</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />
      <title>Sticker Workspace</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 32px; background: #f7f7f7; color: #111; }
        h1 { font-size: 26px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 3px 16px rgba(0,0,0,0.08); }
        th { background: #111; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; }
        @media print { body { padding: 0; background: #fff; } }
      </style></head><body>
      <h1>Sticker Workspace</h1>
      <div class="meta">Exported ${new Date().toLocaleString()} | ${stickers.length} stickers | ${pages.length} pages | ${font}</div>
      <table><thead><tr><th>Name</th><th>Style</th><th>Grid</th><th>RAM</th><th>ROM</th><th>Price</th></tr></thead><tbody>${rowsHtml}</tbody></table>
      </body></html>`;

    const link = document.createElement("a");
    link.href = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    link.download = `workspace-${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    setDlOpen(false);
    showToast("HTML exported");
  }

  function generateCSV() {
    const header =
      "name,style,gridCols,brand,ram,rom,battery,price,theme,filled\n";
    const body = stickers
      .map((sticker) => {
        const data = sticker.data;
        return `"${data.name}","${sticker.styleKey}","${sticker.gridCols}","${data.brand}","${data.ram}","${data.rom}","${data.battery}","${data.price}","${data.theme}","${data.filled}"`;
      })
      .join("\n");

    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(header + body)}`;
    link.download = `workspace-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setDlOpen(false);
    showToast("CSV exported");
  }

  function renderGridSticker(sticker, gridRow, gridCol, span, rowSpan) {
    const styleMeta = getStyleMeta(sticker.styleKey);

    const handlers = {
      onClick: () => {
        if (!isDragging) openEditSticker(sticker);
      },
      onDoubleClick: () => {
        if (!isDragging) duplicateStickerInGrid(sticker);
      },
      onDelete: () => removeSticker(sticker.id),
      onSave: () => saveStickerToShelf(sticker),
      active: editingId === sticker.id && editorOpen,
      isDragging:
        dragState?.type === "grid" && dragState.stickerId === sticker.id,
      dragOverClass: dragOverId === sticker.id ? "doc" : "",
      onDragStart: (event) => handleGridDragStart(sticker, event),
      onDragEnd: resetDrag,
      onDragOver: (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = dragState?.type === "grid" ? "move" : "copy";
      },
      onDragEnter: (event) => {
        event.preventDefault();
        setDragOverId(sticker.id);
      },
      onDragLeave: () =>
        setDragOverId((current) => (current === sticker.id ? null : current)),
      onDrop: (event) => {
        event.preventDefault();
        handleDropBeforeSticker(sticker.id);
      },
    };

    const posStyle =
      gridRow !== undefined
        ? {
            gridColumn: `${gridCol + 1} / span ${span}`,
            gridRow: `${gridRow + 1} / span ${rowSpan || 1}`,
            minWidth: 0,
          }
        : {
            gridColumn: `span ${clampGridCols(sticker.gridCols)}`,
            gridRow: `span ${clampGridRows(sticker.gridRows)}`,
            minWidth: 0,
          };

    const cardProps = {
      key: sticker.id,
      p: sticker.data,
      font,
      ...handlers,
      "data-cardid": sticker.id,
    };
    return (
      <div key={sticker.id} style={posStyle}>
        {styleMeta.key === "classic" ? (
          <StickerCard {...cardProps} />
        ) : (
          <PriceTagCard {...cardProps} forcedLayout={styleMeta.layout} />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #F7F7F7 0%, #F2F2F2 50%, #F5F5F5 100%)",
        fontFamily: `'${font}', sans-serif`,
      }}
    >
      <AppToolbar
        reservedDrawerSpace={reservedDrawerSpace}
        styleDrawerOpen={styleDrawerOpen}
        templatesCount={templates.length}
        stickersCount={stickers.length}
        page={page}
        totalPages={totalPages}
        dlOpen={dlOpen}
        setDlOpen={setDlOpen}
        onOpenStyles={() => setStyleDrawerOpen(true)}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onOpenCsv={() => setCsvOpen(true)}
        font={font}
        setFont={setFont}
        fonts={FONTS}
        paperSize={paperSize}
        setPaperSize={setPaperSize}
        paperSizes={PAPER_SIZES}
        onGenerateImage={generateImage}
        onGeneratePDF={generatePDF}
        pagesCount={pages.length}
        selectedStyleName={getStyleMeta(selectedStyleKey).name}
        clearConfirm={clearConfirm}
        onClearAll={clearAll}
        icons={{
          cardStack: <IcCardStack s={16} />,
          layers: <IcLayers s={14} />,
          upload: <IcUpload s={14} />,
          chevDown: <IcChevDown s={16} />,
          image: <IcImage s={18} />,
          file: <IcFile s={18} />,
        }}
      />

      <div
        style={{
          padding: "20px 16px 100px",
          width: styleDrawerOpen
            ? `calc(100% - ${reservedDrawerSpace}px)`
            : "100%",
          maxWidth: 980,
          margin: styleDrawerOpen ? "0 auto 0 0" : "0 auto",
          transition:
            "width .2s cubic-bezier(.2,0,0,1), margin .2s cubic-bezier(.2,0,0,1)",
        }}
      >
        <div
          style={{
            background: savedCards.length > 0 ? "#fff" : "transparent",
            border:
              savedCards.length > 0
                ? `1px solid ${M.outlineVar}`
                : `2px dashed rgba(0,0,0,0.12)`,
            borderRadius: 20,
            padding: savedCards.length > 0 ? "14px 16px" : "12px 16px",
            marginBottom: 16,
            boxShadow: savedCards.length > 0 ? M.shadowMd : "none",
            transition: "all .18s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: savedCards.length > 0 ? 12 : 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {savedCards.length > 0 && (
                <div
                  style={{
                    padding: "2px 10px",
                    borderRadius: R.full,
                    background: M.gradient,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Shelf {savedCards.length}
                </div>
              )}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: savedCards.length > 0 ? M.onSurface : M.onSurfaceVar,
                }}
              >
                {savedCards.length > 0
                  ? "Shelf stores mixed styles, mixed data, and mixed grid spans"
                  : "Shelf is empty. Save a sticker here or use the star button on any card."}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {savedCards.length > 0 && (
                <button
                  onClick={() => {
                    setSavedCards([]);
                    showToast("Shelf cleared");
                  }}
                  style={{
                    fontSize: 11,
                    color: M.onSurfaceVar,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShelfPickOpen(true)}
                style={{
                  padding: "7px 12px",
                  borderRadius: R.full,
                  border: `1px solid ${M.outlineVar}`,
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Manage Shelf
              </button>
            </div>
          </div>

          {savedCards.length > 0 && (
            <div
              className="ss"
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {savedCards.map((item) => (
                <ShelfCard
                  key={item.id}
                  s={{ savedId: item.id, ...item.sticker.data }}
                  font={font}
                  onAdd={() => addShelfItemToGrid(item)}
                  onRemove={() => removeShelfItem(item.id)}
                  onDragStart={(event) => handleShelfDragStart(item, event)}
                  onDragEnd={resetDrag}
                  isDragging={
                    dragState?.type === "shelf" && dragState.itemId === item.id
                  }
                  isDropTarget={false}
                />
              ))}
            </div>
          )}
        </div>

        {isDragging && (
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 14,
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(0,0,0,0.04)",
              color: M.onSurface,
              border: `1px solid ${M.outlineVar}`,
            }}
          >
            {dragState?.type === "style"
              ? "Drop the style sample into any grid cell to create a new sticker instance"
              : dragState?.type === "shelf"
                ? "Drop the shelf item into any grid cell to place that saved sticker"
                : "Drop onto a sticker to swap positions, or onto an empty grid cell to place it"}
          </div>
        )}

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <button
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={page === 0}
              style={{
                padding: "7px 20px",
                borderRadius: R.full,
                border: `1.5px solid ${M.outlineVar}`,
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                color: M.primary,
                opacity: page === 0 ? 0.35 : 1,
                fontFamily: "inherit",
                boxShadow: M.shadowSm,
              }}
            >
              Prev
            </button>
            <span
              style={{
                fontSize: 13,
                color: M.onSurfaceVar,
                fontWeight: 600,
                minWidth: 100,
                textAlign: "center",
              }}
            >
              Page {page + 1} / {totalPages}
            </span>
            <button
              onClick={() =>
                setPage((value) => Math.min(totalPages - 1, value + 1))
              }
              disabled={page >= totalPages - 1}
              style={{
                padding: "7px 20px",
                borderRadius: R.full,
                border: `1.5px solid ${M.outlineVar}`,
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                color: M.primary,
                opacity: page >= totalPages - 1 ? 0.35 : 1,
                fontFamily: "inherit",
                boxShadow: M.shadowSm,
              }}
            >
              Next
            </button>
          </div>
        )}

        <div
          style={{
            background: "rgba(0,0,0,0.02)",
            borderRadius: 20,
            padding: "16px 14px",
            border: `1px solid ${M.outlineVar}`,
            boxShadow: M.shadowSm,
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: pagePreviewAspect,
              minHeight: 360,
              maxHeight: 760,
            }}
          >
            {(() => {
              const occupiedSet = new Set();
              const draggingGridStickerId =
                dragState?.type === "grid" ? dragState.stickerId : null;
              currentPlacements.forEach(
                ({ sticker, row, col, span, rowSpan }) => {
                  if (sticker.id === draggingGridStickerId) return;
                  for (let dr = 0; dr < (rowSpan || 1); dr++) {
                    for (let dc = 0; dc < span; dc++)
                      occupiedSet.add(`${row + dr},${col + dc}`);
                  }
                },
              );
              const emptySlots = [];
              const dragSticker = isDragging
                ? getDragStickerForPlacement()
                : null;
              const dragIgnoreIds =
                dragState?.type === "grid" ? [dragState.stickerId] : [];
              for (let r = 0; r < pageRows; r++) {
                for (let c = 0; c < BASE_GRID_COLS; c++) {
                  if (occupiedSet.has(`${r},${c}`)) continue;
                  if (
                    dragSticker &&
                    !resolveDropPlacement(dragSticker, r, c, dragIgnoreIds)
                  )
                    continue;
                  emptySlots.push({ row: r, col: c });
                }
              }
              return (
                <div
                  style={{
                    display: "grid",
                    height: "100%",
                    gridTemplateColumns: `repeat(${BASE_GRID_COLS}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${pageRows}, minmax(0, 1fr))`,
                    gap: 8,
                  }}
                >
                  {currentPlacements.map(
                    ({ sticker, row, col, span, rowSpan }) =>
                      renderGridSticker(sticker, row, col, span, rowSpan),
                  )}
                  {(emptySlots.length > 0
                    ? emptySlots
                    : [{ row: 0, col: 0 }]
                  ).map(({ row, col }) => {
                    const key = `empty_${row}_${col}`;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (!isDragging) openNewSticker(selectedStyleKey);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = dragState?.type === "grid" ? "move" : "copy";
                        }}
                        onDragEnter={(event) => {
                          event.preventDefault();
                          setDragOverId(key);
                        }}
                        onDragLeave={() =>
                          setDragOverId((current) =>
                            current === key ? null : current,
                          )
                        }
                        onDrop={(event) => {
                          event.preventDefault();
                          handleDropAtEmptySlot(row, col);
                        }}
                        className={dragOverId === key ? "doe" : ""}
                        style={{
                          gridColumn: `${col + 1}`,
                          gridRow: `${row + 1}`,
                          border: "2px dashed rgba(0,0,0,0.14)",
                          borderRadius: 14,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(0,0,0,0.2)",
                          fontSize: 22,
                          cursor: "pointer",
                          transition: "all .15s",
                          gap: 4,
                          background: "transparent",
                        }}
                      >
                        <span
                          style={{
                            fontSize: isDragging ? 18 : 24,
                            fontWeight: 300,
                            pointerEvents: "none",
                          }}
                        >
                          {isDragging ? "Drop" : "+"}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            pointerEvents: "none",
                            color:
                              dragOverId === key
                                ? M.primary
                                : "rgba(0,0,0,0.25)",
                          }}
                        >
                          {isDragging ? "drop here" : "new sticker"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 28, right: 24, zIndex: 200 }}>
        <button
          onClick={() => openNewSticker(selectedStyleKey)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "15px 28px",
            background: M.gradient,
            color: "#fff",
            border: "none",
            borderRadius: R.full,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
            fontFamily: `'${font}', sans-serif`,
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
          <span className="fab-label">Add Sticker</span>
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Snack msg={toast} />

      <CsvDialog
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImport={handleCsvImport}
      />
      <TemplatesDialog
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={templates}
        onSave={saveTemplate}
        onLoad={(template) => {
          loadTemplate(template);
          setTemplatesOpen(false);
        }}
        onDelete={deleteTemplate}
        onExportCurrentJson={exportCurrentWorkspaceJson}
        onImportJson={importTemplateJson}
        font={font}
      />
      <ShelfPickDialog
        open={shelfPickOpen}
        onClose={() => setShelfPickOpen(false)}
        savedCards={savedCards}
        font={font}
        onPickShelf={(item) => {
          addShelfItemToGrid(item);
          setShelfPickOpen(false);
        }}
        onNewCreate={() => openNewSticker(selectedStyleKey)}
        onRemoveShelf={removeShelfItem}
        onExportJson={exportShelfJson}
        onImportJson={importShelfJson}
      />

      {styleDrawerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: STYLE_DRAWER_WIDTH,
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
            pointerEvents: "none",
          }}
        >
          <div
            className="style-drawer"
            onClick={(event) => event.stopPropagation()}
            onDragOver={(event) => {
              if (!dragState || dragState.type !== "grid") return;
              event.preventDefault();
              setDragOverStyleDrawer(true);
            }}
            onDragLeave={() => setDragOverStyleDrawer(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOverStyleDrawer(false);
              if (dragState?.type !== "grid") return;
              const source = stickers.find(
                (sticker) => sticker.id === dragState.stickerId,
              );
              if (!source) return;
              setSelectedStyleKey(source.styleKey);
              showToast(
                `Selected ${getStyleMeta(source.styleKey).name} as the active style`,
              );
              resetDrag();
            }}
            style={{
              pointerEvents: "auto",
              background: "#fff",
              width: "100%",
              height: "100vh",
              overflowY: "auto",
              paddingBottom: 32,
              boxShadow: "-24px 0 60px rgba(0,0,0,0.12)",
              borderLeft: `1px solid ${M.outlineVar}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "22px 22px 16px",
                borderBottom: `1px solid ${M.outlineVar}`,
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 20, fontWeight: 800, color: M.onSurface }}
                >
                  Sticker Styles
                </div>
                <div
                  style={{ fontSize: 13, color: M.onSurfaceVar, marginTop: 3 }}
                >
                  Drag a sample into the grid or click to create with that style
                </div>
              </div>
              <button
                onClick={() => setStyleDrawerOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: M.s3,
                  color: M.onSurface,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                x
              </button>
            </div>

            <div style={{ padding: "14px 18px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 14,
                  background: dragOverStyleDrawer ? "rgba(0,0,0,0.04)" : M.s2,
                  border: `1px solid ${dragOverStyleDrawer ? M.primary : M.outlineVar}`,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{ fontSize: 12, fontWeight: 700, color: M.onSurface }}
                >
                  Active create style
                </div>
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: R.full,
                    background: "#fff",
                    border: `1px solid ${M.outlineVar}`,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {getStyleMeta(selectedStyleKey).name}
                </div>
                <div style={{ fontSize: 11, color: M.onSurfaceVar }}>
                  Page grid: fixed {BASE_GRID_COLS} columns
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                padding: "0 18px",
              }}
            >
              {STYLE_CATALOG.map((style) => (
                <StyleSample
                  key={style.key}
                  styleKey={style.key}
                  font={font}
                  onCreate={() => {
                    setSelectedStyleKey(style.key);
                    openNewSticker(style.key);
                  }}
                  onDragStart={(event) =>
                    handleStyleDragStart(style.key, event)
                  }
                  onDragEnd={resetDrag}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <StickerEditorModal
        open={editorOpen}
        editingId={editingId}
        formStyleKey={formStyleKey}
        setFormStyleKey={setFormStyleKey}
        formGridCols={formGridCols}
        setFormGridCols={setFormGridCols}
        formGridRows={formGridRows}
        setFormGridRows={setFormGridRows}
        formData={formData}
        setFormData={setFormData}
        addToShelf={addToShelf}
        setAddToShelf={setAddToShelf}
        font={font}
        canSave={canSave}
        pageRows={pageRows}
        onClose={closeEditor}
        onSave={saveEditor}
        previewCardProps={PREVIEW_CARD_PROPS}
      />

      {previewImg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0,0,0,0.6)",
            }}
          >
            <div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
                {previewImg.label} | Page {previewImg.page}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Long-press the image to save it on mobile.
              </div>
            </div>
            <button
              onClick={() => setPreviewImg(null)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              x
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "12px 0",
            }}
          >
            <img
              src={previewImg.src}
              alt="Sticker page"
              style={{
                width: "100%",
                maxWidth: 640,
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
