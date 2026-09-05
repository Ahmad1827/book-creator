export interface BookSpread {
  id: string;
  leftPageNum: number;
  rightPageNum: number;
  canvasData: any | null;
}

export interface PaperStyle {
  id: "latte" | "steamed-milk" | "matcha-creme" | "dark-mocha";
  name: string;
  bg: string;
  ink: string;
  spine: string;
  border: string;
}

export interface BookProject {
  id: string;
  title: string;
  author: string;
  paperId: PaperStyle["id"];
  spreads: BookSpread[];
  createdAt: string;
}