import * as fs from "fs";
import { getImageSizeFromUrl, getImageSizeOfPath } from "./image";

const srcRegExp = /src\s?=\s?['"]([^'"]+)['"]/im;
const widthRegExp = /:?width\s?=\s?['"]([^'"]+)['"]/im;
const heightRegExp = /:?height\s?=\s?['"]([^'"]+)['"]/im;

type PathResolver = (path: string) => string;

export async function updateImageSizeForImg(imgTag: string, pathResolver: PathResolver = (path: string) => path): Promise<string> {
  const matched = imgTag.match(srcRegExp);
  if (matched) {
    const path = matched[1];

    if (path.match(/^https?\:/)) {
      const size = await getImageSizeFromUrl(path);
      if (size) {
        const w = `width="${size.width}"`;
        const h = `height="${size.height}"`;
        return imgTag
          .replace(widthRegExp, "")
          .replace(heightRegExp, "")
          .replace(/(\/?>)$/, (matched) => `${w} ${h} ${matched}`);
      }
    }

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
