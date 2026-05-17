export const THEME_STORAGE_KEY = "matheye-theme";
export const FONT_STORAGE_KEY = "matheye-font";

export type ThemeId = "midnight" | "paper" | "mono" | "aurora" | "solar" | "berry" | "forest";
export type FontId = "system" | "serif" | "rounded" | "mono";

export type ThemeOption = {
  id: ThemeId;
  name: string;
  note: string;
  swatches: string[];
};

export type FontOption = {
  id: FontId;
  name: string;
  sample: string;
};

export const defaultTheme: ThemeId = "midnight";
export const defaultFont: FontId = "system";

export const themeOptions: ThemeOption[] = [
  {
    id: "midnight",
    name: "Midnight",
    note: "Current Matheye dark mode.",
    swatches: ["#090b10", "#32d1b5", "#6aa7ff"],
  },
  {
    id: "paper",
    name: "Paper",
    note: "Clean white mode.",
    swatches: ["#f7f4ee", "#172033", "#2f6df6"],
  },
  {
    id: "mono",
    name: "Mono",
    note: "Black and white focus.",
    swatches: ["#050505", "#f7f7f7", "#9a9a9a"],
  },
  {
    id: "aurora",
    name: "Aurora",
    note: "Cool violet and mint.",
    swatches: ["#0b1020", "#87efac", "#a78bfa"],
  },
  {
    id: "solar",
    name: "Solar",
    note: "Bright amber classroom.",
    swatches: ["#fff7df", "#21505b", "#f59e0b"],
  },
  {
    id: "berry",
    name: "Berry",
    note: "Deep berry and blue.",
    swatches: ["#120912", "#f472b6", "#60a5fa"],
  },
  {
    id: "forest",
    name: "Forest",
    note: "Green, slate, and gold.",
    swatches: ["#07130f", "#62d27f", "#d6a936"],
  },
];

export const fontOptions: FontOption[] = [
  {
    id: "system",
    name: "System",
    sample: "Fast and familiar",
  },
  {
    id: "serif",
    name: "Serif",
    sample: "Book-like lessons",
  },
  {
    id: "rounded",
    name: "Rounded",
    sample: "Soft study mode",
  },
  {
    id: "mono",
    name: "Mono",
    sample: "Precise and technical",
  },
];

export function isThemeId(value: string | null): value is ThemeId {
  return themeOptions.some((theme) => theme.id === value);
}

export function isFontId(value: string | null): value is FontId {
  return fontOptions.some((font) => font.id === value);
}
