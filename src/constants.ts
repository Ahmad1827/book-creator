import { BookTheme, FontOption } from "./types";

export const FONTS: FontOption[] = [
  { family: "Patrick Hand", label: "Patrick Hand", category: "Handwritten" },
  { family: "Fredoka", label: "Fredoka", category: "Playful" },
  { family: "Sniglet", label: "Sniglet", category: "Playful" },
  { family: "DynaPuff", label: "DynaPuff", category: "Playful" },
  { family: "Caveat", label: "Caveat", category: "Handwritten" },
  { family: "Gaegu", label: "Gaegu", category: "Handwritten" },
  { family: "Indie Flower", label: "Indie Flower", category: "Handwritten" },
  { family: "Comfortaa", label: "Comfortaa", category: "Storybook" },
  { family: "Lora", label: "Lora", category: "Storybook" },
];

export const THEMES: BookTheme[] = [
  {
    id: "midnight",
    name: "Midnight Slate",
    pageBackground: "#1e222d",
    spineColor: "#13161f",
    textColor: "#e2e8f0",
    borderColor: "#2d3345",
  },
  {
    id: "obsidian",
    name: "Dark Velvet",
    pageBackground: "#18181b",
    spineColor: "#09090b",
    textColor: "#f4f4f5",
    borderColor: "#27272a",
  },
  {
    id: "parchment",
    name: "Warm Storybook",
    pageBackground: "#faf6ee",
    spineColor: "#e4dac5",
    textColor: "#2c1d11",
    borderColor: "#decbb2",
  },
  {
    id: "sage",
    name: "Deep Sage",
    pageBackground: "#1c2421",
    spineColor: "#111715",
    textColor: "#e3ece7",
    borderColor: "#293732",
  },
  {
    id: "plum",
    name: "Cosmic Night",
    pageBackground: "#211a28",
    spineColor: "#140f19",
    textColor: "#f3ecf9",
    borderColor: "#352940",
  },
];

export const COLOR_PALETTE = [
  "#ffffff",
  "#e2e8f0",
  "#94a3b8",
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#2c1d11",
  "#0f172a",
];