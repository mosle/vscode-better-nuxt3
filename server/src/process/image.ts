import imageSize from "image-size";

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
