import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush } from "fabric";
import { BookTheme, BookFormat } from "../types";

interface SpreadCanvasProps {
  theme: BookTheme;
  format: BookFormat;
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
  format,
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

  const spreadWidth = format.pageWidth * 2;
  const spreadHeight = format.pageHeight;

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: spreadWidth,
      height: spreadHeight,
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
  }, [spreadWidth, spreadHeight]);

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
    <div
      className={`grand-book-case ${flipDirection ? `turning-${flipDirection}` : ""}`}
      style={{
        width: `${spreadWidth + 60}px`,
        height: `${spreadHeight + 50}px`,
        background: theme.coverTexture,
      }}
    >
      <div className="headband headband-top" />
      <div className="headband headband-bottom" />

      <div className="pages-depth-stack left-stack" />
      <div className="pages-depth-stack right-stack" />

      <div
        className="book-leaf-block"
        style={{
          width: `${spreadWidth}px`,
          height: `${spreadHeight}px`,
          background: theme.pageBackground,
        }}
      >
        <div className="paper-grain-overlay" style={{ background: theme.pageOverlayStyle }} />

        <div className={`page-side-zone left ${activeSide === "left" ? "focused" : ""}`} />
        <div className={`page-side-zone right ${activeSide === "right" ? "focused" : ""}`} />

        <div className="fabric-canvas-container">
          <canvas ref={canvasElRef} />
        </div>

        <div className="book-gutter-shadow" />
        <div className="book-spine-crease" style={{ background: theme.spineGutterColor }} />

        <div
          className="dynamic-turn-leaf"
          style={{
            background: theme.pageBackground,
            width: `${format.pageWidth}px`,
            height: `${spreadHeight}px`,
          }}
        >
          <div className="paper-grain-overlay" style={{ background: theme.pageOverlayStyle }} />
        </div>
      </div>
    </div>
  );
};