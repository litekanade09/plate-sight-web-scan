
import { createWorker, Worker, RecognizeResult } from 'tesseract.js';
import cv from 'opencv.js';

export interface PlateResult {
  text: string;
  confidence: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageData?: string;
}

class AlprService {
  private worker: Worker | null = null;
  private isWorkerReady = false;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker({
        logger: m => console.log(m)
      });
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
      });
      this.isWorkerReady = true;
    }
  }

  async recognizePlate(imageFile: File): Promise<PlateResult[]> {
    if (!this.isWorkerReady) {
      await this.initialize();
    }

    try {
      // Load image into OpenCV
      const imgElement = await this.fileToImage(imageFile);
      const src = cv.imread(imgElement);
      
      // Preprocessing
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      
      // Apply Gaussian blur to reduce noise
      const blurred = new cv.Mat();
      const ksize = new cv.Size(5, 5);
      cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);

      // Apply threshold to get binary image
      const threshold = new cv.Mat();
      cv.threshold(blurred, threshold, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

      // Find contours
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(threshold, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      const results: PlateResult[] = [];
      
      // Process contours to find license plate candidates
      for (let i = 0; i < contours.size(); ++i) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        
        // Filter by area - license plates typically have a certain size
        if (area > 1000 && area < 50000) {
          const rect = cv.boundingRect(contour);
          const aspectRatio = rect.width / rect.height;
          
          // License plates typically have aspect ratios between 2 and 6
          if (aspectRatio > 2 && aspectRatio < 6) {
            // Extract license plate ROI
            const roi = threshold.roi(rect);
            
            // Convert OpenCV Mat to Image Data URI for Tesseract
            const tempCanvas = document.createElement('canvas');
            cv.imshow(tempCanvas, roi);
            const imageData = tempCanvas.toDataURL('image/png');
            
            // Recognize text in the ROI using Tesseract
            if (this.worker) {
              const recognition = await this.worker.recognize(imageData);
              
              // Filter and clean up the recognized text
              const text = recognition.data.text.replace(/[^A-Z0-9-]/g, '').trim();
              
              // Only consider results with some text and reasonable confidence
              if (text.length > 2) {
                results.push({
                  text,
                  confidence: recognition.data.confidence,
                  coordinates: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                  },
                  imageData
                });
              }
            }
            
            roi.delete();
          }
        }
        contour.delete();
      }

      // Clean up OpenCV resources
      src.delete();
      gray.delete();
      blurred.delete();
      threshold.delete();
      contours.delete();
      hierarchy.delete();

      // Sort results by confidence
      return results.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error in license plate recognition:', error);
      throw error;
    }
  }

  private fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isWorkerReady = false;
    }
  }
}

export default new AlprService();
