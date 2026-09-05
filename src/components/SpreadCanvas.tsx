import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush } from "fabric";
import { BookTheme } from "../types";
import { ThemeDecors } from "./ThemeDecors";

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
}) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: 1200,
      height: 650,
      backgroundColor: "transparent",
      isDrawingMode: mode === "draw",
      selection: mode === "select",
    });

    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushSize;
    brush.decimate = 2;
    canvas.freeDrawingBrush = brush;

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