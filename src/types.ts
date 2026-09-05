export interface BookSpread {
  id: string;
  leftPageNum: number;
  rightPageNum: number;
  canvasData: any | null;
}

export interface BookTheme {
  id: string;
  name: string;
  tagline: string;
  paperBg: string;
  inkColor: string;
  spineColor: string;
  borderColor: string;
  accentColor: string;
  frameColor: string;
  decorType: "botanical" | "celestial" | "victorian" | "sakura" | "chai" | "brass";
  recommendedFont: string;
}

export interface BookProject {
  id: string;
  title: string;
  author: string;
  themeId: string;
  spreads: BookSpread[];
  createdAt: string;
}