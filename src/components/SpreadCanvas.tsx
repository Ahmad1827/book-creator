import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, Line } from "fabric";
import { BookTheme } from "../types";

interface SpreadCanvasProps {
  theme: BookTheme;
  mode: "select" | "draw";
  brushColor: string;
  brushSize: number;
  canvasData: any | null;
  onCanvasReady: (canvas: Canvas) => void;
  onSelectionChange: (target: any | null) => void;
}

export const SpreadCanvas: React.FC<SpreadCanvasProps> = ({
  theme,
  mode,
  brushColor,
  brushSize,
  canvasData,
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
    <div className="spread-frame-container">
      <div className="spread-sheet" style={{ borderColor: theme.borderColor }}>
        <canvas ref={canvasElRef} />
        <div className="spine-divider" style={{ background: theme.spineColor }}>
          <div className="spine-crease-shadow" />
        </div>
      </div>
    </div>
  );
};