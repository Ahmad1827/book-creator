import React, { useState } from "react";
import { CanvasLayer } from "../types";

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
}) => {
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

  const handleDragOver = (e: React.DragEvent, index: number) => {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || dropTarget === null) {
      setDraggedIndex(null);
      setDropTarget(null);
      return;
    }

    let targetIndex =
      dropTarget.position === "before" ? dropTarget.index : dropTarget.index + 1;

    if (draggedIndex < targetIndex) {
      targetIndex -= 1;
    }

    if (draggedIndex !== targetIndex) {
      onReorderLayers(draggedIndex, targetIndex);
    }

    setDraggedIndex(null);
    setDropTarget(null);
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
        title={isOpen ? "Collapse Layers" : "Open Layers"}
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
        <span className="handle-text">Layers</span>
        <span className="layers-count-pill">{layers.length}</span>
      </button>

      {isOpen && (
        <div className="layers-panel-content">
          <div className="layers-header">
            <div className="header-left">
              <span className="layers-title">Document Layers</span>
              <span className="layers-sub">Drag rows to reorder stack</span>
            </div>
            <button className="layers-close-btn" onClick={onToggle}>
              ✕
            </button>
          </div>

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

              const showIndicatorBefore =
                dropTarget?.index === index &&
                dropTarget.position === "before" &&
                draggedIndex !== index &&
                draggedIndex !== index - 1;

              const showIndicatorAfter =
                dropTarget?.index === index &&
                dropTarget.position === "after" &&
                draggedIndex !== index &&
                draggedIndex !== index + 1;

              return (
                <div key={layer.id} className="layer-row-wrapper">
                  {showIndicatorBefore && <div className="drop-indicator-line" />}

                  <div
                    draggable={!isEditing}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className={`layer-row ${isActive ? "selected" : ""} ${
                      !layer.visible ? "hidden-layer" : ""
                    } ${isDragging ? "dragging" : ""}`}
                    onClick={() => onSelectLayer(layer.id)}
                  >
                    <span className="layer-drag-grip" title="Drag to reorder">
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="currentColor"
                      >
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
                          ? "Active Layer"
                          : `Level ${layers.length - index}`}
                      </span>
                    </div>

                    <div
                      className="layer-row-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Rename */}
                      <button
                        className="layer-btn-icon"
                        onClick={() => startRename(layer)}
                        title="Rename layer"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="12"
                          height="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Lock / Unlock */}
                      <button
                        className={`layer-btn-icon ${
                          layer.locked ? "active-state" : ""
                        }`}
                        onClick={() => onToggleLock(layer.id)}
                        title={layer.locked ? "Unlock layer" : "Lock layer"}
                      >
                        {layer.locked ? (
                          <svg
                            viewBox="0 0 24 24"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                          </svg>
                        )}
                      </button>

                      {/* Visibility Eye */}
                      <button
                        className={`layer-btn-icon ${
                          !layer.visible ? "muted-state" : ""
                        }`}
                        onClick={() => onToggleVisibility(layer.id)}
                        title={layer.visible ? "Hide layer" : "Show layer"}
                      >
                        {layer.visible ? (
                          <svg
                            viewBox="0 0 24 24"
                            width="13"
                            height="13"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            width="13"
                            height="13"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        )}
                      </button>

                      {/* Delete */}
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
                        <svg
                          viewBox="0 0 24 24"
                          width="12"
                          height="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {showIndicatorAfter && <div className="drop-indicator-line" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};