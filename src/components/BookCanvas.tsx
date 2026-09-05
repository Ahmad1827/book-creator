import React, { useEffect, useRef } from "react";
import { Canvas, IText, PencilBrush } from "fabric";

interface BookCanvasProps {
  mode: "draw" | "select";
  brushColor: string;
  brushWidth: number;
  activeFont: string;
  backgroundColor: string;
  onCanvasReady: (canvas: Canvas) => void;
}

export const BookCanvas: React.FC<BookCanvasProps> = ({
  mode,
  brushColor,
  brushWidth,
  activeFont,
  backgroundColor,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 1200,
      height: 600,
      backgroundColor: backgroundColor,
      isDrawingMode: mode === "draw",
    });

    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushWidth;
    canvas.freeDrawingBrush = brush;

    fabricCanvasRef.current = canvas;
    onCanvasReady(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = mode === "draw";

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }
  }, [mode, brushColor, brushWidth]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.backgroundColor = backgroundColor;
    canvas.renderAll();
  }, [backgroundColor]);

  return (
    <div className="canvas-wrapper" style={{ border: "2px solid #ddd", borderRadius: 8, overflow: "hidden", display: "inline-block" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};