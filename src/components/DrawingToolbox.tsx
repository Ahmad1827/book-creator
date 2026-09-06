import React, { useState } from "react";
import { LOFI_PALETTE } from "../constants";

export type BrushType = "pen" | "crayon" | "watercolor" | "eraser";
export type ShapeType = "rect" | "circle" | "star" | "heart" | "cloud" | "speech";

interface DrawingToolboxProps {
  mode: "select" | "draw" | "pan";
  onSetMode: (mode: "select" | "draw" | "pan") => void;
  brushType: BrushType;
  onSetBrushType: (type: BrushType) => void;
  brushSize: number;
  onSetBrushSize: (size: number) => void;
  brushColor: string;
  onSetBrushColor: (color: string) => void;
  shapeFill: string;
  onSetShapeFill: (color: string) => void;
  shapeStroke: string;
  onSetShapeStroke: (color: string) => void;
  onAddShape: (type: ShapeType) => void;
  onAddSticker: (sticker: string) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  hasSelection: boolean;
}

const STORY_STICKERS = [
  "✨", "⭐", "🌙", "☀️", "☁️", "🌸", 
  "🌲", "🍄", "🐾", "👑", "🎈", "🦉", 
  "🦊", "🐰", "🍎", "🧁", "⛵", "🏰"
];

