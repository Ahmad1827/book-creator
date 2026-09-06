import React, { useState } from "react";

export type ToolId =
  | "select"
  | "pencil"
  | "brush"
  | "wand"
  | "palette"
  | "shapes"
  | "stickers"
  | "arrange";

export type ShapeType =
  | "star"
  | "heart"
  | "cloud"
  | "speech"
  | "thought"
  | "moon"
  | "flower"
  | "banner"
  | "circle"
  | "rect";

export type BrushSubtype = "ink" | "watercolor" | "marker" | "crayon" | "eraser";
export type WandSubtype = "stardust" | "fairydust" | "firefly" | "rainbow";

interface DrawingToolboxProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  // Brush & Pencil
  brushSubtype: BrushSubtype;
  onSetBrushSubtype: (type: BrushSubtype) => void;
  wandSubtype: WandSubtype;
  onSetWandSubtype: (type: WandSubtype) => void;
  brushSize: number;
  onSetBrushSize: (size: number) => void;
  brushColor: string;
  onSetBrushColor: (color: string) => void;
  brushOpacity: number;
  onSetBrushOpacity: (opacity: number) => void;
  // Shapes
  shapeFill: string;
  onSetShapeFill: (color: string) => void;
  shapeStroke: string;
  onSetShapeStroke: (color: string) => void;
  shapeStrokeWidth: number;
  onSetShapeStrokeWidth: (w: number) => void;
  onAddShape: (type: ShapeType) => void;
  // Stickers
  onAddSticker: (stk: string) => void;
  // Arrange
  hasSelection: boolean;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const PALETTE_COLLECTIONS = [
  {
    name: "Cozy Café",
    colors: ["#2c211a", "#4d3a2e", "#8b6d5c", "#c68b59", "#dda15e", "#faf5ec"],
  },
  {
    name: "Mossy Forest",
    colors: ["#1c291e", "#3a5a40", "#588157", "#819b7a", "#a3b18a", "#dad7cd"],
  },
  {
    name: "Sweet Macaron",
    colors: ["#e07a5f", "#f4a261", "#e76f51", "#f7cad0", "#ffb3c6", "#ffffff"],
  },
  {
    name: "Midnight Sky",
    colors: ["#0f172a", "#1e293b", "#3d5a80", "#847596", "#9d4edd", "#f3f5fa"],
  },
];

const STICKER_PACKS = {
  animals: ["🦊", "🐻", "🐰", "🦉", "🐱", "🐶", "🦆", "🐿️", "🦔", "🐸", "🦌", "🐝"],
  nature: ["🌲", "🌸", "🍄", "🍃", "🌈", "🌻", "🍂", "☀️", "🌙", "⭐", "💧", "🪴"],
  fantasy: ["👑", "🏰", "🦄", "🪄", "🔮", "🗡️", "🧝", "🧚", "✨", "📜", "🗝️", "💎"],
  cozy: ["☕", "🧁", "🍎", "🥞", "🍪", "🥐", "🧺", "🧸", "🎈", "🧶", "📖", "🕯️"],
};

