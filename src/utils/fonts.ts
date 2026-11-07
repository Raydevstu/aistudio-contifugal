import fs from "fs";

const FONT_CANDIDATES = [
  // Windows
  "C:/Windows/Fonts/arial.ttf",
  "C:/Windows/Fonts/segoeui.ttf",
  "C:/Windows/Fonts/calibri.ttf",

  // Linux
  "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",

  // macOS
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  "/Library/Fonts/Arial.ttf",
];

export function resolveFontPath(): string | null {
  for (const candidate of FONT_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function escapeFontPathForFFmpeg(
  fontPath: string
): string {
  return fontPath
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:");
}
