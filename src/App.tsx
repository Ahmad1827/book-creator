import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, IText, Path, Rect, Circle } from "fabric";
import { SpreadCanvas } from "./components/SpreadCanvas";
import { DrawingToolbox, BrushType, ShapeType } from "./components/DrawingToolbox";
import { ThemePreviewModal } from "./components/ThemePreviewModal";
import { BookProject } from "./types";
import { THEMES, FONTS, LOFI_PALETTE } from "./constants";
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
  const activeCanvasRef = useRef<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  const undoStackRef = useRef<any[]>([]);
  const redoStackRef = useRef<any[]>([]);
  const isHistoryLockedRef = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [mode, setMode] = useState<"select" | "draw" | "pan">("draw");
  const [brushType, setBrushType] = useState<BrushType>("pen");
  const [brushColor, setBrushColor] = useState<string>("#1d291e");
  const [brushSize, setBrushSize] = useState<number>(6);

  const [shapeFill, setShapeFill] = useState<string>("#dda15e");
  const [shapeStroke, setShapeStroke] = useState<string>("#2c211a");

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [selectedFont, setSelectedFont] = useState<string>("Patrick Hand");
  const [fontSize, setFontSize] = useState<number>(34);

  const [isCreatingModal, setIsCreatingModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newThemeId, setNewThemeId] = useState<string>("botanical_meadow");

  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const currentTheme =
    THEMES.find((t) => t.id === activeProject?.themeId) || THEMES[0];

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

  const recordCanvasState = useCallback((targetCanvas?: Canvas) => {
    const c = targetCanvas || activeCanvasRef.current;
    if (!c || isHistoryLockedRef.current) return;

    const state = c.toJSON();
    undoStackRef.current.push(state);
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setCanUndo(undoStackRef.current.length > 1);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    const c = activeCanvasRef.current;
    if (!c || undoStackRef.current.length <= 1) return;

    const currentState = undoStackRef.current.pop()!;
    redoStackRef.current.push(currentState);
    const previousState = undoStackRef.current[undoStackRef.current.length - 1];

    isHistoryLockedRef.current = true;
    c.loadFromJSON(previousState).then(() => {
      c.backgroundColor = "transparent";
      c.renderAll();
      isHistoryLockedRef.current = false;
      setCanUndo(undoStackRef.current.length > 1);
      setCanRedo(redoStackRef.current.length > 0);
    });
  }, []);

  const handleRedo = useCallback(() => {
    const c = activeCanvasRef.current;
    if (!c || redoStackRef.current.length === 0) return;

    const nextState = redoStackRef.current.pop()!;
    undoStackRef.current.push(nextState);

    isHistoryLockedRef.current = true;
    c.loadFromJSON(nextState).then(() => {
      c.backgroundColor = "transparent";
      c.renderAll();
      isHistoryLockedRef.current = false;
      setCanUndo(undoStackRef.current.length > 1);
      setCanRedo(redoStackRef.current.length > 0);
    });
  }, []);

  const deleteElement = useCallback(() => {
    const c = activeCanvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (active) {
      c.remove(active);
      c.discardActiveObject();
      c.renderAll();
      setSelectedObject(null);
      recordCanvasState(c);
    }
  }, [recordCanvasState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const c = activeCanvasRef.current;
      const activeObj = c?.getActiveObject() as any;
      if (activeObj && activeObj.isEditing) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (isCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (activeObj && !activeObj.isEditing) {
          e.preventDefault();
          deleteElement();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleUndo, handleRedo, deleteElement]);

  const handleCanvasReady = (canvas: Canvas) => {
    activeCanvasRef.current = canvas;
    setActiveCanvas(canvas);
    undoStackRef.current = [canvas.toJSON()];
    redoStackRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  };

  const handleAddShape = (type: ShapeType) => {
    const c = activeCanvasRef.current;
    if (!c) return;

    const posX = activeSide === "left" ? 220 : 820;
    const posY = 220;

    let shapeObj: any;

    if (type === "star") {
      shapeObj = new Path(
        "M 50 0 L 63 35 L 100 35 L 70 57 L 81 92 L 50 70 L 19 92 L 30 57 L 0 35 L 37 35 Z",
        {
          left: posX,
          top: posY,
          fill: shapeFill,
          stroke: shapeStroke,
          strokeWidth: 2,
          scaleX: 0.9,
          scaleY: 0.9,
        }
      );
    } else if (type === "heart") {
      shapeObj = new Path(
        "M 140 20 C 73 -25 0 74 140 180 C 280 74 207 -25 140 20 Z",
        {
          left: posX,
          top: posY,
          fill: shapeFill,
          stroke: shapeStroke,
          strokeWidth: 2,
          scaleX: 0.45,
          scaleY: 0.45,
        }
      );
    } else if (type === "cloud") {
      shapeObj = new Path(
        "M 170 80 A 45 45 0 0 1 82 80 A 35 35 0 0 1 35 110 A 30 30 0 0 1 35 160 A 30 30 0 0 1 50 170 H 190 A 30 30 0 0 1 205 160 A 35 35 0 0 1 205 110 A 45 45 0 0 1 170 80 Z",
        {
          left: posX,
          top: posY,
          fill: shapeFill,
          stroke: shapeStroke,
          strokeWidth: 2,
          scaleX: 0.6,
          scaleY: 0.6,
        }
      );
    } else if (type === "speech") {
      shapeObj = new Path(
        "M 20 20 H 180 A 15 15 0 0 1 195 35 V 105 A 15 15 0 0 1 180 120 H 70 L 40 150 V 120 H 20 A 15 15 0 0 1 5 105 V 35 A 15 15 0 0 1 20 20 Z",
        {
          left: posX,
          top: posY,
          fill: shapeFill,
          stroke: shapeStroke,
          strokeWidth: 2,
          scaleX: 0.7,
          scaleY: 0.7,
        }
      );
    } else if (type === "circle") {
      shapeObj = new Circle({
        left: posX,
        top: posY,
        radius: 50,
        fill: shapeFill,
        stroke: shapeStroke,
        strokeWidth: 2,
      });
    } else {
      shapeObj = new Rect({
        left: posX,
        top: posY,
        width: 140,
        height: 90,
        rx: 8,
        ry: 8,
        fill: shapeFill,
        stroke: shapeStroke,
        strokeWidth: 2,
      });
    }

    c.add(shapeObj);
    c.setActiveObject(shapeObj);
    setMode("select");
    c.renderAll();
    recordCanvasState(c);
  };

  const handleAddSticker = (sticker: string) => {
    const c = activeCanvasRef.current;
    if (!c) return;

    const posX = activeSide === "left" ? 240 : 840;
    const posY = 220;

    const stickerText = new IText(sticker, {
      left: posX,
      top: posY,
      fontSize: 54,
      fontFamily: "Arial",
      padding: 6,
      borderColor: currentTheme.accentColor,
      cornerColor: currentTheme.accentColor,
      cornerSize: 8,
      transparentCorners: false,
    });

    c.add(stickerText);
    c.setActiveObject(stickerText);
    setMode("select");
    c.renderAll();
    recordCanvasState(c);
  };

  const handleBringForward = () => {
    const c = activeCanvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (active) {
      c.bringObjectToFront(active);
      c.renderAll();
      recordCanvasState(c);
    }
  };

  const handleSendBackward = () => {
    const c = activeCanvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (active) {
      c.sendObjectToBack(active);
      c.renderAll();
      recordCanvasState(c);
    }
  };

  const handleDuplicate = () => {
    const c = activeCanvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (active) {
      active.clone().then((cloned: any) => {
        cloned.set({
          left: (active.left || 100) + 20,
          top: (active.top || 100) + 20,
        });
        c.add(cloned);
        c.setActiveObject(cloned);
        c.renderAll();
        recordCanvasState(c);
      });
    }
  };

  const createNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const theme = THEMES.find((t) => t.id === newThemeId) || THEMES[0];

    const project: BookProject = {
      id: `book-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || "Author",
      themeId: newThemeId,
      createdAt: new Date().toLocaleDateString(),
      spreads: [
        { id: "s-1", leftPageNum: 1, rightPageNum: 2, canvasData: null },
        { id: "s-2", leftPageNum: 3, rightPageNum: 4, canvasData: null },
      ],
    };

    setProjects((prev) => [...prev, project]);
    setActiveProjectId(project.id);
    setActivePageNum(1);
    setBrushColor(theme.inkColor);
    setSelectedFont(theme.recommendedFont);
    setZoomLevel(100);
    setPan({ x: 0, y: 0 });
    setIsCreatingModal(false);
    setNewTitle("");
    setNewAuthor("");
  };

  const saveCurrentSpread = () => {
    const c = activeCanvasRef.current;
    if (!c || !activeProject || !activeSpread) return;
    const json = c.toJSON();
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
    const c = activeCanvasRef.current;
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
      if (needsLoad && c) {
        c.discardActiveObject();
        isHistoryLockedRef.current = true;
        if (targetSpread.canvasData) {
          c.loadFromJSON(targetSpread.canvasData).then(() => {
            c.backgroundColor = "transparent";
            c.renderAll();
            isHistoryLockedRef.current = false;
            undoStackRef.current = [c.toJSON()];
            redoStackRef.current = [];
            setCanUndo(false);
            setCanRedo(false);
          });
        } else {
          c.clear();
          c.backgroundColor = "transparent";
          c.renderAll();
          isHistoryLockedRef.current = false;
          undoStackRef.current = [c.toJSON()];
          redoStackRef.current = [];
          setCanUndo(false);
          setCanRedo(false);
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

  const addTextElement = async () => {
    const c = activeCanvasRef.current;
    if (!c) return;

    try {
      await (document as any).fonts.load(`${fontSize}px "${selectedFont}"`);
    } catch (e) {
      console.warn(e);
    }

    const posX = activeSide === "left" ? 140 : 740;
    const text = new IText("Write your lovely story here...", {
      left: posX,
      top: 200,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: currentTheme.inkColor,
      width: 360,
      lineHeight: 1.35,
      padding: 8,
      borderColor: currentTheme.accentColor,
      cornerColor: currentTheme.accentColor,
      cornerSize: 8,
      transparentCorners: false,
    });

    c.add(text);
    c.setActiveObject(text);
    setMode("select");
    c.renderAll();
    recordCanvasState(c);
  };

  const updateTextFont = async (font: string) => {
    setSelectedFont(font);
    const c = activeCanvasRef.current;
    if (!c || !selectedObject || selectedObject.type !== "i-text") return;

    const targetSize = selectedObject.fontSize || fontSize;
    try {
      await (document as any).fonts.load(`${targetSize}px "${font}"`);
    } catch (e) {
      console.warn(e);
    }

    selectedObject.set("fontFamily", font);
    if (typeof (selectedObject as any).initDimensions === "function") {
      (selectedObject as any).initDimensions();
    }
    c.requestRenderAll();
    recordCanvasState(c);
  };

  const updateTextFontSize = (size: number) => {
    setFontSize(size);
    const c = activeCanvasRef.current;
    if (!c || !selectedObject || selectedObject.type !== "i-text") return;

    selectedObject.set("fontSize", size);
    if (typeof (selectedObject as any).initDimensions === "function") {
      (selectedObject as any).initDimensions();
    }
    c.requestRenderAll();
    recordCanvasState(c);
  };

  const resetView = () => {
    setZoomLevel(100);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDownOnStage = (e: React.MouseEvent) => {
    if (mode === "pan" || e.button === 1 || e.altKey) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      };
    }
  };

  const handleMouseMoveOnStage = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUpOnStage = () => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleWheelOnStage = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoomLevel((z) => Math.min(250, Math.max(50, z + delta)));
  };

  const handleExport = async () => {
    const c = activeCanvasRef.current;
    if (!c || !activeProject || !activeSpread) return;
    setIsExporting(true);
    try {
      saveCurrentSpread();
      const pdfBytes = await exportBookToPdf(
        activeProject.spreads,
        c,
        activeSpread.id,
        currentTheme
      );
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${activeProject.title.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Error generating PDF: " + String(err));
    } finally {
      setIsExporting(false);
    }
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
              <span>Children's Picture Book Studio</span>
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
                Choose from rich storybook themes with custom corner artwork,
                warm fonts, and crisp hand-drawn pages.
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
                const theme =
                  THEMES.find((t) => t.id === proj.themeId) || THEMES[0];
                return (
                  <div
                    key={proj.id}
                    className="notebook-card"
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setActivePageNum(1);
                      resetView();
                    }}
                  >
                    <div
                      className="notebook-spine-tab"
                      style={{ backgroundColor: theme.spineColor }}
                    />
                    <div
                      className="notebook-cover"
                      style={{
                        backgroundColor: theme.paperBg,
                        borderColor: theme.borderColor,
                      }}
                    >
                      <h3 style={{ color: theme.inkColor }}>{proj.title}</h3>
                      <span
                        className="author-name"
                        style={{ color: theme.inkColor }}
                      >
                        by {proj.author}
                      </span>
                      <span className="page-count-badge">
                        {proj.spreads.length * 2} pages • {theme.name}
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
            <div className="cafe-modal large">
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
                <div className="form-fields-horizontal">
                  <div className="form-field flex-1">
                    <label>Notebook Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Fox & The Firefly"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-field flex-1">
                    <label>Author / Dedication</label>
                    <input
                      type="text"
                      placeholder="e.g. For our son"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Choose Book Theme & Corner Ornaments</label>
                  <div className="theme-catalog-grid compact">
                    {THEMES.map((thm) => (
                      <div
                        key={thm.id}
                        className={`theme-catalog-card ${
                          newThemeId === thm.id ? "selected" : ""
                        }`}
                        onClick={() => setNewThemeId(thm.id)}
                      >
                        <div
                          className="mini-book-preview small"
                          style={{
                            backgroundColor: thm.spineColor,
                            borderColor: thm.spineColor,
                          }}
                        >
                          <div
                            className="mini-spread"
                            style={{
                              backgroundColor: thm.paperBg,
                              borderColor: thm.borderColor,
                            }}
                          >
                            <span
                              className="mini-sample-text"
                              style={{
                                fontFamily: thm.recommendedFont,
                                color: thm.inkColor,
                              }}
                            >
                              Aa
                            </span>
                          </div>
                        </div>
                        <div className="theme-card-details">
                          <span className="theme-title">{thm.name}</span>
                          <span className="theme-tagline">{thm.tagline}</span>
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
            <span className="book-tone-name">{currentTheme.name}</span>
          </div>
          <button
            className="lofi-link-btn"
            onClick={() => setIsThemeModalOpen(true)}
          >
            Themes & Corners
          </button>
        </div>

        <div className="topbar-center-tools">
          <div className="history-btn-group">
            <button
              className="history-action-btn"
              disabled={!canUndo}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              className="history-action-btn"
              disabled={!canRedo}
              onClick={handleRedo}
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            >
              ↷ Redo
            </button>
          </div>

          <div className="lofi-pill-switch">
            <button
              className={`pill-option ${mode === "select" ? "active" : ""}`}
              onClick={() => setMode("select")}
            >
              Select
            </button>
            <button
              className={`pill-option ${mode === "draw" ? "active" : ""}`}
              onClick={() => setMode("draw")}
            >
              Pen
            </button>
            <button
              className={`pill-option ${mode === "pan" ? "active" : ""}`}
              onClick={() => setMode("pan")}
              title="Click and drag anywhere to move the whole book"
            >
              Pan (Hand)
            </button>
          </div>

          <div className="zoom-controller-cluster">
            <button
              className="zoom-btn"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
            >
              −
            </button>
            <span className="zoom-label" onClick={resetView} title="Click to Reset">
              {zoomLevel}%
            </span>
            <button
              className="zoom-btn"
              onClick={() => setZoomLevel((z) => Math.min(250, z + 15))}
            >
              +
            </button>
          </div>

          <div className="soft-vertical-bar" />

          <div className="type-inline-tray">
            <button className="lofi-add-btn" onClick={addTextElement}>
              + Add Words
            </button>
            {selectedObject?.type === "i-text" && (
              <>
                <select
                  className="lofi-select"
                  value={selectedFont}
                  onChange={(e) => updateTextFont(e.target.value)}
                >
                  {FONTS.map((f) => (
                    <option
                      key={f.name}
                      value={f.name}
                      style={{ fontFamily: f.name }}
                    >
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
                <input
                  type="range"
                  className="lofi-warm-slider"
                  min="16"
                  max="72"
                  value={fontSize}
                  onChange={(e) => updateTextFontSize(Number(e.target.value))}
                />
              </>
            )}
          </div>
        </div>

        <div className="topbar-right">
          <button
            className="export-leather-btn"
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? "Exporting..." : "Print Book (PDF)"}
          </button>
        </div>
      </header>

      <div className="lofi-editor-body">
        <DrawingToolbox
          mode={mode}
          onSetMode={setMode}
          brushType={brushType}
          onSetBrushType={setBrushType}
          brushSize={brushSize}
          onSetBrushSize={setBrushSize}
          brushColor={brushColor}
          onSetBrushColor={setBrushColor}
          shapeFill={shapeFill}
          onSetShapeFill={setShapeFill}
          shapeStroke={shapeStroke}
          onSetShapeStroke={setShapeStroke}
          onAddShape={handleAddShape}
          onAddSticker={handleAddSticker}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onDuplicate={handleDuplicate}
          onDelete={deleteElement}
          hasSelection={!!selectedObject}
        />

        <main
          className={`lofi-desk-viewport ${mode === "pan" ? "pan-mode" : ""} ${
            isPanning ? "grabbing" : ""
          }`}
          onMouseDown={handleMouseDownOnStage}
          onMouseMove={handleMouseMoveOnStage}
          onMouseUp={handleMouseUpOnStage}
          onWheel={handleWheelOnStage}
        >
          <div
            className="stage-book-anchor"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel / 100})`,
            }}
          >
            <SpreadCanvas
              theme={currentTheme}
              mode={mode}
              brushType={brushType}
              brushColor={brushColor}
              brushSize={brushSize}
              canvasData={activeSpread.canvasData}
              activeSide={activeSide}
              turnState={turnState}
              onCanvasReady={handleCanvasReady}
              onSelectionChange={setSelectedObject}
              onSaveState={recordCanvasState}
            />
          </div>
        </main>
      </div>

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
              className={`page-chip ${
                activePageNum === pageNum ? "active" : ""
              }`}
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

      {isThemeModalOpen && (
        <ThemePreviewModal
          currentThemeId={activeProject.themeId}
          onSelectTheme={(id) => {
            setProjects((prev) =>
              prev.map((proj) =>
                proj.id === activeProjectId ? { ...proj, themeId: id } : proj
              )
            );
          }}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}
    </div>
  );
}