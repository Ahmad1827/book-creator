import React, { useState } from "react";
import { BookProject, BookFormat } from "../types";
import { BOOK_FORMATS, BOOK_THEMES } from "../constants";

interface EditBookModalProps {
  project: BookProject;
  onClose: () => void;
  onSave: (updated: Partial<BookProject>) => void;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({
  project,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(project.title);
  const [author, setAuthor] = useState(project.author);
  const [formatId, setFormatId] = useState<BookFormat["id"]>(project.formatId);
  const [themeId, setThemeId] = useState<string>(project.themeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, author, formatId, themeId });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Edit Book Specifications</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-input-row">
            <div className="form-group flex-1">
              <label>Book Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Author / Dedication</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Format</label>
            <div className="format-selection-grid compact">
              {BOOK_FORMATS.map((fmt) => (
                <div
                  key={fmt.id}
                  className={`format-card-option ${formatId === fmt.id ? "selected" : ""}`}
                  onClick={() => setFormatId(fmt.id)}
                >
                  <span className="format-name">{fmt.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Theme & Textures</label>
            <div className="theme-selection-grid">
              {BOOK_THEMES.map((thm) => (
                <div
                  key={thm.id}
                  className={`theme-card-option ${themeId === thm.id ? "selected" : ""}`}
                  onClick={() => setThemeId(thm.id)}
                  style={{ borderLeftColor: thm.accentColor }}
                >
                  <div className="theme-swatch-box" style={{ background: thm.coverTexture }}>
                    <div
                      className="theme-swatch-page"
                      style={{ background: thm.pageBackground }}
                    />
                  </div>
                  <div className="theme-info-box">
                    <span className="theme-name">{thm.name}</span>
                    <span className="theme-sub">{thm.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};