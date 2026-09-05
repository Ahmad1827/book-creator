import { useState, useRef } from "react";
import { Canvas, IText } from "fabric";
import { SpreadCanvas } from "./components/SpreadCanvas";
import { BookSpread, BookTheme } from "./types";
import { FONTS, THEMES, COLOR_PALETTE } from "./constants";
import { exportBookToPdf } from "./utils/pdfExport";
import "./App.css";

export default function App() {
  const [spreads, setSpreads] = useState<BookSpread[]>([
    { id: "spread-1", leftPageNum: 1, rightPageNum: 2, canvasData: null, themeId: "parchment" },
    { id: "spread-2", leftPageNum: 3, rightPageNum: 4, canvasData: null, themeId: "parchment" },
  ]);
  const [activeSpreadId, setActiveSpreadId] = useState<string>("spread-1");

  const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  const [mode, setMode] = useState<"select" | "draw">("select");
  const [brushColor, setBrushColor] = useState<string>("#2c1d11");
  const [brushSize, setBrushSize] = useState<number>(5);

  const [selectedFont, setSelectedFont] = useState<string>("Fredoka");
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>("#2c1d11");

  const currentSpread = spreads.find((s) => s.id === activeSpreadId) || spreads[0];
  const currentTheme = THEMES.find((t) => t.id === currentSpread.themeId) || THEMES[0];

  const saveActiveSpreadState = () => {
    if (!activeCanvas) return;
    const json = activeCanvas.toJSON();
    setSpreads((prev) =>
      prev.map((s) => (s.id === activeSpreadId ? { ...s, canvasData: json } : s))
    );
  };

  const switchSpread = (targetId: string) => {
    if (targetId === activeSpreadId || !activeCanvas) return;
    saveActiveSpreadState();

    const targetSpread = spreads.find((s) => s.id === targetId);
    if (!targetSpread) return;

    setActiveSpreadId(targetId);
    activeCanvas.discardActiveObject();

    if (targetSpread.canvasData) {
      activeCanvas.loadFromJSON(targetSpread.canvasData).then(() => {
        const targetTheme = THEMES.find((t) => t.id === targetSpread.themeId) || THEMES[0];
        activeCanvas.backgroundColor = targetTheme.pageBackground;
        activeCanvas.renderAll();
      });
    } else {
      activeCanvas.clear();
      const targetTheme = THEMES.find((t) => t.id === targetSpread.themeId) || THEMES[0];
      activeCanvas.backgroundColor = targetTheme.pageBackground;
      activeCanvas.renderAll();
    }
  };

  const addSpread = () => {
    saveActiveSpreadState();
    const lastSpread = spreads[spreads.length - 1];
    const newLeft = lastSpread ? lastSpread.rightPageNum + 1 : 1;
    const newRight = newLeft + 1;
    const newId = `spread-${Date.now()}`;

    const newSpread: BookSpread = {
      id: newId,
      leftPageNum: newLeft,
      rightPageNum: newRight,
      canvasData: null,
      themeId: currentSpread.themeId,
    };

    setSpreads((prev) => [...prev, newSpread]);
    setActiveSpreadId(newId);

    if (activeCanvas) {
      activeCanvas.clear();
      activeCanvas.backgroundColor = currentTheme.pageBackground;
      activeCanvas.renderAll();
    }
  };

  const addStoryText = (pageSide: "left" | "right") => {
    if (!activeCanvas) return;

    const posX = pageSide === "left" ? 180 : 880;
    const text = new IText("Write your magical story here...", {
      left: posX,
      top: 250,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: textColor,
      width: 400,
      lineHeight: 1.3,
      padding: 10,
      borderColor: "#4a90e2",
      cornerColor: "#4a90e2",
      cornerStyle: "circle",
      cornerSize: 10,
      transparentCorners: false,
    });

    activeCanvas.add(text);
    activeCanvas.setActiveObject(text);
    setMode("select");
    activeCanvas.renderAll();
  };

  const updateSelectedText = (key: string, value: any) => {
    if (!activeCanvas || !selectedObject || selectedObject.type !== "i-text") return;
    selectedObject.set(key, value);
    activeCanvas.renderAll();
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    updateSelectedText("fontFamily", font);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    updateSelectedText("fontSize", size);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    updateSelectedText("fill", color);
  };

  const deleteActiveObject = () => {
    if (!activeCanvas) return;
    const active = activeCanvas.getActiveObject();
    if (active) {
      activeCanvas.remove(active);
      activeCanvas.discardActiveObject();
      activeCanvas.renderAll();
      setSelectedObject(null);
    }
  };

  const undoLastAction = () => {
    if (!activeCanvas) return;
    const objects = activeCanvas.getObjects();
    if (objects.length > 0) {
      activeCanvas.remove(objects[objects.length - 1]);
      activeCanvas.renderAll();
    }
  };

  const handleExportPdf = async () => {
    if (!activeCanvas) return;
    const pdfBytes = await exportBookToPdf(spreads, activeCanvas, activeSpreadId);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Childrens_Book_PrintReady.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="studio-root">
      <header className="studio-navbar">
        <div className="navbar-brand">
          <span className="brand-badge">Book Studio</span>
          <h2>Children's Book Maker</h2>
        </div>

        <div className="navbar-actions">
          <div className="theme-selector-group">
            <span className="control-label">Theme:</span>
            <div className="theme-pills">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-pill-btn ${theme.id === currentSpread.themeId ? "active" : ""}`}
                  style={{ background: theme.pageBackground }}
                  onClick={() => {
                    setSpreads((prev) =>
                      prev.map((s) => (s.id === activeSpreadId ? { ...s, themeId: theme.id } : s))
                    );
                  }}
                >
                  <span className="theme-color-dot" style={{ background: theme.spineColor }} />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <button className="primary-export-btn" onClick={handleExportPdf}>
            Export Print PDF
          </button>
        </div>
      </header>

      <div className="studio-workspace">
        <aside className="toolbox-sidebar">
          <div className="toolbox-section">
            <span className="section-title">Mode</span>
            <div className="tool-button-stack">
              <button
                className={`tool-action-btn ${mode === "select" ? "active" : ""}`}
                onClick={() => setMode("select")}
              >
                Pointer / Select
              </button>
              <button
                className={`tool-action-btn ${mode === "draw" ? "active" : ""}`}
                onClick={() => setMode("draw")}
              >
                Drawing Brush
              </button>
            </div>
          </div>

          {mode === "draw" ? (
            <div className="toolbox-section">
              <span className="section-title">Brush Settings</span>
              <div className="brush-slider-control">
                <label>Size: {brushSize}px</label>
                <input
                  type="range"
                  min="2"
                  max="60"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
              </div>

              <span className="sub-label">Palette</span>
              <div className="palette-grid">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    className={`palette-swatch ${brushColor === c ? "selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => setBrushColor(c)}
                  />
                ))}
                <input
                  type="color"
                  className="palette-custom-input"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="toolbox-section">
              <span className="section-title">Add Story Text</span>
              <div className="text-spawn-buttons">
                <button onClick={() => addStoryText("left")}>+ Left Page Text</button>
                <button onClick={() => addStoryText("right")}>+ Right Page Text</button>
              </div>

              {selectedObject && selectedObject.type === "i-text" && (
                <div className="typography-inspector">
                  <span className="section-title">Typography</span>
                  <div className="control-field">
                    <label>Story Font</label>
                    <select
                      value={selectedFont}
                      onChange={(e) => handleFontChange(e.target.value)}
                      className="font-dropdown"
                    >
                      {FONTS.map((f) => (
                        <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="control-field">
                    <label>Size ({fontSize}px)</label>
                    <input
                      type="range"
                      min="16"
                      max="90"
                      value={fontSize}
                      onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    />
                  </div>

                  <div className="control-field">
                    <label>Text Color</label>
                    <div className="palette-grid">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          className={`palette-swatch ${textColor === c ? "selected" : ""}`}
                          style={{ background: c }}
                          onClick={() => handleTextColorChange(c)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="toolbox-section bottom-utility">
            <button className="utility-btn" onClick={undoLastAction}>
              Undo
            </button>
            <button
              className="utility-btn delete-btn"
              disabled={!selectedObject}
              onClick={deleteActiveObject}
            >
              Delete Item
            </button>
          </div>
        </aside>

        <main className="spread-view-area">
          <div className="spread-header-labels">
            <span className="page-num-pill">Page {currentSpread.leftPageNum}</span>
            <span className="spread-center-title">Two-Page Spread</span>
            <span className="page-num-pill">Page {currentSpread.rightPageNum}</span>
          </div>

          <SpreadCanvas
            theme={currentTheme}
            mode={mode}
            brushColor={brushColor}
            brushSize={brushSize}
            canvasData={currentSpread.canvasData}
            onCanvasReady={setActiveCanvas}
            onSelectionChange={setSelectedObject}
          />
        </main>
      </div>

      <footer className="spread-filmstrip-drawer">
        <div className="filmstrip-header">
          <span>Book Pages & Spreads ({spreads.length} Spreads)</span>
          <button className="add-spread-btn" onClick={addSpread}>
            + Add New Spread
          </button>
        </div>

        <div className="spread-cards-strip">
          {spreads.map((spread, idx) => (
            <div
              key={spread.id}
              className={`spread-card ${spread.id === activeSpreadId ? "active" : ""}`}
              onClick={() => switchSpread(spread.id)}
            >
              <div className="spread-card-preview">
                <div className="preview-page" />
                <div className="preview-spine" />
                <div className="preview-page" />
              </div>
              <span className="spread-card-label">
                Spread {idx + 1} (pp. {spread.leftPageNum}-{spread.rightPageNum})
              </span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}