export const DrawingToolbox: React.FC<DrawingToolboxProps> = ({
  activeTool,
  onSelectTool,
  isDrawerOpen,
  onToggleDrawer,
  brushSubtype,
  onSetBrushSubtype,
  wandSubtype,
  onSetWandSubtype,
  brushSize,
  onSetBrushSize,
  brushColor,
  onSetBrushColor,
  brushOpacity,
  onSetBrushOpacity,
  shapeFill,
  onSetShapeFill,
  shapeStroke,
  onSetShapeStroke,
  shapeStrokeWidth,
  onSetShapeStrokeWidth,
  onAddShape,
  onAddSticker,
  hasSelection,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
}) => {
  const [stickerCategory, setStickerCategory] = useState<keyof typeof STICKER_PACKS>("animals");

  const handleToolClick = (tool: ToolId) => {
    if (activeTool === tool && isDrawerOpen) {
      onToggleDrawer();
    } else {
      onSelectTool(tool);
      if (!isDrawerOpen) onToggleDrawer();
    }
  };

  return (
    <aside className="lofi-dual-toolbox">
      {/* 1. SLIM ICON RAIL */}
      <div className="toolbox-icon-rail">
        {/* SELECT */}
        <button
          className={`rail-icon-btn ${activeTool === "select" ? "active" : ""}`}
          onClick={() => handleToolClick("select")}
          data-tooltip="Select & Move (V)"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M4 2l6 17 3-5 5 7 2-1-5-7 7-2z" fill="currentColor" />
          </svg>
        </button>

        {/* PENCIL */}
        <button
          className={`rail-icon-btn ${activeTool === "pencil" ? "active" : ""}`}
          onClick={() => handleToolClick("pencil")}
          data-tooltip="Sketch Pencil (P)"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
          </svg>
        </button>

        {/* BRUSH */}
        <button
          className={`rail-icon-btn ${activeTool === "brush" ? "active" : ""}`}
          onClick={() => handleToolClick("brush")}
          data-tooltip="Artist Brushes (B)"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.71a1 1 0 0 0-1.42 0l-9.05 9.06 2.83 2.83 9.06-9.06a1 1 0 0 0 0-1.41l-1.42-1.42z" fill="currentColor" />
          </svg>
        </button>

        {/* MAGIC WAND */}
        <button
          className={`rail-icon-btn ${activeTool === "wand" ? "active" : ""}`}
          onClick={() => handleToolClick("wand")}
          data-tooltip="Magic Wand & Sparkle Ink"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35z" fill="currentColor" />
          </svg>
        </button>

        {/* MASTER PALETTE */}
        <button
          className={`rail-icon-btn ${activeTool === "palette" ? "active" : ""}`}
          onClick={() => handleToolClick("palette")}
          data-tooltip="Master Color Room"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19A1 1 0 0 0 5.2 20.5c1.88 0 3.32-.97 4.14-2.07.82.37 1.73.57 2.66.57 4.97 0 9-4.03 9-9s-4.03-9-9-9zm-5.5 8c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor" />
          </svg>
        </button>

        {/* SHAPES */}
        <button
          className={`rail-icon-btn ${activeTool === "shapes" ? "active" : ""}`}
          onClick={() => handleToolClick("shapes")}
          data-tooltip="Storybook Shapes"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M12 2l4.5 9h-9zM3 13.5h7v7H3zm11 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="currentColor" />
          </svg>
        </button>

        {/* STICKERS */}
        <button
          className={`rail-icon-btn ${activeTool === "stickers" ? "active" : ""}`}
          onClick={() => handleToolClick("stickers")}
          data-tooltip="Stickers & Story Stamps"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor" />
          </svg>
        </button>

        {/* ARRANGE / LAYERS */}
        <button
          className={`rail-icon-btn ${activeTool === "arrange" ? "active" : ""}`}
          onClick={() => handleToolClick("arrange")}
          data-tooltip="Layers & Arrangement"
        >
          <svg viewBox="0 0 24 24" className="rail-svg">
            <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9.07l-9-7-9 7 1.63 1.27L12 16z" fill="currentColor" />
          </svg>
        </button>

        <div className="rail-spacer" />

        {/* DRAWER TOGGLER */}
        <button
          className="rail-icon-btn toggle-arrow"
          onClick={onToggleDrawer}
          data-tooltip={isDrawerOpen ? "Collapse Panel" : "Expand Panel"}
        >
          {isDrawerOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* 2. EXPANDABLE DRAWER PANEL */}
      {isDrawerOpen && (
        <div className="toolbox-flyout-drawer">
          <div className="drawer-header">
            <span className="drawer-title">
              {activeTool === "select" && "Selection & Transform"}
              {activeTool === "pencil" && "Sketchbook Pencil"}
              {activeTool === "brush" && "Brushes & Mediums"}
              {activeTool === "wand" && "Magic Wand & Sparkles"}
              {activeTool === "palette" && "Color Studio"}
              {activeTool === "shapes" && "Storybook Geometry"}
              {activeTool === "stickers" && "Story Stamps"}
              {activeTool === "arrange" && "Layer Stack & Actions"}
            </span>
            <button className="drawer-close-btn" onClick={onToggleDrawer}>✕</button>
          </div>

          <div className="drawer-body">
            {/* PENCIL PANEL */}
            {activeTool === "pencil" && (
              <div className="drawer-section">
                <span className="drawer-label">Graphite Grade</span>
                <div className="pencil-grade-row">
                  {[
                    { label: "HB", size: 2, alpha: 0.7, color: "#3a3430" },
                    { label: "2B", size: 3, alpha: 0.85, color: "#282320" },
                    { label: "4B", size: 5, alpha: 0.95, color: "#171412" },
                    { label: "Sepia", size: 3, alpha: 0.85, color: "#593c28" },
                  ].map((lead) => (
                    <button
                      key={lead.label}
                      className={`pill-chip-btn ${brushColor === lead.color && brushSize === lead.size ? "active" : ""}`}
                      onClick={() => {
                        onSetBrushColor(lead.color);
                        onSetBrushSize(lead.size);
                        onSetBrushOpacity(lead.alpha);
                      }}
                    >
                      {lead.label}
                    </button>
                  ))}
                </div>

                <div className="drawer-slider-row">
                  <div className="slider-label-meta">
                    <span>Fine Thickness</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="18"
                    value={brushSize}
                    onChange={(e) => onSetBrushSize(Number(e.target.value))}
                    className="lofi-warm-slider full-width"
                  />
                </div>
              </div>
            )}

            {/* BRUSHES PANEL */}
            {activeTool === "brush" && (
              <div className="drawer-section">
                <span className="drawer-label">Brush Technique</span>
                <div className="brush-cards-grid">
                  {[
                    { id: "ink", icon: "✒️", name: "Fountain Pen", desc: "Crisp Story Linework" },
                    { id: "watercolor", icon: "🖌️", name: "Watercolor Wash", desc: "Soft Transparent" },
                    { id: "marker", icon: "🖍️", name: "Felt Marker", desc: "Bold Rich Fill" },
                    { id: "crayon", icon: "✏️", name: "Wax Crayon", desc: "Granular Texture" },
                    { id: "eraser", icon: "🧹", name: "Eraser", desc: "Cutout Rubber" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      className={`brush-type-btn ${brushSubtype === b.id ? "active" : ""}`}
                      onClick={() => onSetBrushSubtype(b.id as BrushSubtype)}
                    >
                      <span className="brush-icon">{b.icon}</span>
                      <div className="brush-info">
                        <span className="name">{b.name}</span>
                        <span className="desc">{b.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="drawer-slider-row">
                  <div className="slider-label-meta">
                    <span>Brush Width</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="60"
                    value={brushSize}
                    onChange={(e) => onSetBrushSize(Number(e.target.value))}
                    className="lofi-warm-slider full-width"
                  />
                </div>

                {brushSubtype !== "eraser" && (
                  <div className="drawer-slider-row">
                    <div className="slider-label-meta">
                      <span>Ink Opacity</span>
                      <span>{Math.round(brushOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={brushOpacity}
                      onChange={(e) => onSetBrushOpacity(Number(e.target.value))}
                      className="lofi-warm-slider full-width"
                    />
                  </div>
                )}
              </div>
            )}

            {/* MAGIC WAND PANEL */}
            {activeTool === "wand" && (
              <div className="drawer-section">
                <span className="drawer-label">Enchanted Story Inks</span>
                <div className="wand-cards-grid">
                  {[
                    { id: "stardust", icon: "✨", name: "Golden Stardust", color: "#f59e0b", desc: "Glowing amber trail" },
                    { id: "fairydust", icon: "🌸", name: "Fairy Blossom", color: "#f472b6", desc: "Soft magical pastel" },
                    { id: "firefly", icon: "🟢", name: "Forest Firefly", color: "#4ade80", desc: "Luminous moss sheen" },
                    { id: "rainbow", icon: "🌈", name: "Prism Trail", color: "#38bdf8", desc: "Dreamy azure starlight" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      className={`wand-card ${wandSubtype === w.id ? "active" : ""}`}
                      onClick={() => {
                        onSetWandSubtype(w.id as WandSubtype);
                        onSetBrushColor(w.color);
                        onSetBrushSize(8);
                      }}
                    >
                      <span className="wand-icon">{w.icon}</span>
                      <div className="wand-info">
                        <span className="title" style={{ color: w.color }}>{w.name}</span>
                        <span className="desc">{w.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MASTER PALETTE ROOM */}
            {(activeTool === "palette" || activeTool === "brush" || activeTool === "pencil") && (
              <div className="drawer-section">
                <span className="drawer-label">Curated Color Palettes</span>
                {PALETTE_COLLECTIONS.map((col) => (
                  <div key={col.name} className="palette-collection-block">
                    <span className="collection-title">{col.name}</span>
                    <div className="collection-swatches">
                      {col.colors.map((c) => (
                        <button
                          key={c}
                          className={`palette-swatch-circle ${brushColor === c ? "active" : ""}`}
                          style={{ backgroundColor: c }}
                          onClick={() => onSetBrushColor(c)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="custom-picker-row">
                  <span className="drawer-label">Custom Eye Picker</span>
                  <input
                    type="color"
                    className="custom-color-input"
                    value={brushColor.startsWith("#") ? brushColor : "#c68b59"}
                    onChange={(e) => onSetBrushColor(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* SHAPES PANEL */}
            {activeTool === "shapes" && (
              <div className="drawer-section">
                <span className="drawer-label">Picturebook Shapes</span>
                <div className="story-shapes-matrix">
                  {[
                    { id: "star", label: "Star", icon: "⭐" },
                    { id: "heart", label: "Heart", icon: "💖" },
                    { id: "cloud", label: "Cloud", icon: "☁️" },
                    { id: "moon", label: "Crescent", icon: "🌙" },
                    { id: "flower", label: "Petal", icon: "🌸" },
                    { id: "speech", label: "Speech", icon: "💬" },
                    { id: "thought", label: "Dream", icon: "💭" },
                    { id: "banner", label: "Banner", icon: "🏷️" },
                    { id: "circle", label: "Round", icon: "⭕" },
                    { id: "rect", label: "Frame", icon: "🔲" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      className="story-shape-card"
                      onClick={() => onAddShape(s.id as ShapeType)}
                    >
                      <span className="shape-stamp">{s.icon}</span>
                      <span className="shape-tag">{s.label}</span>
                    </button>
                  ))}
                </div>

                <div className="drawer-section compact">
                  <span className="drawer-label">Shape Fill Pigment</span>
                  <div className="swatch-inline-row">
                    {PALETTE_COLLECTIONS[0].colors.concat(PALETTE_COLLECTIONS[1].colors.slice(0, 4)).map((c) => (
                      <button
                        key={`fill-${c}`}
                        className={`palette-swatch-circle ${shapeFill === c ? "active" : ""}`}
                        style={{ backgroundColor: c }}
                        onClick={() => onSetShapeFill(c)}
                      />
                    ))}
                  </div>

                  <span className="drawer-label">Border Contour</span>
                  <div className="swatch-inline-row">
                    {PALETTE_COLLECTIONS[0].colors.map((c) => (
                      <button
                        key={`stroke-${c}`}
                        className={`palette-swatch-circle ${shapeStroke === c ? "active" : ""}`}
                        style={{ backgroundColor: c }}
                        onClick={() => onSetShapeStroke(c)}
                      />
                    ))}
                  </div>

                  <div className="drawer-slider-row">
                    <div className="slider-label-meta">
                      <span>Border Thickness</span>
                      <span>{shapeStrokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={shapeStrokeWidth}
                      onChange={(e) => onSetShapeStrokeWidth(Number(e.target.value))}
                      className="lofi-warm-slider full-width"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STICKERS PANEL */}
            {activeTool === "stickers" && (
              <div className="drawer-section">
                <div className="sticker-category-tabs">
                  {(["animals", "nature", "fantasy", "cozy"] as const).map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill ${stickerCategory === cat ? "active" : ""}`}
                      onClick={() => setStickerCategory(cat)}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="stickers-tray-grid">
                  {STICKER_PACKS[stickerCategory].map((emoji) => (
                    <button
                      key={emoji}
                      className="sticker-card-btn"
                      onClick={() => onAddSticker(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ARRANGE / LAYERS PANEL */}
            {(activeTool === "arrange" || activeTool === "select") && (
              <div className="drawer-section">
                <span className="drawer-label">Element Layering</span>
                <div className="arrange-action-grid">
                  <button
                    className="action-pill-btn"
                    disabled={!hasSelection}
                    onClick={onBringForward}
                  >
                    Bring to Front
                  </button>
                  <button
                    className="action-pill-btn"
                    disabled={!hasSelection}
                    onClick={onSendBackward}
                  >
                    Send to Back
                  </button>
                  <button
                    className="action-pill-btn"
                    disabled={!hasSelection}
                    onClick={onDuplicate}
                  >
                    Duplicate Item
                  </button>
                  <button
                    className="action-pill-btn danger"
                    disabled={!hasSelection}
                    onClick={onDelete}
                  >
                    Delete (Del)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};