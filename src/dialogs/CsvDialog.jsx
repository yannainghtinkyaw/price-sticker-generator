import { useState, useEffect, useRef } from 'react';
import { M, R } from '../lib/constants.js';
import { parseCsv, autoMap } from '../lib/csv.js';
import Btn from '../components/Btn.jsx';

export default function CsvDialog({ open, onClose, onImport }) {
  const [stage,    setStage]   = useState('upload');
  const [headers,  setHeaders] = useState([]);
  const [rows,     setRows]    = useState([]);
  const [mapping,  setMapping] = useState({});
  const [dragOver, setDragOver]= useState(false);
  const [mode,     setMode]    = useState('append');
  const [err,      setErr]     = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (!open) { setStage('upload'); setHeaders([]); setRows([]); setErr(''); }
  }, [open]);

  function handleFile(file) {
    if (!file || !file.name.match(/\.(csv|txt)$/i)) { setErr('Please upload a .csv file'); return; }
    const r = new FileReader();
    r.onload = e => {
      const { headers: h, rows: rr } = parseCsv(e.target.result);
      if (!h.length || !rr.length) { setErr('No data found in file'); return; }
      setHeaders(h); setRows(rr); setMapping(autoMap(h)); setErr(''); setStage('preview');
    };
    r.readAsText(file);
  }

  const getVal   = (r, field) => { const idx = mapping[field]; const key = idx >= 0 ? headers[idx] : null; return key ? (r[key] || '—') : '—'; };
  const validRows = rows.filter(r => getVal(r, 'name') !== '—' && getVal(r, 'price') !== '—');

  function doImport() {
    const items = rows.map(r => {
      const obj = { theme: 0, filled: false, id: Date.now() + (Math.random() * 10000 | 0) };
      ['name', 'ram', 'rom', 'battery', 'price'].forEach(f => {
        const idx = mapping[f]; const key = idx >= 0 ? headers[idx] : null;
        obj[f] = key ? (r[key] || '') : '';
      });
      return obj;
    }).filter(o => o.name && o.price);
    onImport(items, mode); onClose();
  }

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.52)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, backdropFilter: 'blur(5px)',
    }}>
      <div style={{
        background: M.s1, borderRadius: R.xl,
        width: '100%', maxWidth: 520,
        boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ padding: '22px 24px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 400, color: M.onSurface, marginBottom: 3 }}>📥 Import from CSV</div>
          <div style={{ fontSize: 13, color: M.onSurfaceVar, marginBottom: 18, lineHeight: 1.5 }}>
            {stage === 'upload'
              ? 'Upload a CSV file with product data.'
              : `Found ${rows.length} rows · ${validRows.length} valid (name & price required)`}
          </div>
        </div>

        <div style={{ padding: '0 24px 22px' }}>
          {stage === 'upload' ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? M.primary : M.outlineVar}`,
                  borderRadius: R.lg, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? `${M.primary}0D` : M.s2,
                  transition: 'all 0.15s', marginBottom: 16,
                }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: M.onSurface, marginBottom: 4 }}>
                  {dragOver ? 'Release to upload' : 'Click or drag & drop CSV'}
                </div>
                <div style={{ fontSize: 12, color: M.onSurfaceVar }}>UTF-8 · .csv or .txt</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />

              {/* Format hint */}
              <div style={{ background: M.s2, borderRadius: R.md, padding: '12px 16px', marginBottom: 12, border: `1px solid ${M.outlineVar}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
                  Expected Format
                </div>
                <code style={{ fontSize: 11.5, color: M.onSurface, fontFamily: 'monospace', lineHeight: 1.9, display: 'block' }}>
                  name,ram,rom,battery,price<br />
                  Samsung Galaxy A55 5G,8,256,5000,9990<br />
                  Redmi Note 15 5G,8,256,5520,8490
                </code>
                <div style={{ fontSize: 11, color: M.onSurfaceVar, marginTop: 8 }}>
                  Also supported: <b>ชื่อ</b>, <b>ราคา</b>, <b>แรม</b> (Thai column names) · theme & filled columns optional
                </div>
              </div>
              {err && (
                <div style={{ color: M.onErrorContainer, background: M.errorContainer, padding: '10px 14px', borderRadius: R.sm, fontSize: 13, marginBottom: 4 }}>
                  {err}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Column mapping */}
              <div style={{ background: M.s2, borderRadius: R.md, padding: '14px 16px', marginBottom: 14, border: `1px solid ${M.outlineVar}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
                  Column Mapping
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {['name', 'ram', 'rom', 'battery', 'price'].map(field => (
                    <div key={field}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'capitalize',
                        color: (field === 'name' || field === 'price') ? M.primary : M.onSurfaceVar,
                      }}>
                        {field}{(field === 'name' || field === 'price') ? ' *' : ''}
                      </div>
                      <select
                        value={mapping[field] ?? -1}
                        onChange={e => setMapping(m => ({ ...m, [field]: Number(e.target.value) }))}
                        style={{
                          width: '100%', padding: '7px 10px', borderRadius: R.xs,
                          border: `1px solid ${M.outline}`, background: M.s0, color: M.onSurface,
                          fontSize: 12, fontFamily: 'inherit', outline: 'none',
                        }}>
                        <option value={-1}>— skip —</option>
                        {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview table */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: M.onSurfaceVar, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
                  Preview (first 5 rows)
                </div>
                <div style={{ overflowX: 'auto', borderRadius: R.sm, border: `1px solid ${M.outlineVar}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'inherit' }}>
                    <thead>
                      <tr style={{ background: M.s3 }}>
                        {['name', 'ram', 'rom', 'battery', 'price'].map(f => (
                          <th key={f} style={{
                            padding: '8px 10px', textAlign: 'left', color: M.onSurfaceVar,
                            fontWeight: 600, textTransform: 'capitalize',
                            borderBottom: `1px solid ${M.outlineVar}`, fontSize: 11,
                          }}>{f}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 5).map((r, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : M.s2 }}>
                          {['name', 'ram', 'rom', 'battery', 'price'].map(f => (
                            <td key={f} style={{
                              padding: '7px 10px',
                              color: getVal(r, f) === '—' ? M.outline : M.onSurface,
                              borderBottom: `1px solid ${M.outlineVar}66`, fontSize: 12,
                            }}>{getVal(r, f)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import mode */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'append', label: '➕ Append to grid' }, { v: 'replace', label: '🔄 Replace all' }].map(opt => (
                  <div key={opt.v} onClick={() => setMode(opt.v)} style={{
                    flex: 1, padding: '10px 12px', borderRadius: R.md, textAlign: 'center',
                    border: `1.5px solid ${mode === opt.v ? M.primary : M.outlineVar}`,
                    background: mode === opt.v ? `${M.primary}12` : 'transparent',
                    color: mode === opt.v ? M.primary : M.onSurfaceVar,
                    fontSize: 12, fontWeight: mode === opt.v ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.13s',
                  }}>{opt.label}</div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'flex-end',
          padding: '0 24px 22px',
          borderTop: `1px solid ${M.outlineVar}`, paddingTop: 16, marginTop: 4,
        }}>
          {stage === 'preview' && <Btn variant="text" label="↩ Back" onClick={() => setStage('upload')} />}
          <Btn variant="text" label="Cancel" onClick={onClose} />
          {stage === 'preview' && (
            <Btn
              variant="filled"
              label={`Import ${validRows.length} Products`}
              onClick={doImport}
              disabled={validRows.length === 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
