import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, Shadow, config } from "fabric";
import { BookTheme } from "../types";
import { ThemeDecors } from "./ThemeDecors";
import { BrushSubtype, WandSubtype } from "./DrawingToolbox";

if (config) {
  config.devicePixelRatio = Math.max(window.devicePixelRatio || 1, 2);
}

interface SpreadCanvasProps {
  theme: BookTheme;
  mode: "select" | "draw" | "pan";
  toolType: "pencil" | "brush" | "wand";
  brushSubtype: BrushSubtype;
  wandSubtype: WandSubtype;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  canvasData: any | null;
  activeSide: "left" | "right";
  turnState: { active: boolean; direction: "next" | "prev" } | null;
  onCanvasReady: (canvas: Canvas) => void;
  onSelectionChange: (target: any | null) => void;
  onSaveState: (canvas: Canvas) => void;
  onLayersChange: (canvas: Canvas) => void;
}

export const SpreadCanvas: React.FC<SpreadCanvasProps> = ({
  theme,
  mode,
  toolType,
  brushSubtype,
  wandSubtype,
  brushColor,
  brushSize,
  brushOpacity,
  canvasData,
  activeSide,
  turnState,
  onCanvasReady,
  onSelectionChange,
  onSaveState,
  onLayersChange,
}) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const onSaveStateRef = useRef(onSaveState);
  const onLayersChangeRef = useRef(onLayersChange);
  const brushSubtypeRef = useRef(brushSubtype);

  useEffect(() => {
    onSaveStateRef.current = onSaveState;
    onLayersChangeRef.current = onLayersChange;
    brushSubtypeRef.current = brushSubtype;
  });

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: 1200,
      height: 650,
      backgroundColor: "transparent",
      isDrawingMode: mode === "draw",
      selection: mode === "select",
      enableRetinaScaling: true,
    });

    const ctx = canvas.getContext();
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushSize;
    brush.strokeLineCap = "round";
    brush.strokeLineJoin = "round";
    brush.decimate = 0;
    canvas.freeDrawingBrush = brush;

    // Fix eraser on path creation
    canvas.on("path:created", (opt: any) => {
      if (brushSubtypeRef.current === "eraser") {
        opt.path.set({
          globalCompositeOperation: "destination-out",
          stroke: "rgba(0,0,0,1)",
          selectable: false,
          evented: false,
        });
        canvas.renderAll();
      }
      onSaveStateRef.current(canvas);
      onLayersChangeRef.current(canvas);
    });

    canvas.on("object:modified", () => {
      onSaveStateRef.current(canvas);
      onLayersChangeRef.current(canvas);
    });

    canvas.on("object:added", () => onLayersChangeRef.current(canvas));
    canvas.on("object:removed", () => onLayersChangeRef.current(canvas));

    canvas.on("selection:created", (e) =>
      onSelectionChange(e.selected ? e.selected[0] : null)
    );
    canvas.on("selection:updated", (e) =>
      onSelectionChange(e.selected ? e.selected[0] : null)
    );
    canvas.on("selection:cleared", () => onSelectionChange(null));

    fabricRef.current = canvas;
    onCanvasReady(canvas);

    if (canvasData) {
      canvas.loadFromJSON(canvasData).then(() => {
        canvas.backgroundColor = "transparent";
        canvas.renderAll();
        onLayersChangeRef.current(canvas);
      });
    }

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = mode === "draw";
    canvas.selection = mode === "select";

    if (canvas.freeDrawingBrush) {
      const b = canvas.freeDrawingBrush as any;
      b.strokeLineCap = "round";
      b.strokeLineJoin = "round";
      b.decimate = 0;

      if (toolType === "wand") {
        b.width = brushSize * 1.5;
        b.color = brushColor;
        b.globalCompositeOperation = "source-over";
        b.shadow = new Shadow({
          color: brushColor,
          blur: 14,
          offsetX: 0,
          offsetY: 0,
        });
      } else if (toolType === "pencil") {
        b.shadow = null;
        b.width = Math.max(1, brushSize);
        b.color = brushColor;
        b.globalCompositeOperation = "source-over";
      } else {
        b.shadow = null;
        if (brushSubtype === "eraser") {
          // Visible preview while drawing
          b.color = "rgba(255, 255, 255, 0.85)";
          b.width = brushSize * 1.6;
          b.globalCompositeOperation = "source-over";
        } else if (brushSubtype === "watercolor") {
          b.color = brushColor;
          b.width = brushSize * 2;
          b.globalCompositeOperation = "source-over";
        } else {
          b.color = brushColor;
          b.width = brushSize;
          b.globalCompositeOperation = "source-over";
        }
      }
    }
  }, [mode, toolType, brushSubtype, wandSubtype, brushColor, brushSize, brushOpacity]);

  return (
    <div
      className="lofi-book-casing"
      style={{
        backgroundColor: theme.spineColor,
        borderColor: theme.spineColor,
      }}
    >
      <div className="spine-cloth-strip" />

      <div
        className="spread-paper-surface"
        style={{
          backgroundColor: theme.paperBg,
          borderColor: theme.borderColor,
        }}
      >
        <ThemeDecors theme={theme} />

        <div className={`active-page-rim ${activeSide}`} />

        <div
          className="canvas-viewport-layer"
          style={{ pointerEvents: mode === "pan" ? "none" : "auto" }}
        >
          <canvas ref={canvasElRef} />
        </div>

        <div className="book-gutter-depth" />

        {turnState?.active && (
          <div className={`realistic-flipper-sheet ${turnState.direction}`}>
            <div
              className="flipper-face flipper-front"
              style={{ backgroundColor: theme.paperBg }}
            >
              <div className="page-sheen" />
              <div className="curl-edge-shadow" />
            </div>
            <div
              className="flipper-face flipper-back"
              style={{ backgroundColor: theme.paperBg }}
            >
              <div className="page-sheen back" />
              <div className="curl-edge-shadow back" />
            </div>
          </div>
        )}

        {turnState?.active && (
          <div className={`gutter-cast-shadow ${turnState.direction}`} />
        )}
      </div>
    </div>
  );
};