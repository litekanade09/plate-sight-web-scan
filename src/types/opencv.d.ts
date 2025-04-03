
declare namespace cv {
  class Mat {
    constructor();
    delete(): void;
    roi(rect: { x: number; y: number; width: number; height: number }): Mat;
  }
  
  class MatVector {
    constructor();
    delete(): void;
    size(): number;
    get(index: number): Mat;
  }
  
  class Size {
    constructor(width: number, height: number);
  }
  
  const COLOR_RGBA2GRAY: number;
  const COLOR_RGB2GRAY: number;
  const THRESH_BINARY: number;
  const THRESH_OTSU: number;
  const RETR_LIST: number;
  const CHAIN_APPROX_SIMPLE: number;
  const BORDER_DEFAULT: number;
  
  function imread(imageSource: HTMLImageElement | HTMLCanvasElement): Mat;
  function imshow(canvas: HTMLCanvasElement, mat: Mat): void;
  function cvtColor(src: Mat, dst: Mat, code: number): void;
  function GaussianBlur(src: Mat, dst: Mat, ksize: Size, sigmaX: number, sigmaY: number, borderType?: number): void;
  function threshold(src: Mat, dst: Mat, thresh: number, maxval: number, type: number): number;
  function findContours(image: Mat, contours: MatVector, hierarchy: Mat, mode: number, method: number): void;
  function contourArea(contour: Mat): number;
  function boundingRect(contour: Mat): { x: number; y: number; width: number; height: number };
}

interface Window {
  cv: typeof cv;
  Module: {
    onRuntimeInitialized?: () => void;
    [key: string]: any;
  };
}
