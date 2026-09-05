export interface BookSpread {
  id: string;
  leftPageNum: number;
  rightPageNum: number;
  canvasData: any | null;
  themeId: string;
}

export interface BookTheme {
  id: string;
  name: string;
  pageBackground: string;
  spineColor: string;
  textColor: string;
  borderColor: string;
}

export interface FontOption {
  family: string;
  label: string;
  category: "Playful" | "Handwritten" | "Storybook";
}