
declare namespace cv {
  class Mat {
    constructor();
    delete(): void;
    roi(rect: { x: number; y: number; width: number; height: number }): Mat;
    cols: number;
    rows: number;
  }
  
  class MatVector {
    constructor();
    delete(): void;
    size(): number;
    get(index: number): Mat;
    push_back(mat: Mat): void;
  }
  
  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
  }
  
  class Rect {
    constructor(x: number, y: number, width: number, height: number);
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }
  
  const COLOR_RGBA2GRAY: number;
  const COLOR_RGB2GRAY: number;
  const COLOR_BGR2GRAY: number;
  const COLOR_GRAY2BGR: number;
  const COLOR_GRAY2RGBA: number;
  const THRESH_BINARY: number;
  const THRESH_OTSU: number;
  const RETR_LIST: number;
  const RETR_EXTERNAL: number;
  const CHAIN_APPROX_SIMPLE: number;
  const BORDER_DEFAULT: number;
  const LINE_AA: number;
  
  function imread(imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Mat;
  function imshow(canvas: HTMLCanvasElement, mat: Mat): void;
  function cvtColor(src: Mat, dst: Mat, code: number): void;
  function GaussianBlur(src: Mat, dst: Mat, ksize: Size, sigmaX: number, sigmaY?: number, borderType?: number): void;
  function threshold(src: Mat, dst: Mat, thresh: number, maxval: number, type: number): number;
  function findContours(image: Mat, contours: MatVector, hierarchy: Mat, mode: number, method: number): void;
  function contourArea(contour: Mat): number;
  function boundingRect(contour: Mat): Rect;
  function rectangle(img: Mat, pt1: Point, pt2: Point, color: number[], thickness: number, lineType?: number, shift?: number): void;
  function putText(img: Mat, text: string, org: Point, fontFace: number, fontScale: number, color: number[], thickness: number, lineType?: number, bottomLeftOrigin?: boolean): void;
  function adaptiveThreshold(src: Mat, dst: Mat, maxValue: number, adaptiveMethod: number, thresholdType: number, blockSize: number, C: number): void;
  function bilateralFilter(src: Mat, dst: Mat, d: number, sigmaColor: number, sigmaSpace: number, borderType?: number): void;
  function Canny(src: Mat, dst: Mat, threshold1: number, threshold2: number, apertureSize?: number, L2gradient?: boolean): void;
  function morphologyEx(src: Mat, dst: Mat, op: number, kernel: Mat, anchor?: Point, iterations?: number, borderType?: number, borderValue?: number[]): void;
}

interface Window {
  cv: typeof cv;
  Module: {
    onRuntimeInitialized?: () => void;
    [key: string]: any;
  };
}
