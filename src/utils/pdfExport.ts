import { PDFDocument } from "pdf-lib";
import { Canvas, StaticCanvas } from "fabric";
import { BookSpread, BookTheme } from "../types";

function base64ToUint8(base64Data: string): Uint8Array {
  const pureBase64 = base64Data.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
  const binaryString = atob(pureBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function drawThematicFrameToContext(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: BookTheme
) {
  ctx.save();
  ctx.fillStyle = theme.paperBg;
  ctx.fillRect(0, 0, width, height);

  const half = width / 2;

  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, half - 32, height - 32);
  ctx.strokeRect(half + 16, 16, half - 32, height - 32);

  ctx.strokeStyle = theme.frameColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, half - 48, height - 48);
  ctx.strokeRect(half + 24, 24, half - 48, height - 48);

  ctx.fillStyle = theme.accentColor;
  ctx.beginPath();
  ctx.arc(36, 36, 6, 0, Math.PI * 2);
  ctx.arc(36, height - 36, 6, 0, Math.PI * 2);
  ctx.arc(width - 36, 36, 6, 0, Math.PI * 2);
  ctx.arc(width - 36, height - 36, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export async function exportBookToPdf(
  spreads: BookSpread[],
  activeCanvas: Canvas,
  activeSpreadId: string,
  theme: BookTheme
): Promise<Uint8List> {
  const pdfDoc = await PDFDocument.create();

  const offscreenEl = document.createElement("canvas");
  offscreenEl.width = 1200;
  offscreenEl.height = 650;
  const offCtx = offscreenEl.getContext("2d")!;

  const renderer = new StaticCanvas(offscreenEl, {
    width: 1200,
    height: 650,
  });

  for (const spread of spreads) {
    let dataUrl: string;

    if (spread.id === activeSpreadId) {
      const originalVpt = [...activeCanvas.viewportTransform];
      activeCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      drawThematicFrameToContext(offCtx, 1200, 650, theme);

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 1200;
      tempCanvas.height = 650;
      const tempCtx = tempCanvas.getContext("2d")!;

      drawThematicFrameToContext(tempCtx, 1200, 650, theme);
      tempCtx.drawImage(activeCanvas.lowerCanvasEl, 0, 0);

      dataUrl = tempCanvas.toDataURL("image/png");
      activeCanvas.setViewportTransform(originalVpt);
      activeCanvas.renderAll();
    } else {
      drawThematicFrameToContext(offCtx, 1200, 650, theme);
      if (spread.canvasData) {
        await renderer.loadFromJSON(spread.canvasData);
      } else {
        renderer.clear();
      }
      renderer.renderAll();

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 1200;
      tempCanvas.height = 650;
      const tempCtx = tempCanvas.getContext("2d")!;

      drawThematicFrameToContext(tempCtx, 1200, 650, theme);
      tempCtx.drawImage(renderer.lowerCanvasEl, 0, 0);

      dataUrl = tempCanvas.toDataURL("image/png");
    }

    const pngBytes = base64ToUint8(dataUrl);
    const embeddedPng = await pdfDoc.embedPng(pngBytes);

    const pdfPage = pdfDoc.addPage([1200, 650]);
    pdfPage.drawImage(embeddedPng, {
      x: 0,
      y: 0,
      width: 1200,
      height: 650,
    });
  }

  renderer.dispose();
  return await pdfDoc.save();
}