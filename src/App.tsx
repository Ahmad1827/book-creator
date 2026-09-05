import { useState } from "react";
import { Canvas, IText } from "fabric";
import { SpreadCanvas } from "./components/SpreadCanvas";
import { BookSpread } from "./types";
import { FONTS, THEMES, COLOR_PALETTE } from "./constants";
import { exportBookToPdf } from "./utils/pdfExport";
import "./App.css";

export default function App() {
  const [spreads, setSpreads] = useState<BookSpread[]>([
    { id: "spread-1", leftPageNum: 1, rightPageNum: 2, canvasData: null, themeId: "midnight" },
    { id: "spread-2", leftPageNum: 3, rightPageNum: 4, canvasData: null, themeId: "midnight" },
  ]);

  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);

  const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  const [mode, setMode] = useState<"select" | "draw">("select");
  const [brushColor, setBrushColor] = useState<string>("#e2e8f0");
  const [brushSize, setBrushSize] = useState<number>(5);

  const [selectedFont, setSelectedFont] = useState<string>("Fredoka");
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>("#f8fafc");

  const activeSpread =
    spreads.find((s) => s.leftPageNum === activePageNum || s.rightPageNum === activePageNum) ||
    spreads[0];
  const activeSide: "left" | "right" = activePageNum === activeSpread.leftPageNum ? "left" : "right";
  const currentTheme = THEMES.find((t) => t.id === activeSpread.themeId) || THEMES[0];

  const totalPages = spreads.length * 2;
  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1);

  const saveActiveSpread = () => {
    if (!activeCanvas) return;
    const json = activeCanvas.toJSON();
    setSpreads((prev) =>
      prev.map((s) => (s.id === activeSpread.id ? { ...s, canvasData: json } : s))
    );
  };

  const navigateToPage = (targetPage: number) => {
    if (targetPage === activePageNum || targetPage < 1 || targetPage > totalPages) return;

    saveActiveSpread();
    const direction = targetPage > activePageNum ? "next" : "prev";
    setFlipDirection(direction);

    const targetSpread =
      spreads.find((s) => s.leftPageNum === targetPage || s.rightPageNum === targetPage) ||
      spreads[0];

    const needsCanvasSwap = targetSpread.id !== activeSpread.id;

    setTimeout(() => {
      setActivePageNum(targetPage);

      if (needsCanvasSwap && activeCanvas) {
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
      }
    }, 200);

    setTimeout(() => {
      setFlipDirection(null);
    }, 600);
  };

  const addNewPagePair = () => {
    saveActiveSpread();
    const lastSpread = spreads[spreads.length - 1];
    const newLeft = lastSpread.rightPageNum + 1;
    const newRight = newLeft + 1;
    const newSpread: BookSpread = {
      id: `spread-${Date.now()}`,
      leftPageNum: newLeft,
      rightPageNum: newRight,
      canvasData: null,
      themeId: activeSpread.themeId,
    };

    setSpreads((prev) => [...prev, newSpread]);
    navigateToPage(newLeft);
  };

  const addStoryText = () => {
    if (!activeCanvas) return;

    const posX = activeSide === "left" ? 180 : 880;
    const text = new IText("Write your dark night story here...", {
      left: posX,
      top: 250,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: currentTheme.textColor,
      width: 380,
      lineHeight: 1.3,
      padding: 8,
      borderColor: "#6366f1",
      cornerColor: "#818cf8",
      cornerStyle: "circle",
      cornerSize: 9,
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

  const undoLastAction = () => {
    if (!activeCanvas) return;
    const objects = activeCanvas.getObjects();
    if (objects.length > 0) {
      activeCanvas.remove(objects[objects.length - 1]);
      activeCanvas.renderAll();
    }
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

  const handleExportPdf = async () => {
    if (!activeCanvas) return;
    const pdfBytes = await exportBookToPdf(spreads, activeCanvas, activeSpread.id);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Childrens_Book_DarkStudio.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="dark-studio-root">
      <header className="dark-navbar">
        <div className="navbar-brand">
          <div className="brand-dot" />
          <span className="brand-title">NOCTURNE STUDIO</span>
          <span className="brand-subtitle">Children's Book Workshop</span>
        </div>

        <div className="navbar-controls">
          <div className="theme-cluster">
            <span className="nav-label">THEME</span>
            <div className="theme-pills-row">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-pill ${theme.id === activeSpread.themeId ? "selected" : ""}`}
                  onClick={() => {
                    setSpreads((prev) =>
                      prev.map((s) => (s.id === activeSpread.id ? { ...s, themeId: theme.id } : s))
                    );
                  }}
                >
                  <span className="theme-dot" style={{ background: theme.pageBackground }} />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <button className="export-action-btn" onClick={handleExportPdf}>
            Export Print PDF
          </button>
        </div>
      </header>

      <div className="workspace-core">
        <aside className="dark-sidebar">
          <div className="sidebar-group">
            <span className="group-label">CANVAS MODE</span>
            <div className="segmented-control">
              <button
                className={`segment-btn ${mode === "select" ? "active" : ""}`}
                onClick={() => setMode("select")}
              >
                Pointer
              </button>
              <button
                className={`segment-btn ${mode === "draw" ? "active" : ""}`}
                onClick={() => setMode("draw")}
              >
                Draw
              </button>
            </div>
          </div>

          {mode === "draw" ? (
            <div className="sidebar-group">
              <span className="group-label">BRUSH PROPERTIES</span>
              <div className="slider-row">
                <span>Thickness</span>
                <span>{brushSize}px</span>
              </div>
              <input
                type="range"
                className="dark-range"
                min="2"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />

              <span className="group-label palette-label">INK PALETTE</span>
              <div className="swatch-grid">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    className={`swatch-btn ${brushColor === color ? "active" : ""}`}
                    style={{ background: color }}
                    onClick={() => setBrushColor(color)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="sidebar-group">
              <span className="group-label">TYPOGRAPHY</span>
              <button className="add-text-btn" onClick={addStoryText}>
                + Add Text to Page {activePageNum}
              </button>

              {selectedObject && selectedObject.type === "i-text" && (
                <div className="text-editor-fields">
                  <div className="field-block">
                    <label>Font Family</label>
                    <select
                      className="dark-select"
                      value={selectedFont}
                      onChange={(e) => {
                        setSelectedFont(e.target.value);
                        updateSelectedText("fontFamily", e.target.value);
                      }}
                    >
                      {FONTS.map((f) => (
                        <option key={f.family} value={f.family}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-block">
                    <div className="slider-row">
                      <span>Size</span>
                      <span>{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      className="dark-range"
                      min="18"
                      max="80"
                      value={fontSize}
                      onChange={(e) => {
                        setFontSize(Number(e.target.value));
                        updateSelectedText("fontSize", Number(e.target.value));
                      }}
                    />
                  </div>

                  <div className="field-block">
                    <label>Text Color</label>
                    <div className="swatch-grid">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          className={`swatch-btn ${textColor === color ? "active" : ""}`}
                          style={{ background: color }}
                          onClick={() => {
                            setTextColor(color);
                            updateSelectedText("fill", color);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="sidebar-bottom-actions">
            <button className="subtle-btn" onClick={undoLastAction}>
              Undo
            </button>
            <button
              className="danger-btn"
              disabled={!selectedObject}
              onClick={deleteActiveObject}
            >
              Delete
            </button>
          </div>
        </aside>

        <main className="stage-viewport">
          <div className="stage-top-indicator">
            <button
              className="nav-arrow-btn"
              disabled={activePageNum === 1}
              onClick={() => navigateToPage(activePageNum - 1)}
            >
              &#8592; Prev Page
            </button>

            <div className="page-status-pill">
              Editing <span className="highlight-text">Page {activePageNum}</span> of {totalPages}
            </div>

            <button
              className="nav-arrow-btn"
              disabled={activePageNum === totalPages}
              onClick={() => navigateToPage(activePageNum + 1)}
            >
              Next Page &#8594;
            </button>
          </div>

          <SpreadCanvas
            theme={currentTheme}
            mode={mode}
            brushColor={brushColor}
            brushSize={brushSize}
            canvasData={activeSpread.canvasData}
            activeSide={activeSide}
            flipDirection={flipDirection}
            onCanvasReady={setActiveCanvas}
            onSelectionChange={setSelectedObject}
          />
        </main>
      </div>

      <footer className="page-carousel-dock">
        <div className="dock-meta-row">
          <span className="dock-title">PAGES NAVIGATION</span>
          <button className="add-page-pill-btn" onClick={addNewPagePair}>
            + Add 2 Pages
          </button>
        </div>

        <div className="page-tiles-track">
          {pageList.map((pageNum) => {
            const isLeft = pageNum % 2 === 1;
            const isSelected = pageNum === activePageNum;

            return (
              <div
                key={pageNum}
                className={`page-tile-item ${isSelected ? "selected" : ""}`}
                onClick={() => navigateToPage(pageNum)}
              >
                <div className={`tile-leaf ${isLeft ? "left-leaf" : "right-leaf"}`}>
                  <div className="leaf-content-indicator">
                    <div className="mock-line" />
                    <div className="mock-line short" />
                  </div>
                  <span className="tile-leaf-num">{pageNum}</span>
                </div>
                <span className="tile-sublabel">{isLeft ? "Left Page" : "Right Page"}</span>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}