import React from "react";
import { Canvas } from "fabric";

export interface LayerItem {
  id: string;
  type: string;
  name: string;
  icon: string;
  visible: boolean;
  locked: boolean;
  fabricObj: any;
}

interface LayersPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  layers: LayerItem[];
  selectedObj: any | null;
  onSelectLayer: (obj: any) => void;
  onToggleVisibility: (obj: any) => void;
  onToggleLock: (obj: any) => void;
  onMoveUp: (obj: any) => void;
  onMoveDown: (obj: any) => void;
  onDeleteLayer: (obj: any) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  isOpen,
  onToggle,
  layers,
  selectedObj,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  onDeleteLayer,
}) => {
  return (
    <aside className={`lofi-layers-panel ${isOpen ? "open" : "closed"}`}>
      <button
        className="layers-toggle-handle"
        onClick={onToggle}
        title={isOpen ? "Collapse Layers" : "Open Layers"}
      >
        <span className="handle-icon">📚</span>
        <span className="handle-text">Layers</span>
        <span className="layers-count-pill">{layers.length}</span>
      </button>

      {isOpen && (
        <div className="layers-panel-content">
          <div className="layers-header">
            <div className="header-left">
              <span className="layers-title">Spread Layers</span>
              <span className="layers-sub">Top to bottom order</span>
            </div>
            <button className="layers-close-btn" onClick={onToggle}>✕</button>
          </div>

          <div className="layers-list-scroll">
            {layers.length === 0 ? (
              <div className="empty-layers-msg">
                <span>No elements on this page spread yet. Draw or add text/shapes!</span>
              </div>
            ) : (
              layers.map((layer, index) => {
                const isSelected = selectedObj === layer.fabricObj;
                return (
                  <div
                    key={layer.id || index}
                    className={`layer-row ${isSelected ? "selected" : ""} ${!layer.visible ? "hidden-layer" : ""}`}
                    onClick={() => onSelectLayer(layer.fabricObj)}
                  >
                    <span className="layer-type-icon">{layer.icon}</span>

                    <div className="layer-info-text">
                      <span className="layer-name">{layer.name}</span>
                      <span className="layer-meta">{layer.type}</span>
                    </div>

                    <div className="layer-row-actions" onClick={(e) => e.stopPropagation()}>
                      {/* Move Up */}
                      <button
                        className="layer-btn-icon"
                        disabled={index === 0}
                        onClick={() => onMoveUp(layer.fabricObj)}
                        title="Bring Forward"
                      >
                        ▲
                      </button>

                      {/* Move Down */}
                      <button
                        className="layer-btn-icon"
                        disabled={index === layers.length - 1}
                        onClick={() => onMoveDown(layer.fabricObj)}
                        title="Send Backward"
                      >
                        ▼
                      </button>

                      {/* Lock / Unlock */}
                      <button
                        className={`layer-btn-icon ${layer.locked ? "active-state" : ""}`}
                        onClick={() => onToggleLock(layer.fabricObj)}
                        title={layer.locked ? "Unlock layer" : "Lock layer"}
                      >
                        {layer.locked ? "🔒" : "🔓"}
                      </button>

                      {/* Visibility Eye */}
                      <button
                        className={`layer-btn-icon ${!layer.visible ? "muted-state" : ""}`}
                        onClick={() => onToggleVisibility(layer.fabricObj)}
                        title={layer.visible ? "Hide layer" : "Show layer"}
                      >
                        {layer.visible ? "👁️" : "🕶️"}
                      </button>

                      {/* Delete */}
                      <button
                        className="layer-btn-icon danger"
                        onClick={() => onDeleteLayer(layer.fabricObj)}
                        title="Delete layer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </aside>
  );
};