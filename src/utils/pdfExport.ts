import { PDFDocument } from "pdf-lib";
import { Canvas } from "fabric";
import { BookSpread } from "../types";

export async function exportBookToPdf(
  spreads: BookSpread[],
  currentCanvas: Canvas,
  currentSpreadId: string
): Promise<Uint8List> {
  const pdfDoc = await PDFDocument.create();

  const offscreenEl = document.createElement("canvas");
  offscreenEl.width = 1400;
  offscreenEl.height = 700;
  const workerCanvas = new Canvas(offscreenEl, {
    width: 1400,
    height: 700,
  });

  for (const spread of spreads) {
    let data = spread.canvasData;
    if (spread.id === currentSpreadId) {
      data = currentCanvas.toJSON();
    }

    if (data) {
      await workerCanvas.loadFromJSON(data);
    } else {
      workerCanvas.clear();
      workerCanvas.backgroundColor = "#ffffff";
    }

    workerCanvas.renderAll();

    const dataUrl = workerCanvas.toDataURL({
      format: "png",
      multiplier: 2,
    });

    const pngBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngBytes);

    const pdfPage = pdfDoc.addPage([1400, 700]);
    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 1400,
      height: 700,
    });
  }

  workerCanvas.dispose();
  return await pdfDoc.save();
}