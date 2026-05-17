"use client";

import { Check, Palette, RotateCcw, Sun } from "lucide-react";
import { useState } from "react";
import {
  defaultFont,
  defaultTheme,
  FONT_STORAGE_KEY,
  fontOptions,
  isFontId,
  isThemeId,
  THEME_STORAGE_KEY,
  themeOptions,
  type FontId,
  type ThemeId,
} from "@/lib/theme";

type Props = {
  variant?: "popover" | "panel";
};

export function ThemeCustomizer({ variant = "panel" }: Props) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(storedTheme) ? storedTheme : defaultTheme;
  });
  const [font, setFont] = useState<FontId>(() => {
    if (typeof window === "undefined") return defaultFont;
    const storedFont = window.localStorage.getItem(FONT_STORAGE_KEY);
    return isFontId(storedFont) ? storedFont : defaultFont;
  });
  const [open, setOpen] = useState(false);

  function applyTheme(nextTheme: ThemeId) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  function applyFont(nextFont: FontId) {
    setFont(nextFont);
    document.documentElement.dataset.font = nextFont;
    window.localStorage.setItem(FONT_STORAGE_KEY, nextFont);
  }

  function resetTheme() {
    applyTheme(defaultTheme);
    applyFont(defaultFont);
  }

  const content = (
    <div className="theme-panel-content">
      <div className="theme-panel-header">
        <span>
          <Palette size={18} />
          Appearance
        </span>
        <button className="icon-button" onClick={resetTheme} title="Reset appearance" type="button">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="theme-section">
        <span className="theme-label">Color</span>
        <div className="theme-grid">
          {themeOptions.map((option) => (
            <button className={`theme-choice ${theme === option.id ? "active" : ""}`} key={option.id} onClick={() => applyTheme(option.id)} type="button">
              <span className="swatch-row" aria-hidden="true">
                {option.swatches.map((color) => (
                  <span className="swatch-dot" key={color} style={{ background: color }} />
                ))}
              </span>
              <span>
                <strong>{option.name}</strong>
                <small>{option.note}</small>
              </span>
              {theme === option.id ? <Check size={16} /> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-section">
        <span className="theme-label">Font</span>
        <div className="font-grid">
          {fontOptions.map((option) => (
            <button className={`font-choice ${font === option.id ? "active" : ""}`} data-font-preview={option.id} key={option.id} onClick={() => applyFont(option.id)} type="button">
              <span>
                <strong>{option.name}</strong>
                <small>{option.sample}</small>
              </span>
              {font === option.id ? <Check size={16} /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === "popover") {
    return (
      <div className="theme-popover">
        <button className="theme-trigger" onClick={() => setOpen((value) => !value)} title="Change appearance" type="button">
          <Sun size={18} />
        </button>
        {open ? <div className="theme-menu">{content}</div> : null}
      </div>
    );
  }

  return <div className="panel theme-settings-panel">{content}</div>;
}
