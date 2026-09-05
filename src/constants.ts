import { BookTheme, FontOption } from "./types";

export const FONTS: FontOption[] = [
  { family: "Patrick Hand", label: "Patrick Hand (Cozy Handwritten)", category: "Handwritten" },
  { family: "Fredoka", label: "Fredoka (Rounded & Warm)", category: "Playful" },
  { family: "Sniglet", label: "Sniglet (Bubbly Children)", category: "Playful" },
  { family: "DynaPuff", label: "DynaPuff (Puffy & Animated)", category: "Playful" },
  { family: "Caveat", label: "Caveat (Cursive Pen)", category: "Handwritten" },
  { family: "Gaegu", label: "Gaegu (Casual Marker)", category: "Handwritten" },
  { family: "Indie Flower", label: "Indie Flower (Doodle Style)", category: "Handwritten" },
  { family: "Comfortaa", label: "Comfortaa (Modern Picturebook)", category: "Storybook" },
  { family: "Lora", label: "Lora (Classic Fairy Tale Serif)", category: "Storybook" },
];

export const THEMES: BookTheme[] = [
  {
    id: "parchment",
    name: "Warm Storybook",
    pageBackground: "#faf6ee",
    spineColor: "#e4dac5",
    textColor: "#2c1d11",
    borderColor: "#decbb2",
  },
  {
    id: "linen",
    name: "Soft Cream",
    pageBackground: "#fffdfa",
    spineColor: "#eadeca",
    textColor: "#342b26",
    borderColor: "#e3d7c5",
  },
  {
    id: "mint",
    name: "Sage Meadow",
    pageBackground: "#f2f7f4",
    spineColor: "#d3e3da",
    textColor: "#1c2b22",
    borderColor: "#cfe0d7",
  },
  {
    id: "lavender",
    name: "Pastel Dream",
    pageBackground: "#f6f3f9",
    spineColor: "#dfd5ea",
    textColor: "#271c33",
    borderColor: "#d8cde3",
  },
  {
    id: "night",
    name: "Bedtime Story",
    pageBackground: "#1e222d",
    spineColor: "#131722",
    textColor: "#f3f4f6",
    borderColor: "#2d3345",
  },
];

export const COLOR_PALETTE = [
  "#2c1d11",
  "#c84b31",
  "#d97736",
  "#e9b44c",
  "#588157",
  "#3a5a40",
  "#3d5a80",
  "#4d194d",
  "#ffffff",
];