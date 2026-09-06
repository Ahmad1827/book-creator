import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, config } from "fabric";
import { BookTheme } from "../types";
import { ThemeDecors } from "./ThemeDecors";

if (config) {
  config.devicePixelRatio = Math.max(window.devicePixelRatio || 1, 2);
}

interface SpreadCanvasProps {
  theme: BookTheme;
  mode: "select" | "draw" | "pan";
  brushColor: string;
  brushSize: number;
  canvasData: any | null;
  activeSide: "left" | "right";
  turnState: { active: boolean; direction: "next" | "prev" } | null;
  onCanvasReady: (canvas: Canvas) => void;
  onSelectionChange: (target: any | null) => void;
  onSaveState: (canvas: Canvas) => void;
}

export const SpreadCanvas: React.FC<SpreadCanvasProps> = ({
  theme,
  mode,
  brushColor,
  brushSize,
  canvasData,
  activeSide,
  turnState,
  onCanvasReady,
  onSelectionChange,
  onSaveState,
}) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const onSaveStateRef = useRef(onSaveState);
  useEffect(() => {
    onSaveStateRef.current = onSaveState;
  }, [onSaveState]);

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

    canvas.on("path:created", () => {
      onSaveStateRef.current(canvas);
    });

    canvas.on("object:modified", () => {
      onSaveStateRef.current(canvas);
    });

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
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.strokeLineCap = "round";
      canvas.freeDrawingBrush.strokeLineJoin = "round";
      canvas.freeDrawingBrush.decimate = 0;
    }
  }, [mode, brushColor, brushSize]);

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