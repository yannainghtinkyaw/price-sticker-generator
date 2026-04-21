# 🏷️ Price Tag Studio

A Material Design 3 price-tag / sticker generator for electronics retail — built with React + Vite.

## Features

- **Add & edit** product stickers (name, RAM, ROM, battery, price)
- **7 colour themes** (Gold, Blue, Red, Onyx, Teal, Purple, Amber) × Outline / Filled styles
- **11 Google Fonts** — Kanit, Prompt, Mitr, Sarabun, Noto Sans Thai, Inter, Poppins, Roboto, Nunito, Outfit, Sora
- **Drag-and-drop** reorder / duplicate — mouse and touch supported
- **Shelf** — save favourite cards, drag to grid, persist across sessions (storage API)
- **CSV import** — auto-maps Thai & English column names, append or replace
- **Export** — PNG (high-res), PDF (browser print), HTML document, CSV spreadsheet
- **Paper sizes** — A3, A4, A5, Letter, B4, B5 at 200 DPI
- **Pagination** — 15 stickers per page

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── main.jsx              Entry point
├── App.jsx               Root application component
├── styles.css            Global CSS (animations, drag classes)
├── lib/
│   ├── constants.js      M3 tokens, themes, fonts, paper sizes, defaults
│   ├── csv.js            parseCsv, autoMap utilities
│   └── canvas.js         rrect, drawSticker helpers
├── components/
│   ├── Btn.jsx           M3 Button (filled / tonal / outlined / text / error)
│   ├── Chip.jsx          Filter chip
│   ├── SegBtn.jsx        Segmented button
│   ├── Switch.jsx        M3 Switch toggle
│   ├── Field.jsx         Floating-label text input
│   ├── Snack.jsx         Snackbar notification
│   ├── StyleToggle.jsx   Outline ↔ Filled style picker
│   ├── ShelfCard.jsx     Compact shelf card (horizontal scroll)
│   └── StickerCard.jsx   Full sticker card in the grid
└── dialogs/
    ├── ShelfPickDialog.jsx  Bottom-sheet: add from shelf / create new
    └── CsvDialog.jsx        CSV upload + column mapping + import
```

## CSV Format

```csv
name,ram,rom,battery,price
Samsung Galaxy A55 5G,8,256,5000,9990
Redmi Note 15 5G,8,256,5520,8490
```

Thai column names (`ชื่อ`, `ราคา`, `แรม`, `แบต`, `พื้นที่`) are also supported.  
Optional columns: `theme` (0–6), `filled` (true/false).

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build
```
