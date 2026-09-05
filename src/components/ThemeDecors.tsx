import React from "react";
import { BookTheme } from "../types";

export const ThemeDecors: React.FC<{ theme: BookTheme }> = ({ theme }) => {
  const color = theme.frameColor;

  const renderCornerSvg = (placement: "tl" | "bl" | "tr" | "br") => {
    const isLeft = placement === "tl" || placement === "bl";
    const isTop = placement === "tl" || placement === "tr";

    const transform = `scale(${isLeft ? 1 : -1}, ${isTop ? 1 : -1})`;

    if (theme.decorType === "botanical") {
      return (
        <svg
          viewBox="0 0 70 70"
          className={`corner-ornament-svg ${placement}`}
          style={{ transform }}
        >
          <path
            d="M 5 65 Q 10 20 65 5 Q 35 15 25 35 Q 15 45 5 65 Z"
            fill={color}
            fillOpacity="0.8"
          />
          <path
            d="M 12 40 Q 22 24 40 22 Q 26 34 12 40 Z"
            fill={theme.accentColor}
          />
          <circle cx="18" cy="20" r="3" fill={theme.accentColor} />
          <circle cx="28" cy="14" r="2.5" fill={color} />
          <circle cx="44" cy="10" r="3" fill={theme.accentColor} />
        </svg>
      );
    }

    if (theme.decorType === "celestial") {
      return (
        <svg
          viewBox="0 0 70 70"
          className={`corner-ornament-svg ${placement}`}
          style={{ transform }}
        >
          <path
            d="M 8 8 L 8 40 M 8 8 L 40 8"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 22 10 A 10 10 0 0 0 10 22 A 10 10 0 1 1 22 10 Z"
            fill={theme.accentColor}
          />
          <polygon
            points="32,16 35,22 41,25 35,28 32,34 29,28 23,25 29,22"
            fill={color}
          />
          <circle cx="16" cy="36" r="2" fill={theme.accentColor} />
          <circle cx="40" cy="12" r="1.5" fill={color} />
        </svg>
      );
    }

    if (theme.decorType === "victorian") {
      return (
        <svg
          viewBox="0 0 70 70"
          className={`corner-ornament-svg ${placement}`}
          style={{ transform }}
        >
          <path
            d="M 6 6 L 6 45 Q 6 18 35 18 L 45 18 M 6 6 L 45 6 Q 18 6 18 35 L 18 45"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 14 14 Q 28 14 32 32 Q 14 28 14 14 Z"
            fill={theme.accentColor}
            fillOpacity="0.7"
          />
          <circle cx="6" cy="6" r="4" fill={color} />
        </svg>
      );
    }

    if (theme.decorType === "sakura") {
      return (
        <svg
          viewBox="0 0 70 70"
          className={`corner-ornament-svg ${placement}`}
          style={{ transform }}
        >
          <path
            d="M 4 60 Q 20 40 35 35 Q 50 30 65 4"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="28" cy="24" r="5" fill={theme.accentColor} />
          <circle cx="40" cy="18" r="4" fill={color} fillOpacity="0.8" />
          <circle cx="16" cy="40" r="4.5" fill={theme.accentColor} fillOpacity="0.9" />
          <circle cx="48" cy="30" r="3" fill={color} />
        </svg>
      );
    }

    if (theme.decorType === "chai") {
      return (
        <svg
          viewBox="0 0 70 70"
          className={`corner-ornament-svg ${placement}`}
          style={{ transform }}
        >
          <line x1="8" y1="8" x2="8" y2="48" stroke={color} strokeWidth="3" strokeDasharray="5,4" />
          <line x1="8" y1="8" x2="48" y2="8" stroke={color} strokeWidth="3" strokeDasharray="5,4" />
          <rect x="14" y="14" width="14" height="14" fill={theme.accentColor} transform="rotate(45 21 21)" />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 70 70"
        className={`corner-ornament-svg ${placement}`}
        style={{ transform }}
      >
        <polygon points="4,4 50,4 32,22 22,22 22,32 4,50" fill={color} />
        <circle cx="14" cy="14" r="3" fill={theme.paperBg} />
        <circle cx="34" cy="10" r="2" fill={theme.paperBg} />
        <circle cx="10" cy="34" r="2" fill={theme.paperBg} />
      </svg>
    );
  };

  return (
    <div className="theme-frame-overlay">
      <div className="page-border-box left" style={{ borderColor: theme.borderColor }}>
        <div className="page-inner-rule" style={{ borderColor: color }} />
        {renderCornerSvg("tl")}
        {renderCornerSvg("bl")}
      </div>
      <div className="page-border-box right" style={{ borderColor: theme.borderColor }}>
        <div className="page-inner-rule" style={{ borderColor: color }} />
        {renderCornerSvg("tr")}
        {renderCornerSvg("br")}
      </div>
    </div>
  );
};