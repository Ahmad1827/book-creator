import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush } from "fabric";
import { BookTheme } from "../types";

interface SpreadCanvasProps {
  theme: BookTheme;
  mode: "select" | "draw";
  brushColor: string;
  brushSize: number;
  canvasData: any | null;
  activeSide: "left" | "right";
  flipDirection: "next" | "prev" | null;
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
  flipDirection,
  onCanvasReady,
  onSelectionChange,
}) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: 1400,
      height: 700,
      backgroundColor: theme.pageBackground,
      isDrawingMode: mode === "draw",
      selection: true,
    });

    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    canvas.on("selection:created", (e) => onSelectionChange(e.selected ? e.selected[0] : null));
    canvas.on("selection:updated", (e) => onSelectionChange(e.selected ? e.selected[0] : null));
    canvas.on("selection:cleared", () => onSelectionChange(null));

    fabricRef.current = canvas;
    onCanvasReady(canvas);

    if (canvasData) {
      canvas.loadFromJSON(canvasData).then(() => {
        canvas.backgroundColor = theme.pageBackground;
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
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [mode, brushColor, brushSize]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = theme.pageBackground;
    canvas.renderAll();
  }, [theme]);

  return (
    <div className={`spread-perspective-stage ${flipDirection ? `turn-${flipDirection}` : ""}`}>
      <div className="spread-frame-container" style={{ borderColor: theme.borderColor }}>
        <div className={`page-focus-indicator left ${activeSide === "left" ? "focused" : ""}`} />
        <div className={`page-focus-indicator right ${activeSide === "right" ? "focused" : ""}`} />

        <div className="canvas-wrapper">
          <canvas ref={canvasElRef} />
        </div>

        <div className="spine-divider" style={{ background: theme.spineColor }}>
          <div className="spine-crease-shadow" />
        </div>

        <div className="page-flip-flap" style={{ background: theme.pageBackground }} />
      </div>
    </div>
  );
};