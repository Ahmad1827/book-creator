import React, { useState } from "react";
import { BookProject, BookFormat, BookTheme } from "../types";
import { BOOK_FORMATS, BOOK_THEMES } from "../constants";

interface ProjectHubProps {
  projects: BookProject[];
  onOpenProject: (project: BookProject) => void;
  onCreateProject: (
    title: string,
    author: string,
    formatId: BookFormat["id"],
    themeId: string
  ) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({
  projects,
  onOpenProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedFormatId, setSelectedFormatId] = useState<BookFormat["id"]>("square");
  const [selectedThemeId, setSelectedThemeId] = useState<string>("parchment_tales");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateProject(title, author.trim() || "Author", selectedFormatId, selectedThemeId);
    setTitle("");
    setAuthor("");
    setIsCreating(false);
  };

  return (
    <div className="hub-viewport">
      <header className="hub-topbar">
        <div className="hub-title-block">
          <div className="hub-glow-badge" />
          <h1>Storybook Atelier</h1>
          <span className="hub-version-tag">Desktop Studio</span>
        </div>
        <button className="hub-create-trigger-btn" onClick={() => setIsCreating(true)}>
          + Create New Book
        </button>
      </header>

      <main className="hub-shelf-area">
        {projects.length === 0 ? (
          <div className="hub-empty-state">
            <div className="empty-book-illusion" />
            <h2>No books on your shelf yet</h2>
            <p>Design a physical-grade children's book with custom formats, paper, and textures.</p>
            <button className="hub-primary-action-btn" onClick={() => setIsCreating(true)}>
              Start First Book
            </button>
          </div>
        ) : (
          <div className="hub-library-grid">
            {projects.map((proj) => {
              const theme = BOOK_THEMES.find((t) => t.id === proj.themeId) || BOOK_THEMES[0];
              const format = BOOK_FORMATS.find((f) => f.id === proj.formatId) || BOOK_FORMATS[0];

              return (
                <div key={proj.id} className="book-spine-card" onClick={() => onOpenProject(proj)}>
                  <div
                    className="book-cover-simulation"
                    style={{ background: theme.coverTexture, borderColor: theme.accentColor }}
                  >
                    <div className="simulated-foil-ribbon" style={{ background: theme.accentColor }} />
                    <div className="simulated-cover-content">
                      <span className="sim-title" style={{ fontFamily: theme.primaryFont }}>
                        {proj.title}
                      </span>
                      <span className="sim-author">By {proj.author}</span>
                      <span className="sim-format-tag">{format.label}</span>
                    </div>
                  </div>
                  <div className="book-card-footer">
                    <div>
                      <h4>{proj.title}</h4>
                      <p>{proj.spreads.length * 2} Pages • {theme.name}</p>
                    </div>
                    <button
                      className="hub-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isCreating && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Create New Book Project</h3>
              <button className="modal-close-btn" onClick={() => setIsCreating(false)}>
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
                    placeholder="e.g. The Fox & The Firefly"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Author / Dedication</label>
                  <input
                    type="text"
                    placeholder="e.g. For our son"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Physical Book Format</label>
                <div className="format-selection-grid">
                  {BOOK_FORMATS.map((fmt) => (
                    <div
                      key={fmt.id}
                      className={`format-card-option ${selectedFormatId === fmt.id ? "selected" : ""}`}
                      onClick={() => setSelectedFormatId(fmt.id)}
                    >
                      <div className={`format-silhouette ${fmt.id}`} />
                      <span className="format-name">{fmt.label}</span>
                      <span className="format-desc">{fmt.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Story Theme & Material Texture</label>
                <div className="theme-selection-grid">
                  {BOOK_THEMES.map((thm) => (
                    <div
                      key={thm.id}
                      className={`theme-card-option ${selectedThemeId === thm.id ? "selected" : ""}`}
                      onClick={() => setSelectedThemeId(thm.id)}
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
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Generate Atelier Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};