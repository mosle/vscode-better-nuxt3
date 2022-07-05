import * as fs from "fs";
import { getImageSizeOfPath } from "./image";

const srcRegExp = /src\s?=\s?['"]([^'"]+)['"]/im;
const widthRegExp = /:?width\s?=\s?['"]([^'"]+)['"]/im;
const heightRegExp = /:?height\s?=\s?['"]([^'"]+)['"]/im;

type PathResolver = (path: string) => string;

export function updateImageSizeForImg(imgTag: string, pathResolver: PathResolver = (path: string) => path): string {
  const matched = imgTag.match(srcRegExp);
  if (matched) {
    const path = matched[1];
    const resolved = pathResolver(path);

    if (fs.existsSync(resolved)) {
      const size = getImageSizeOfPath(resolved);
      if (size) {
        const w = `width="${size.width}"`;
        const h = `height="${size.height}"`;
        return imgTag
          .replace(widthRegExp, "")
          .replace(heightRegExp, "")
          .replace(/(\/?>)$/, (matched) => `${w} ${h} ${matched}`);
      }
    }
  }
  return imgTag;
}
