import { useState, useRef } from "react";
import { Canvas, IText } from "fabric";
import { BookCanvas } from "./components/BookCanvas";
import "./App.css";

const FONTS = [
  "Patrick Hand",
  "Fredoka",
  "Caveat",
  "Sniglet",
  "Gaegu",
  "serif",
];

const THEMES = [
  { name: "Crisp White", color: "#ffffff" },
  { name: "Warm Parchment", color: "#fbf0d9" },
  { name: "Soft Pastel Pink", color: "#fde2e4" },
  { name: "Pale Mint", color: "#e2ece9" },
  { name: "Chalkboard", color: "#2b2d42" },
];

export default function App() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [mode, setMode] = useState<"draw" | "select">("select");
  const [brushColor, setBrushColor] = useState<string>("#333333");
  const [brushWidth, setBrushWidth] = useState<number>(4);
  const [selectedFont, setSelectedFont] = useState<string>("Patrick Hand");
  const [themeColor, setThemeColor] = useState<string>("#fbf0d9");

  const addTextBox = () => {
    if (!canvas) return;

    const text = new IText("Click to write your story...", {
      left: 100,
      top: 100,
      fontFamily: selectedFont,
      fontSize: 28,
      fill: themeColor === "#2b2d42" ? "#ffffff" : "#2c1810",
      width: 300,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    setMode("select");
    canvas.renderAll();
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      (activeObject as IText).set("fontFamily", font);
      canvas.renderAll();
    }
  };

  const undo = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = themeColor;
    canvas.renderAll();
  };

  return (
    <div className="app-container">
      <header className="toolbar">
        <div className="tool-group">
          <button
            className={mode === "select" ? "active" : ""}
            onClick={() => setMode("select")}
          >
            Select / Move
          </button>
          <button
            className={mode === "draw" ? "active" : ""}
            onClick={() => setMode("draw")}
          >
            Draw
          </button>
          <button onClick={undo}>Undo</button>
          <button onClick={clearCanvas}>Clear</button>
        </div>

        <div className="tool-group">
          <label>Theme: </label>
          <select
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
          >
            {THEMES.map((theme) => (
              <option key={theme.name} value={theme.color}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="tool-group">
          <label>Font: </label>
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
          >
            {FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <button onClick={addTextBox}>+ Add Text</button>
        </div>

        {mode === "draw" && (
          <div className="tool-group">
            <label>Color: </label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
            />
            <label>Size: </label>
            <input
              type="range"
              min="1"
              max="40"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
            />
          </div>
        )}
      </header>

      <main className="editor-viewport">
        <BookCanvas
          mode={mode}
          brushColor={brushColor}
          brushWidth={brushWidth}
          activeFont={selectedFont}
          backgroundColor={themeColor}
          onCanvasReady={setCanvas}
        />
      </main>
    </div>
  );
}