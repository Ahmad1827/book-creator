export interface BookFormat {
  id: "square" | "landscape" | "portrait";
  label: string;
  pageWidth: number;
  pageHeight: number;
  aspectRatio: string;
  description: string;
}

export interface BookTheme {
  id: string;
  name: string;
  subtitle: string;
  coverColor: string;
  coverTexture: string;
  pageBackground: string;
  pageOverlayStyle: string;
  spineGutterColor: string;
  primaryFont: string;
  textColor: string;
  accentColor: string;
}

export interface BookSpread {
  id: string;
  leftPageNum: number;
  rightPageNum: number;
  canvasData: any | null;
}

export interface BookProject {
  id: string;
  title: string;
  author: string;
  formatId: "square" | "landscape" | "portrait";
  themeId: string;
  spreads: BookSpread[];
  createdAt: string;
}

export interface FontOption {
  family: string;
  label: string;
  category: "Playful" | "Handwritten" | "Storybook";
}