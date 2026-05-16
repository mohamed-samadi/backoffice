
import { useState , useEffect } from "react";
import styles from "./ImageViewer.module.css";

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ZoomInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const ZoomOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const RotateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function ImageViewer({ src, alt = "Image", onClose }) {
  // ── State ────────────────────────────────────────────────────────────────
  const [scale,   setScale]   = useState(1);
  const [rotate,  setRotate]  = useState(0);
  const [pos,     setPos]     = useState({ x: 0, y: 0 });
  const [dragging,setDragging]= useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ── Escape + scroll lock ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // ── Zoom molette ──────────────────────────────────────────────────────────
  const handleWheel = (e) => {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(0.5, s - e.deltaY * 0.001)));
  };

  // ── Drag ──────────────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  // ── Actions ───────────────────────────────────────────────────────────────
  const zoomIn    = () => setScale((s) => Math.min(5, s + 0.25));
  const zoomOut   = () => setScale((s) => Math.max(0.5, s - 0.25));
  const rotateCw  = () => setRotate((r) => r + 90);
  const reset     = () => { setScale(1); setRotate(0); setPos({ x: 0, y: 0 }); };

  const download  = () => {
    const a = document.createElement("a");
    a.href     = src;
    a.download = alt;
    a.click();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>{alt}</span>
        <div className={styles.toolbarActions}>
          <button className={styles.toolBtn} onClick={zoomOut}    title="Zoom arrière"><ZoomOutIcon /></button>
          <span className={styles.zoomLabel}>{Math.round(scale * 100)}%</span>
          <button className={styles.toolBtn} onClick={zoomIn}     title="Zoom avant"><ZoomInIcon /></button>
          <button className={styles.toolBtn} onClick={rotateCw}   title="Pivoter"><RotateIcon /></button>
          <button className={styles.toolBtn} onClick={download}   title="Télécharger"><DownloadIcon /></button>
          <button className={styles.toolBtn} onClick={reset}      title="Réinitialiser">
            <span style={{ fontSize: 12, fontWeight: 700 }}>1:1</span>
          </button>
          <div className={styles.separator} />
          <button className={`${styles.toolBtn} ${styles.toolBtnClose}`} onClick={onClose} title="Fermer">
            <XIcon />
          </button>
        </div>
      </div>

      {/* ── Canvas image ─────────────────────────────────────────────────── */}
      <div
        className={`${styles.canvas} ${dragging ? styles.canvasDragging : ""}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={src}
          alt={alt}
          className={styles.image}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotate}deg)`,
          }}
          draggable={false}
        />
      </div>

      {/* ── Hint bas ─────────────────────────────────────────────────────── */}
      <div className={styles.hint}>
        Molette pour zoomer · Cliquer-glisser pour déplacer · Échap pour fermer
      </div>
    </div>
  );
}

