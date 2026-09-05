import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush } from "fabric";
import { PaperStyle } from "../types";

interface SpreadCanvasProps {
  paper: PaperStyle;
  mode: "select" | "draw";
  brushColor: string;
  brushSize: number;
  canvasData: any | null;
  activeSide: "left" | "right";
  turnState: {
    active: boolean;
    direction: "next" | "prev";
  } | null;
  onCanvasReady: (canvas: Canvas) => void;
  onSelectionChange: (target: any | null) => void;
}

export const SpreadCanvas: React.FC<SpreadCanvasProps> = ({
  paper,
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
      backgroundColor: paper.bg,
      isDrawingMode: mode === "draw",
      selection: true,
      renderOnAddRemove: true,
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
        canvas.backgroundColor = paper.bg;
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
    canvas.backgroundColor = paper.bg;
    canvas.renderAll();
  }, [paper]);

  return (
    <div className="lofi-desk-stage">
      <div className="desk-mat">
        <div
          className="book-casing"
          style={{
            backgroundColor: paper.spine,
            borderColor: paper.spine,
          }}
        >
          <div className="spine-cloth-strip" />

          <div
            className="spread-body"
            style={{
              backgroundColor: paper.bg,
              borderColor: paper.border,
            }}
          >
            <div className={`active-page-rim ${activeSide}`} />

            <div className="canvas-container-layer">
              <canvas ref={canvasElRef} />
            </div>

            <div className="book-gutter-depth" />

            {turnState?.active && (
              <div
                className={`realistic-flipper-sheet ${turnState.direction}`}
              >
                <div
                  className="flipper-face flipper-front"
                  style={{ backgroundColor: paper.bg }}
                >
                  <div className="page-sheen" />
                  <div className="curl-edge-shadow" />
                </div>
                <div
                  className="flipper-face flipper-back"
                  style={{ backgroundColor: paper.bg }}
                >
                  <div className="page-sheen back" />
                  <div className="curl-edge-shadow back" />
                </div>
              </div>
            )}

            {turnState?.active && (
              <div
                className={`gutter-cast-shadow ${turnState.direction}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};