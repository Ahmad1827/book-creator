import React from "react";
import { BookTheme } from "../types";
import { THEMES } from "../constants";

interface ThemePreviewModalProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
}

export const ThemePreviewModal: React.FC<ThemePreviewModalProps> = ({
  currentThemeId,
  onSelectTheme,
  onClose,
}) => {
  return (
    <div className="cafe-modal-backdrop">
      <div className="cafe-modal large">
        <div className="modal-title-row">
          <div>
            <h3>Book Aesthetic Themes</h3>
            <span className="modal-subtitle">
              Themes come with dedicated page borders, corners, spine materials, and matched palettes.
            </span>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="theme-catalog-grid">
          {THEMES.map((theme) => {
            const isSelected = theme.id === currentThemeId;
            return (
              <div
                key={theme.id}
                className={`theme-catalog-card ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectTheme(theme.id)}
              >
                <div
                  className="mini-book-preview"
                  style={{
                    backgroundColor: theme.spineColor,
                    borderColor: theme.spineColor,
                  }}
                >
                  <div
                    className="mini-spread"
                    style={{
                      backgroundColor: theme.paperBg,
                      borderColor: theme.borderColor,
                    }}
                  >
                    <div
                      className="mini-decor-corner tl"
                      style={{ backgroundColor: theme.frameColor }}
                    />
                    <div
                      className="mini-decor-corner br"
                      style={{ backgroundColor: theme.frameColor }}
                    />
                    <div className="mini-page left">
                      <span
                        className="mini-sample-text"
                        style={{
                          fontFamily: theme.recommendedFont,
                          color: theme.inkColor,
                        }}
                      >
                        Chapter One
                      </span>
                    </div>
                    <div className="mini-gutter" />
                    <div className="mini-page right">
                      <div
                        className="mini-accent-stamp"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                  </div>
                </div>

                <div className="theme-card-details">
                  <div className="theme-card-head">
                    <span className="theme-title">{theme.name}</span>
                    <span className="font-tag">{theme.recommendedFont}</span>
                  </div>
                  <p className="theme-tagline">{theme.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer-btns">
          <button className="cafe-btn primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};