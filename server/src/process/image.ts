import imageSize from "image-size";
const probe = require("probe-image-size");

type Size = {
  width: number;
  height: number;
};
export function getImageSizeOfPath(path: string): Size | undefined {
  const size = imageSize(path);
  if (size.width !== undefined && size.height !== undefined) {
    return { width: size.width, height: size.height };
  }
  return;
}
export async function getImageSizeFromUrl(url: string): Promise<Size | undefined> {
  const result = await probe(url);
  if (result["width"] && result["height"]) {
    return { width: result["width"], height: result["height"] };
  }
  return;
}