export const DrawingToolbox: React.FC<DrawingToolboxProps> = ({
  mode,
  onSetMode,
  brushType,
  onSetBrushType,
  brushSize,
  onSetBrushSize,
  brushColor,
  onSetBrushColor,
  shapeFill,
  onSetShapeFill,
  shapeStroke,
  onSetShapeStroke,
  onAddShape,
  onAddSticker,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
  hasSelection,
}) => {
  const [activeTab, setActiveTab] = useState<"brushes" | "shapes" | "stickers">("brushes");

  return (
    <aside className="lofi-left-toolbox">
      <div className="toolbox-tab-nav">
        <button
          className={`tab-btn ${activeTab === "brushes" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("brushes");
            onSetMode("draw");
          }}
        >
          Brushes
        </button>
        <button
          className={`tab-btn ${activeTab === "shapes" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("shapes");
            onSetMode("select");
          }}
        >
          Shapes
        </button>
        <button
          className={`tab-btn ${activeTab === "stickers" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("stickers");
            onSetMode("select");
          }}
        >
          Stickers
        </button>
      </div>

      <div className="toolbox-scroll-content">
        {activeTab === "brushes" && (
          <div className="toolbox-section">
            <span className="toolbox-heading">Brush Medium</span>
            <div className="brush-grid">
              <button
                className={`brush-type-card ${brushType === "pen" && mode === "draw" ? "active" : ""}`}
                onClick={() => {
                  onSetBrushType("pen");
                  onSetMode("draw");
                }}
              >
                <span className="brush-icon">✒️</span>
                <span className="brush-title">Ink Pen</span>
                <span className="brush-sub">Crisp Story Lines</span>
              </button>

              <button
                className={`brush-type-card ${brushType === "crayon" && mode === "draw" ? "active" : ""}`}
                onClick={() => {
                  onSetBrushType("crayon");
                  onSetMode("draw");
                }}
              >
                <span className="brush-icon">🖍️</span>
                <span className="brush-title">Soft Crayon</span>
                <span className="brush-sub">Pencil Texture</span>
              </button>

              <button
                className={`brush-type-card ${brushType === "watercolor" && mode === "draw" ? "active" : ""}`}
                onClick={() => {
                  onSetBrushType("watercolor");
                  onSetMode("draw");
                }}
              >
                <span className="brush-icon">🖌️</span>
                <span className="brush-title">Wash Brush</span>
                <span className="brush-sub">Semi-Transparent</span>
              </button>

              <button
                className={`brush-type-card ${brushType === "eraser" && mode === "draw" ? "active" : ""}`}
                onClick={() => {
                  onSetBrushType("eraser");
                  onSetMode("draw");
                }}
              >
                <span className="brush-icon">🧹</span>
                <span className="brush-title">Eraser</span>
                <span className="brush-sub">Clean Edits</span>
              </button>
            </div>

            <div className="control-slider-group">
              <div className="slider-meta">
                <span>Stroke Weight</span>
                <span>{brushSize}px</span>
              </div>
              <input
                type="range"
                className="lofi-warm-slider full-width"
                min="2"
                max="60"
                value={brushSize}
                onChange={(e) => onSetBrushSize(Number(e.target.value))}
              />
            </div>

            {brushType !== "eraser" && (
              <div className="control-palette-group">
                <span className="toolbox-heading">Ink Pigment</span>
                <div className="palette-swatch-box">
                  {LOFI_PALETTE.map((c) => (
                    <button
                      key={c}
                      className={`pigment-dot ${brushColor === c ? "active" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => onSetBrushColor(c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "shapes" && (
          <div className="toolbox-section">
            <span className="toolbox-heading">Story Shapes</span>
            <div className="shapes-grid">
              <button className="shape-action-btn" onClick={() => onAddShape("star")}>
                <svg viewBox="0 0 24 24" className="shape-svg"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#c68b59" /></svg>
                <span>Star</span>
              </button>

              <button className="shape-action-btn" onClick={() => onAddShape("heart")}>
                <svg viewBox="0 0 24 24" className="shape-svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e07a5f" /></svg>
                <span>Heart</span>
              </button>

              <button className="shape-action-btn" onClick={() => onAddShape("cloud")}>
                <svg viewBox="0 0 24 24" className="shape-svg"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#819b7a" /></svg>
                <span>Cloud</span>
              </button>

              <button className="shape-action-btn" onClick={() => onAddShape("speech")}>
                <svg viewBox="0 0 24 24" className="shape-svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#dda15e" /></svg>
                <span>Bubble</span>
              </button>

              <button className="shape-action-btn" onClick={() => onAddShape("circle")}>
                <svg viewBox="0 0 24 24" className="shape-svg"><circle cx="12" cy="12" r="9" fill="#bc6c25" /></svg>
                <span>Circle</span>
              </button>

              <button className="shape-action-btn" onClick={() => onAddShape("rect")}>
                <svg viewBox="0 0 24 24" className="shape-svg"><rect x="3" y="5" width="18" height="14" rx="3" fill="#847596" /></svg>
                <span>Frame</span>
              </button>
            </div>

            <div className="control-palette-group">
              <span className="toolbox-heading">Shape Fill</span>
              <div className="palette-swatch-box">
                {LOFI_PALETTE.map((c) => (
                  <button
                    key={`fill-${c}`}
                    className={`pigment-dot ${shapeFill === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => onSetShapeFill(c)}
                  />
                ))}
              </div>
            </div>

            <div className="control-palette-group">
              <span className="toolbox-heading">Shape Border</span>
              <div className="palette-swatch-box">
                {LOFI_PALETTE.map((c) => (
                  <button
                    key={`stroke-${c}`}
                    className={`pigment-dot ${shapeStroke === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => onSetShapeStroke(c)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "stickers" && (
          <div className="toolbox-section">
            <span className="toolbox-heading">Storybook Stamps</span>
            <div className="stickers-matrix">
              {STORY_STICKERS.map((stk) => (
                <button
                  key={stk}
                  className="sticker-stamp-btn"
                  onClick={() => onAddSticker(stk)}
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="toolbox-arrange-dock">
        <span className="toolbox-heading">Arrange & Layers</span>
        <div className="arrange-btn-row">
          <button
            className="dock-tool-btn"
            disabled={!hasSelection}
            onClick={onBringForward}
            title="Bring to Front"
          >
            Bring Front
          </button>
          <button
            className="dock-tool-btn"
            disabled={!hasSelection}
            onClick={onSendBackward}
            title="Send to Back"
          >
            Send Back
          </button>
          <button
            className="dock-tool-btn"
            disabled={!hasSelection}
            onClick={onDuplicate}
            title="Duplicate Selected"
          >
            Copy
          </button>
          <button
            className="dock-tool-btn danger"
            disabled={!hasSelection}
            onClick={onDelete}
            title="Delete Selected"
          >
            Trash
          </button>
        </div>
      </div>
    </aside>
  );
};