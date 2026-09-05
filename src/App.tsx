import { useState } from "react";
import { Canvas, IText } from "fabric";
import { SpreadCanvas } from "./components/SpreadCanvas";
import { ProjectHub } from "./components/ProjectHub";
import { EditBookModal } from "./components/EditBookModal";
import { BookProject, BookFormat } from "./types";
import { BOOK_FORMATS, BOOK_THEMES, FONTS, COLOR_PALETTE } from "./constants";
import { exportBookToPdf } from "./utils/pdfExport";
import "./App.css";

export default function App() {
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);

  const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  const [mode, setMode] = useState<"select" | "draw">("select");
  const [brushColor, setBrushColor] = useState<string>("#333333");
  const [brushSize, setBrushSize] = useState<number>(6);

  const [selectedFont, setSelectedFont] = useState<string>("Lora");
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>("#2a1b12");

  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const currentFormat = activeProject
    ? BOOK_FORMATS.find((f) => f.id === activeProject.formatId) || BOOK_FORMATS[0]
    : BOOK_FORMATS[0];
  const currentTheme = activeProject
    ? BOOK_THEMES.find((t) => t.id === activeProject.themeId) || BOOK_THEMES[0]
    : BOOK_THEMES[0];

  const activeSpread = activeProject
    ? activeProject.spreads.find(
        (s) => s.leftPageNum === activePageNum || s.rightPageNum === activePageNum
      ) || activeProject.spreads[0]
    : null;

  const activeSide: "left" | "right" =
    activeSpread && activePageNum === activeSpread.leftPageNum ? "left" : "right";
  const totalPages = activeProject ? activeProject.spreads.length * 2 : 0;
  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1);

  const createNewProject = (
    title: string,
    author: string,
    formatId: BookFormat["id"],
    themeId: string
  ) => {
    const newProject: BookProject = {
      id: `book-${Date.now()}`,
      title,
      author,
      formatId,
      themeId,
      createdAt: new Date().toLocaleDateString(),
      spreads: [
        { id: "spread-1", leftPageNum: 1, rightPageNum: 2, canvasData: null },
        { id: "spread-2", leftPageNum: 3, rightPageNum: 4, canvasData: null },
      ],
    };
    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setActivePageNum(1);
    const selTheme = BOOK_THEMES.find((t) => t.id === themeId) || BOOK_THEMES[0];
    setTextColor(selTheme.textColor);
    setBrushColor(selTheme.textColor);
    setSelectedFont(selTheme.primaryFont);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  const updateProjectDetails = (updated: Partial<BookProject>) => {
    if (!activeProjectId) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...p, ...updated } : p))
    );
  };

  const saveActiveSpread = () => {
    if (!activeCanvas || !activeProject || !activeSpread) return;
    const json = activeCanvas.toJSON();
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              spreads: p.spreads.map((s) =>
                s.id === activeSpread.id ? { ...s, canvasData: json } : s
              ),
            }
          : p
      )
    );
  };

  const navigateToPage = (targetPage: number) => {
    if (
      !activeProject ||
      !activeSpread ||
      targetPage === activePageNum ||
      targetPage < 1 ||
      targetPage > totalPages
    )
      return;

    saveActiveSpread();
    const direction = targetPage > activePageNum ? "next" : "prev";
    setFlipDirection(direction);

    const targetSpread =
      activeProject.spreads.find(
        (s) => s.leftPageNum === targetPage || s.rightPageNum === targetPage
      ) || activeProject.spreads[0];

    const needsCanvasSwap = targetSpread.id !== activeSpread.id;

    setTimeout(() => {
      setActivePageNum(targetPage);

      if (needsCanvasSwap && activeCanvas) {
        activeCanvas.discardActiveObject();
        if (targetSpread.canvasData) {
          activeCanvas.loadFromJSON(targetSpread.canvasData).then(() => {
            activeCanvas.backgroundColor = currentTheme.pageBackground;
            activeCanvas.renderAll();
          });
        } else {
          activeCanvas.clear();
          activeCanvas.backgroundColor = currentTheme.pageBackground;
          activeCanvas.renderAll();
        }
      }
    }, 220);

    setTimeout(() => {
      setFlipDirection(null);
    }, 600);
  };

  const addSpreadPages = () => {
    if (!activeProject) return;
    saveActiveSpread();
    const lastSpread = activeProject.spreads[activeProject.spreads.length - 1];
    const newLeft = lastSpread.rightPageNum + 1;
    const newRight = newLeft + 1;
    const newSpread = {
      id: `spread-${Date.now()}`,
      leftPageNum: newLeft,
      rightPageNum: newRight,
      canvasData: null,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, spreads: [...p.spreads, newSpread] } : p
      )
    );
    navigateToPage(newLeft);
  };

  const addStoryText = () => {
    if (!activeCanvas || !currentFormat) return;

    const posX = activeSide === "left" ? 120 : currentFormat.pageWidth + 100;
    const text = new IText("Begin your story here...", {
      left: posX,
      top: 180,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: textColor,
      width: currentFormat.pageWidth - 220,
      lineHeight: 1.35,
      padding: 8,
      borderColor: currentTheme.accentColor,
      cornerColor: currentTheme.accentColor,
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
    if (!activeCanvas || !activeProject || !activeSpread) return;
    const pdfBytes = await exportBookToPdf(
      activeProject.spreads.map((s) => ({ ...s, themeId: activeProject.themeId })),
      activeCanvas,
      activeSpread.id
    );
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeProject.title.replace(/\s+/g, "_")}_PrintReady.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!activeProject || !activeSpread) {
    return (
      <ProjectHub
        projects={projects}
        onOpenProject={(proj) => {
          setActiveProjectId(proj.id);
          setActivePageNum(1);
        }}
        onCreateProject={createNewProject}
        onDeleteProject={deleteProject}
      />
    );
  }

  return (
    <div className="studio-app-screen">
      <header className="studio-head-nav">
        <div className="head-left-group">
          <button className="nav-back-shelf-btn" onClick={() => setActiveProjectId(null)}>
            &#8592; Bookshelf
          </button>
          <div className="project-title-badge">
            <span className="book-name-title">{activeProject.title}</span>
            <span className="book-theme-subtitle">
              {currentFormat.label} • {currentTheme.name}
            </span>
          </div>
          <button className="nav-edit-specs-btn" onClick={() => setIsEditingSettings(true)}>
            Edit Specs
          </button>
        </div>

        <div className="head-right-group">
          <button className="master-export-btn" onClick={handleExportPdf}>
            Export 300 DPI PDF
          </button>
        </div>
      </header>

      <div className="studio-editor-workspace">
        <aside className="editor-control-panel">
          <div className="panel-section">
            <span className="section-kicker">Workspace Mode</span>
            <div className="pill-mode-switch">
              <button
                className={`mode-btn ${mode === "select" ? "active" : ""}`}
                onClick={() => setMode("select")}
              >
                Pointer / Arrange
              </button>
              <button
                className={`mode-btn ${mode === "draw" ? "active" : ""}`}
                onClick={() => setMode("draw")}
              >
                Hand Illustration
              </button>
            </div>
          </div>

          {mode === "draw" ? (
            <div className="panel-section">
              <span className="section-kicker">Drawing Instrument</span>
              <div className="row-slider-label">
                <span>Thickness</span>
                <span>{brushSize}px</span>
              </div>
              <input
                type="range"
                className="custom-range"
                min="2"
                max="60"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />

              <span className="section-kicker sub-kicker">Pigment Palette</span>
              <div className="swatch-palette-matrix">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    className={`palette-swatch-circle ${brushColor === color ? "active" : ""}`}
                    style={{ background: color }}
                    onClick={() => setBrushColor(color)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="panel-section">
              <span className="section-kicker">Story Typography</span>
              <button className="add-passage-btn" onClick={addStoryText}>
                + Add Text to Page {activePageNum}
              </button>

              {selectedObject && selectedObject.type === "i-text" && (
                <div className="type-inspector-box">
                  <div className="input-field-block">
                    <label>Story Font</label>
                    <select
                      className="styled-select"
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

                  <div className="input-field-block">
                    <div className="row-slider-label">
                      <span>Size</span>
                      <span>{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      className="custom-range"
                      min="16"
                      max="80"
                      value={fontSize}
                      onChange={(e) => {
                        setFontSize(Number(e.target.value));
                        updateSelectedText("fontSize", Number(e.target.value));
                      }}
                    />
                  </div>

                  <div className="input-field-block">
                    <label>Ink Color</label>
                    <div className="swatch-palette-matrix">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          className={`palette-swatch-circle ${textColor === color ? "active" : ""}`}
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

          <div className="panel-bottom-tools">
            <button className="subtle-tool-btn" onClick={undoLastAction}>
              Undo Stroke
            </button>
            <button
              className="danger-tool-btn"
              disabled={!selectedObject}
              onClick={deleteActiveObject}
            >
              Delete Element
            </button>
          </div>
        </aside>

        <main className="editor-center-stage">
          <div className="spread-navigation-header">
            <button
              className="page-nav-arrow"
              disabled={activePageNum === 1}
              onClick={() => navigateToPage(activePageNum - 1)}
            >
              &#8592; Previous
            </button>
            <div className="real-book-tag">
              Viewing Pages <span className="highlight-pill">{activeSpread.leftPageNum}</span> &{" "}
              <span className="highlight-pill">{activeSpread.rightPageNum}</span> of {totalPages}
            </div>
            <button
              className="page-nav-arrow"
              disabled={activePageNum === totalPages}
              onClick={() => navigateToPage(activePageNum + 1)}
            >
              Next &#8594;
            </button>
          </div>

          <div className="book-centering-wrapper">
            <SpreadCanvas
              theme={currentTheme}
              format={currentFormat}
              mode={mode}
              brushColor={brushColor}
              brushSize={brushSize}
              canvasData={activeSpread.canvasData}
              activeSide={activeSide}
              flipDirection={flipDirection}
              onCanvasReady={setActiveCanvas}
              onSelectionChange={setSelectedObject}
            />
          </div>
        </main>
      </div>

      <footer className="editor-single-page-bar">
        <div className="bar-title-cluster">
          <span className="bar-tag">PAGE JUMP</span>
          <button className="add-spread-mini-btn" onClick={addSpreadPages}>
            + Add 2 Pages
          </button>
        </div>

        <div className="page-ribbon-carousel">
          {pageList.map((pageNum) => {
            const isLeft = pageNum % 2 === 1;
            const isSelected = pageNum === activePageNum;

            return (
              <div
                key={pageNum}
                className={`page-single-tab ${isSelected ? "selected" : ""}`}
                onClick={() => navigateToPage(pageNum)}
              >
                <div
                  className={`tab-card-shape ${isLeft ? "left-edge" : "right-edge"}`}
                  style={{ background: currentTheme.pageBackground }}
                >
                  <span className="tab-number">{pageNum}</span>
                </div>
                <span className="tab-position-label">{isLeft ? "L" : "R"}</span>
              </div>
            );
          })}
        </div>
      </footer>

      {isEditingSettings && (
        <EditBookModal
          project={activeProject}
          onClose={() => setIsEditingSettings(false)}
          onSave={updateProjectDetails}
        />
      )}
    </div>
  );
}