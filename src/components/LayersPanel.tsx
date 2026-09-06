import React, { useState } from "react";
import { CanvasLayer } from "../types";

export type PageDivisionType =
  | "top_art_bottom_text"
  | "bottom_art_top_text"
  | "split_vertical"
  | "just_drawing"
  | "just_text"
  | "floating_card";

interface LayersPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  layers: CanvasLayer[];
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
  onAddLayer: () => void;
  onRenameLayer: (layerId: string, newName: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
  onDeleteLayer: (layerId: string) => void;
  activeSide: "left" | "right";
  onSelectPageSide: (side: "left" | "right") => void;
  leftPageNum: number;
  rightPageNum: number;
  onApplyPageDivision: (side: "left" | "right", type: PageDivisionType) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  isOpen,
  onToggle,
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onRenameLayer,
  onToggleVisibility,
  onToggleLock,
  onReorderLayers,
  onDeleteLayer,
  activeSide,
  onSelectPageSide,
  leftPageNum,
  rightPageNum,
  onApplyPageDivision,
}) => {
  const [panelTab, setPanelTab] = useState<"layers" | "layout">("layers");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    index: number;
    position: "before" | "after";
  } | null>(null);

  const startRename = (layer: CanvasLayer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const commitRename = (layerId: string) => {
    if (editName.trim()) {
      onRenameLayer(layerId, editName.trim());
    }
    setEditingId(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleDragOverRow = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "before" : "after";

    if (
      !dropTarget ||
      dropTarget.index !== index ||
      dropTarget.position !== position
    ) {
      setDropTarget({ index, position });
    }
  };

  const executeDrop = (targetIdx: number, position: "before" | "after") => {
    if (draggedIndex === null) return;

    let destinationIndex = position === "before" ? targetIdx : targetIdx + 1;

    if (draggedIndex < destinationIndex) {
      destinationIndex -= 1;
    }

    if (draggedIndex !== destinationIndex) {
      onReorderLayers(draggedIndex, destinationIndex);
    }

    setDraggedIndex(null);
    setDropTarget(null);
  };

  const handleDropOnRow = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const position = dropTarget?.position || "after";
    executeDrop(index, position);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTarget(null);
  };

  return (
    <aside className={`lofi-layers-panel ${isOpen ? "open" : "closed"}`}>
      <button
        className="layers-toggle-handle"
        onClick={onToggle}
        title={isOpen ? "Collapse Panel" : "Open Panel"}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <span className="handle-text">Layers & Layout</span>
        <span className="layers-count-pill">{layers.length}</span>
      </button>

      {isOpen && (
        <div className="layers-panel-content">
          <div className="layers-header">
            <div className="layers-panel-tab-switcher">
              <button
                className={`panel-tab-btn ${panelTab === "layers" ? "active" : ""}`}
                onClick={() => setPanelTab("layers")}
              >
                Layers
              </button>
              <button
                className={`panel-tab-btn ${panelTab === "layout" ? "active" : ""}`}
                onClick={() => setPanelTab("layout")}
              >
                Page Split & Zones
              </button>
            </div>
            <button className="layers-close-btn" onClick={onToggle}>
              ✕
            </button>
          </div>

          {panelTab === "layers" ? (
            <>
              <div className="layers-toolbar-actions">
                <button className="add-layer-btn" onClick={onAddLayer}>
                  + New Layer
                </button>
              </div>

              <div
                className="layers-list-scroll"
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropTarget(null);
                  }
                }}
              >
                {layers.map((layer, index) => {
                  const isActive = layer.id === activeLayerId;
                  const isEditing = editingId === layer.id;
                  const isDragging = draggedIndex === index;

                  const showLineBefore =
                    dropTarget?.index === index &&
                    dropTarget.position === "before" &&
                    draggedIndex !== index &&
                    draggedIndex !== index - 1;

                  const showLineAfter =
                    dropTarget?.index === index &&
                    dropTarget.position === "after" &&
                    draggedIndex !== index &&
                    draggedIndex !== index + 1;

                  return (
                    <div key={layer.id} className="layer-row-wrapper">
                      {showLineBefore && <div className="drop-indicator-line" />}

                      <div
                        draggable={!isEditing}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOverRow(e, index)}
                        onDrop={(e) => handleDropOnRow(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`layer-row ${isActive ? "selected" : ""} ${
                          !layer.visible ? "hidden-layer" : ""
                        } ${isDragging ? "dragging" : ""}`}
                        onClick={() => onSelectLayer(layer.id)}
                      >
                        <span className="layer-drag-grip" title="Drag to reorder">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <circle cx="9" cy="6" r="1.5" />
                            <circle cx="15" cy="6" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="18" r="1.5" />
                            <circle cx="15" cy="18" r="1.5" />
                          </svg>
                        </span>

                        <div className="layer-info-text">
                          {isEditing ? (
                            <input
                              type="text"
                              autoFocus
                              className="layer-rename-input"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onBlur={() => commitRename(layer.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitRename(layer.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              className="layer-name"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                startRename(layer);
                              }}
                              title="Double-click to rename"
                            >
                              {layer.name}
                            </span>
                          )}
                          <span className="layer-meta">
                            {isActive
                              ? "Active Drawing Layer"
                              : `Level ${layers.length - index}`}
                          </span>
                        </div>

                        <div
                          className="layer-row-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="layer-btn-icon"
                            disabled={index === 0}
                            onClick={() => onReorderLayers(index, index - 1)}
                            title="Move Up"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          </button>

                          <button
                            className="layer-btn-icon"
                            disabled={index === layers.length - 1}
                            onClick={() => onReorderLayers(index, index + 1)}
                            title="Move Down"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>

                          <button
                            className="layer-btn-icon"
                            onClick={() => startRename(layer)}
                            title="Rename"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          <button
                            className={`layer-btn-icon ${
                              layer.locked ? "active-state" : ""
                            }`}
                            onClick={() => onToggleLock(layer.id)}
                            title={layer.locked ? "Unlock layer" : "Lock layer"}
                          >
                            {layer.locked ? (
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              </svg>
                            )}
                          </button>

                          <button
                            className={`layer-btn-icon ${
                              !layer.visible ? "muted-state" : ""
                            }`}
                            onClick={() => onToggleVisibility(layer.id)}
                            title={layer.visible ? "Hide layer" : "Show layer"}
                          >
                            {layer.visible ? (
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>

                          <button
                            className="layer-btn-icon danger"
                            disabled={layers.length <= 1}
                            onClick={() => onDeleteLayer(layer.id)}
                            title={
                              layers.length <= 1
                                ? "Cannot delete the only layer"
                                : "Delete layer"
                            }
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {showLineAfter && <div className="drop-indicator-line" />}
                    </div>
                  );
                })}

                {draggedIndex !== null && (
                  <div
                    className="layers-bottom-drop-zone"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDropTarget({ index: layers.length - 1, position: "after" });
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      executeDrop(layers.length - 1, "after");
                    }}
                  >
                    <span>Drop layer at the bottom</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="layout-divisions-scroll">
              <div className="page-target-selector">
                <span className="section-label">Target Page To Format</span>
                <div className="page-side-toggle-group">
                  <button
                    className={`side-btn ${activeSide === "left" ? "active" : ""}`}
                    onClick={() => onSelectPageSide("left")}
                  >
                    Page {leftPageNum} (Left Page)
                  </button>
                  <button
                    className={`side-btn ${activeSide === "right" ? "active" : ""}`}
                    onClick={() => onSelectPageSide("right")}
                  >
                    Page {rightPageNum} (Right Page)
                  </button>
                </div>
              </div>

              <div className="division-category-block">
                <span className="section-label">Text & Drawing Divisions</span>
                <div className="division-cards-list">
                  <button
                    className="division-card"
                    onClick={() => onApplyPageDivision(activeSide, "top_art_bottom_text")}
                  >
                    <div className="div-thumb top-art">
                      <div className="thumb-art-zone">Illustration Area</div>
                      <div className="thumb-text-zone">Story Lines Area</div>
                    </div>
                    <div className="div-card-meta">
                      <span className="title">Top Art / Bottom Text</span>
                      <span className="desc">Scenery illustration on top with framed story lines below</span>
                    </div>
                  </button>

                  <button
                    className="division-card"
                    onClick={() => onApplyPageDivision(activeSide, "bottom_art_top_text")}
                  >
                    <div className="div-thumb bottom-art">
                      <div className="thumb-text-zone">Story Lines Area</div>
                      <div className="thumb-art-zone">Illustration Area</div>
                    </div>
                    <div className="div-card-meta">
                      <span className="title">Top Text / Bottom Art</span>
                      <span className="desc">Narrative story verse on top with landscape ground below</span>
                    </div>
                  </button>

                  <button
                    className="division-card"
                    onClick={() => onApplyPageDivision(activeSide, "split_vertical")}
                  >
                    <div className="div-thumb split-side">
                      <div className="thumb-art-half">Art Column</div>
                      <div className="thumb-text-half">Text Column</div>
                    </div>
                    <div className="div-card-meta">
                      <span className="title">Vertical Half & Half</span>
                      <span className="desc">Character drawing on one side, verse block on the other</span>
                    </div>
                  </button>

                  <button
                    className="division-card"
                    onClick={() => onApplyPageDivision(activeSide, "floating_card")}
                  >
                    <div className="div-thumb floating-thumb">
                      <div className="floating-inner-card">Story Vignette</div>
                    </div>
                    <div className="div-card-meta">
                      <span className="title">Full Art + Floating Card</span>
                      <span className="desc">Full-bleed artwork page with frosted narrative card on top</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="division-category-block">
                <span className="section-label">Single Purpose Formats</span>
                <div className="division-cards-list">
                  <button
                    className="division-card"
                    onClick={() => onApplyPageDivision(activeSide, "just_drawing")}
                  >
                    <div className="div-thumb pure-art">
                      <div className="thumb-pure-art">100% Full Canvas Illustration</div>
                    </div>
                    <div className="div-card-meta">
                      <span className="title">Just Drawing</span>
                      <span className="desc">Dedicated illustration page with no text constraints</span>
                    </div>
                  </button>

                  <button
                    className="division-card"
                    onClick={() => onApplyPageDivision(activeSide, "just_text")}
                  >
                    <div className="div-thumb pure-text">
                      <div className="thumb-pure-text">Classic Storybook Typography</div>
                    </div>
                    <div className="div-card-meta">
                      <span className="title">Just Text</span>
                      <span className="desc">Classical full-page fairy tale chapter layout</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};