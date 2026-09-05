import { useState } from "react";
import { Canvas, IText } from "fabric";
import { SpreadCanvas } from "./components/SpreadCanvas";
import { BookProject } from "./types";
import { PAPERS, FONTS, LOFI_PALETTE } from "./constants";
import { exportBookToPdf } from "./utils/pdfExport";
import "./App.css";

export default function App() {
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [turnState, setTurnState] = useState<{
    active: boolean;
    direction: "next" | "prev";
  } | null>(null);

  const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  const [mode, setMode] = useState<"select" | "draw">("select");
  const [brushColor, setBrushColor] = useState<string>("#2c221e");
  const [brushSize, setBrushSize] = useState<number>(4);

  const [selectedFont, setSelectedFont] = useState<string>("Caveat");
  const [fontSize, setFontSize] = useState<number>(34);

  const [isCreatingModal, setIsCreatingModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [selectedPaperId, setSelectedPaperId] =
    useState<BookProject["paperId"]>("latte");

  const [isEditingSpecs, setIsEditingSpecs] = useState<boolean>(false);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || null;
  const currentPaper =
    PAPERS.find((p) => p.id === activeProject?.paperId) || PAPERS[0];

  const activeSpread = activeProject
    ? activeProject.spreads.find(
        (s) =>
          s.leftPageNum === activePageNum || s.rightPageNum === activePageNum
      ) || activeProject.spreads[0]
    : null;

  const activeSide =
    activeSpread && activePageNum === activeSpread.leftPageNum
      ? "left"
      : "right";
  const totalPages = activeProject ? activeProject.spreads.length * 2 : 0;
  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1);

  const createNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const paper =
      PAPERS.find((p) => p.id === selectedPaperId) || PAPERS[0];

    const project: BookProject = {
      id: `book-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || "Cafe Writer",
      paperId: selectedPaperId,
      createdAt: new Date().toLocaleDateString(),
      spreads: [
        { id: "s-1", leftPageNum: 1, rightPageNum: 2, canvasData: null },
        { id: "s-2", leftPageNum: 3, rightPageNum: 4, canvasData: null },
      ],
    };

    setProjects((prev) => [...prev, project]);
    setActiveProjectId(project.id);
    setActivePageNum(1);
    setBrushColor(paper.ink);
    setIsCreatingModal(false);
    setNewTitle("");
    setNewAuthor("");
  };

  const saveCurrentSpread = () => {
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

  const goToPage = (page: number) => {
    if (
      !activeProject ||
      !activeSpread ||
      page === activePageNum ||
      page < 1 ||
      page > totalPages ||
      turnState?.active
    )
      return;

    saveCurrentSpread();
    const dir = page > activePageNum ? "next" : "prev";
    setTurnState({ active: true, direction: dir });

    const targetSpread =
      activeProject.spreads.find(
        (s) => s.leftPageNum === page || s.rightPageNum === page
      ) || activeProject.spreads[0];

    const needsLoad = targetSpread.id !== activeSpread.id;

    setTimeout(() => {
      setActivePageNum(page);
      if (needsLoad && activeCanvas) {
        activeCanvas.discardActiveObject();
        if (targetSpread.canvasData) {
          activeCanvas.loadFromJSON(targetSpread.canvasData).then(() => {
            activeCanvas.backgroundColor = currentPaper.bg;
            activeCanvas.renderAll();
          });
        } else {
          activeCanvas.clear();
          activeCanvas.backgroundColor = currentPaper.bg;
          activeCanvas.renderAll();
        }
      }
    }, 450);

    setTimeout(() => {
      setTurnState(null);
    }, 900);
  };

  const addSpreadPages = () => {
    if (!activeProject) return;
    saveCurrentSpread();
    const last = activeProject.spreads[activeProject.spreads.length - 1];
    const newLeft = last.rightPageNum + 1;
    const newSpread = {
      id: `s-${Date.now()}`,
      leftPageNum: newLeft,
      rightPageNum: newLeft + 1,
      canvasData: null,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, spreads: [...p.spreads, newSpread] }
          : p
      )
    );
    goToPage(newLeft);
  };

  const addTextElement = () => {
    if (!activeCanvas) return;
    const posX = activeSide === "left" ? 140 : 740;
    const text = new IText("Write some warm thoughts...", {
      left: posX,
      top: 200,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: currentPaper.ink,
      width: 380,
      lineHeight: 1.35,
      padding: 8,
      borderColor: "#c68b59",
      cornerColor: "#c68b59",
      cornerSize: 8,
      transparentCorners: false,
    });

    activeCanvas.add(text);
    activeCanvas.setActiveObject(text);
    setMode("select");
    activeCanvas.renderAll();
  };

  const updateTextProp = (key: string, val: any) => {
    if (!activeCanvas || !selectedObject || selectedObject.type !== "i-text")
      return;
    selectedObject.set(key, val);
    activeCanvas.renderAll();
  };

  const deleteElement = () => {
    if (!activeCanvas) return;
    const active = activeCanvas.getActiveObject();
    if (active) {
      activeCanvas.remove(active);
      activeCanvas.discardActiveObject();
      activeCanvas.renderAll();
      setSelectedObject(null);
    }
  };

  const handleExport = async () => {
    if (!activeCanvas || !activeProject || !activeSpread) return;
    const pdfBytes = await exportBookToPdf(
      activeProject.spreads.map((s) => ({
        ...s,
        themeId: activeProject.paperId,
      })),
      activeCanvas,
      activeSpread.id
    );
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeProject.title.replace(/\s+/g, "_")}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!activeProject || !activeSpread) {
    return (
      <div className="lofi-cafe-hub">
        <header className="cafe-nav">
          <div className="cafe-brand">
            <div className="steam-icon">
              <div className="steam-line line-1" />
              <div className="steam-line line-2" />
            </div>
            <div className="brand-text-block">
              <h1>Atelier Lofi</h1>
              <span>Warm Children's Book Studio</span>
            </div>
          </div>
          <button
            className="cafe-btn primary"
            onClick={() => setIsCreatingModal(true)}
          >
            + Brew a New Story
          </button>
        </header>

        <main className="cafe-bookshelf">
          {projects.length === 0 ? (
            <div className="cafe-empty-corner">
              <div className="mug-sketch" />
              <h2>A quiet blank notebook awaits</h2>
              <p>
                Sip your coffee, choose your warm paper tone, and write lovely
                tales.
              </p>
              <button
                className="cafe-btn primary"
                onClick={() => setIsCreatingModal(true)}
              >
                Create First Notebook
              </button>
            </div>
          ) : (
            <div className="notebook-grid">
              {projects.map((proj) => {
                const paper =
                  PAPERS.find((p) => p.id === proj.paperId) || PAPERS[0];
                return (
                  <div
                    key={proj.id}
                    className="notebook-card"
                    onClick={() => setActiveProjectId(proj.id)}
                  >
                    <div
                      className="notebook-spine-tab"
                      style={{ backgroundColor: paper.spine }}
                    />
                    <div
                      className="notebook-cover"
                      style={{
                        backgroundColor: paper.bg,
                        borderColor: paper.border,
                      }}
                    >
                      <div className="ribbon-placeholder" />
                      <h3 style={{ color: paper.ink }}>{proj.title}</h3>
                      <span
                        className="author-name"
                        style={{ color: paper.ink }}
                      >
                        by {proj.author}
                      </span>
                      <span className="page-count-badge">
                        {proj.spreads.length * 2} pages • {paper.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {isCreatingModal && (
          <div className="cafe-modal-backdrop">
            <div className="cafe-modal">
              <div className="modal-title-row">
                <h3>New Story Notebook</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setIsCreatingModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={createNewBook} className="cafe-form">
                <div className="form-field">
                  <label>Notebook Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Cat on the Windowsill"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Author or Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Bedtime stories for my family"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Paper Style</label>
                  <div className="paper-tasting-grid">
                    {PAPERS.map((p) => (
                      <div
                        key={p.id}
                        className={`paper-choice-pill ${
                          selectedPaperId === p.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedPaperId(p.id)}
                      >
                        <div
                          className="paper-color-dot"
                          style={{
                            backgroundColor: p.bg,
                            border: `1px solid ${p.border}`,
                          }}
                        />
                        <div className="paper-meta">
                          <span className="name">{p.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer-btns">
                  <button
                    type="button"
                    className="cafe-btn secondary"
                    onClick={() => setIsCreatingModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="cafe-btn primary">
                    Open Notebook
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="lofi-app-frame">
      <header className="lofi-topbar">
        <div className="topbar-left">
          <button
            className="lofi-back-btn"
            onClick={() => setActiveProjectId(null)}
          >
            ← Shelf
          </button>
          <div className="book-indicator">
            <span className="book-name">{activeProject.title}</span>
            <span className="book-tone-name">
              {currentPaper.name} paper
            </span>
          </div>
          <button
            className="lofi-link-btn"
            onClick={() => setIsEditingSpecs(true)}
          >
            Paper Options
          </button>
        </div>

        <div className="topbar-center-tools">
          <div className="lofi-pill-switch">
            <button
              className={`pill-option ${mode === "select" ? "active" : ""}`}
              onClick={() => setMode("select")}
            >
              Touch / Move
            </button>
            <button
              className={`pill-option ${mode === "draw" ? "active" : ""}`}
              onClick={() => setMode("draw")}
            >
              Fountain Pen
            </button>
          </div>

          <div className="soft-vertical-bar" />

          {mode === "draw" ? (
            <div className="palette-inline-tray">
              <input
                type="range"
                className="lofi-warm-slider"
                min="2"
                max="48"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
              <div className="lofi-color-drops">
                {LOFI_PALETTE.map((col) => (
                  <button
                    key={col}
                    className={`color-drop ${brushColor === col ? "active" : ""}`}
                    style={{ backgroundColor: col }}
                    onClick={() => setBrushColor(col)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="type-inline-tray">
              <button className="lofi-add-btn" onClick={addTextElement}>
                + Add Words
              </button>
              {selectedObject?.type === "i-text" && (
                <>
                  <select
                    className="lofi-select"
                    value={selectedFont}
                    onChange={(e) => {
                      setSelectedFont(e.target.value);
                      updateTextProp("fontFamily", e.target.value);
                    }}
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <input
                    type="range"
                    className="lofi-warm-slider"
                    min="16"
                    max="72"
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(Number(e.target.value));
                      updateTextProp("fontSize", Number(e.target.value));
                    }}
                  />
                  <button
                    className="lofi-del-btn"
                    onClick={deleteElement}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="topbar-right">
          <button className="export-leather-btn" onClick={handleExport}>
            Print Book (PDF)
          </button>
        </div>
      </header>

      <main className="lofi-desk-viewport">
        <SpreadCanvas
          paper={currentPaper}
          mode={mode}
          brushColor={brushColor}
          brushSize={brushSize}
          canvasData={activeSpread.canvasData}
          activeSide={activeSide}
          turnState={turnState}
          onCanvasReady={setActiveCanvas}
          onSelectionChange={setSelectedObject}
        />
      </main>

      <footer className="lofi-bottom-tray">
        <div className="tray-page-turner">
          <button
            className="turn-btn left"
            disabled={activePageNum === 1 || !!turnState?.active}
            onClick={() => goToPage(activePageNum - 1)}
          >
            ← Prev Page
          </button>
          <span className="page-tracker-text">
            Page {activePageNum} of {totalPages}
          </span>
          <button
            className="turn-btn right"
            disabled={activePageNum === totalPages || !!turnState?.active}
            onClick={() => goToPage(activePageNum + 1)}
          >
            Next Page →
          </button>
        </div>

        <div className="tray-tabs-ribbon">
          {pageList.map((pageNum) => (
            <button
              key={pageNum}
              className={`page-chip ${activePageNum === pageNum ? "active" : ""}`}
              onClick={() => goToPage(pageNum)}
            >
              p. {pageNum}
            </button>
          ))}
          <button className="page-chip add" onClick={addSpreadPages}>
            + 2 Pages
          </button>
        </div>
      </footer>

      {isEditingSpecs && (
        <div className="cafe-modal-backdrop">
          <div className="cafe-modal small">
            <div className="modal-title-row">
              <h3>Paper Textures</h3>
              <button
                className="close-modal-btn"
                onClick={() => setIsEditingSpecs(false)}
              >
                ✕
              </button>
            </div>
            <div className="paper-tasting-grid">
              {PAPERS.map((p) => (
                <div
                  key={p.id}
                  className={`paper-choice-pill ${
                    activeProject.paperId === p.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setProjects((prev) =>
                      prev.map((proj) =>
                        proj.id === activeProjectId
                          ? { ...proj, paperId: p.id }
                          : proj
                      )
                    );
                  }}
                >
                  <div
                    className="paper-color-dot"
                    style={{
                      backgroundColor: p.bg,
                      border: `1px solid ${p.border}`,
                    }}
                  />
                  <div className="paper-meta">
                    <span className="name">{p.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer-btns">
              <button
                className="cafe-btn primary"
                onClick={() => setIsEditingSpecs(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}