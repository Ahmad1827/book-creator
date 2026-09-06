import React, { useEffect, useRef } from "react";
import { Canvas, PencilBrush, ActiveSelection, config } from "fabric";
import { BookTheme } from "../types";
import { ThemeDecors } from "./ThemeDecors";
import { BrushSubtype, WandMode } from "./DrawingToolbox";

if (config) {
  config.devicePixelRatio = Math.max(window.devicePixelRatio || 1, 2);
}

interface SpreadCanvasProps {
  theme: BookTheme;
  mode: "select" | "draw" | "pan";
  toolType: "pencil" | "brush" | "wand";
  brushSubtype: BrushSubtype;
  wandMode: WandMode;
  wandColor: string;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  activeLayerId: string;
  canvasData: any | null;
  activeSide: "left" | "right";
  turnState: { active: boolean; direction: "next" | "prev" } | null;
  onCanvasReady: (canvas: Canvas) => void;
  onSelectionChange: (target: any | null) => void;
  onSelectLayerByTouch: (layerId: string) => void;
  onSaveState: (canvas: Canvas) => void;
}

export const SpreadCanvas: React.FC<SpreadCanvasProps> = ({
  theme,
  mode,
  toolType,
  brushSubtype,
  wandMode,
  wandColor,
  brushColor,
  brushSize,
  brushOpacity,
  activeLayerId,
  canvasData,
  activeSide,
  turnState,
  onCanvasReady,
  onSelectionChange,
  onSelectLayerByTouch,
  onSaveState,
}) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const activeLayerIdRef = useRef(activeLayerId);
  const onSaveStateRef = useRef(onSaveState);
  const onSelectLayerByTouchRef = useRef(onSelectLayerByTouch);
  const brushSubtypeRef = useRef(brushSubtype);
  const toolTypeRef = useRef(toolType);
  const wandModeRef = useRef(wandMode);
  const wandColorRef = useRef(wandColor);

  useEffect(() => {
    activeLayerIdRef.current = activeLayerId;
    onSaveStateRef.current = onSaveState;
    onSelectLayerByTouchRef.current = onSelectLayerByTouch;
    brushSubtypeRef.current = brushSubtype;
    toolTypeRef.current = toolType;
    wandModeRef.current = wandMode;
    wandColorRef.current = wandColor;
  });

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: 1200,
      height: 650,
      backgroundColor: "transparent",
      isDrawingMode: mode === "draw" && toolType !== "wand",
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

    canvas.on("path:created", (opt: any) => {
      opt.path.set("layerId", activeLayerIdRef.current);

      if (brushSubtypeRef.current === "eraser") {
        opt.path.set({
          globalCompositeOperation: "destination-out",
          stroke: "rgba(0,0,0,1)",
          selectable: false,
          evented: false,
        });
      }
      canvas.renderAll();
      onSaveStateRef.current(canvas);
    });

    canvas.on("mouse:down", (e) => {
      if (toolTypeRef.current !== "wand") return;

      const target = e.target as any;
      if (!target) return;

      const newColor = wandColorRef.current;

      if (wandModeRef.current === "recolor") {
        if (target.type === "path" && !target.stickerId) {
          target.set("stroke", newColor);
        } else if (target.type === "i-text") {
          target.set("fill", newColor);
        } else {
          target.set("fill", newColor);
          if (target.stroke && target.stroke !== "transparent") {
            target.set("stroke", newColor);
          }
        }
        canvas.requestRenderAll();
        onSaveStateRef.current(canvas);
      } else if (wandModeRef.current === "select_similar") {
        const targetColor =
          (target.stroke && target.stroke !== "transparent" ? target.stroke : target.fill) || "";
        const normTarget = targetColor.toString().toLowerCase().trim();

        const matching = canvas.getObjects().filter((obj: any) => {
          if (obj.layerId && obj.layerId !== activeLayerIdRef.current) return false;
          const s = (obj.stroke || "").toString().toLowerCase().trim();
          const f = (obj.fill || "").toString().toLowerCase().trim();
          return s === normTarget || f === normTarget;
        });

        if (matching.length > 0) {
          canvas.discardActiveObject();
          const sel = new ActiveSelection(matching, { canvas });
          canvas.setActiveObject(sel);
          canvas.requestRenderAll();
        }
      }
    });

    canvas.on("object:modified", () => {
      onSaveStateRef.current(canvas);
    });

    canvas.on("selection:created", (e) => {
      const selected = e.selected ? e.selected[0] : null;
      onSelectionChange(selected);
      if (selected && (selected as any).layerId) {
        onSelectLayerByTouchRef.current((selected as any).layerId);
      }
    });

    canvas.on("selection:updated", (e) => {
      const selected = e.selected ? e.selected[0] : null;
      onSelectionChange(selected);
      if (selected && (selected as any).layerId) {
        onSelectLayerByTouchRef.current((selected as any).layerId);
      }
    });

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

    const isWand = toolType === "wand";
    canvas.isDrawingMode = mode === "draw" && !isWand;
    canvas.selection = mode === "select";
    canvas.defaultCursor = isWand ? "crosshair" : mode === "pan" ? "grab" : "default";

    if (canvas.freeDrawingBrush) {
      const b = canvas.freeDrawingBrush as any;
      b.strokeLineCap = "round";
      b.strokeLineJoin = "round";
      b.decimate = 0;

      if (toolType === "pencil") {
        b.shadow = null;
        b.width = Math.max(1, brushSize);
        b.color = brushColor;
        b.globalCompositeOperation = "source-over";
      } else {
        b.shadow = null;
        if (brushSubtype === "eraser") {
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
  }, [mode, toolType, brushSubtype, brushColor, brushSize, brushOpacity]);

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
          className={`canvas-viewport-layer ${toolType === "wand" ? "wand-active" : ""}`}
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