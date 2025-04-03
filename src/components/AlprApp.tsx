
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Camera } from 'lucide-react';
import { toast } from 'sonner';
import OpenCvLoader from './OpenCvLoader';
import ImageUploader from './ImageUploader';
import PlateResults from './PlateResults';
import AlprService, { PlateResult } from '@/services/AlprService';

const AlprApp = () => {
  const [loading, setLoading] = useState(false);
  const [openCvLoaded, setOpenCvLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [results, setResults] = useState<PlateResult[]>([]);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Initialize Tesseract worker
  useEffect(() => {
    if (openCvLoaded) {
      const initTesseract = async () => {
        try {
          await AlprService.initialize();
          console.log('Tesseract worker initialized');
        } catch (error) {
          console.error('Failed to initialize Tesseract worker:', error);
          toast.error('Failed to initialize text recognition. Please refresh and try again.');
        }
      };
      
      initTesseract();
    }
    
    return () => {
      // Clean up resources when component unmounts
      AlprService.terminate();
    };
  }, [openCvLoaded]);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setResults([]);
    
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    
    setOriginalImageUrl(URL.createObjectURL(file));
  }, [originalImageUrl]);

  const processImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const plateResults = await AlprService.recognizePlate(selectedImage);
      
      if (plateResults.length > 0) {
        setResults(plateResults);
        toast.success(`Found ${plateResults.length} potential license plate(s)`);
      } else {
        toast.info('No license plates detected. Try another image or adjust the image quality.');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again or use a different image.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setResults([]);
    
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
      setOriginalImageUrl(null);
    }
  };

  if (!openCvLoaded) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <OpenCvLoader onLoaded={() => setOpenCvLoaded(true)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-alpr-600" />
            <CardTitle className="text-2xl text-alpr-800">
              License Plate Recognition
            </CardTitle>
          </div>
          <CardDescription>
            Upload an image containing a license plate to automatically detect and extract the plate information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUploader onImageSelect={handleImageSelect} disabled={loading} />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 bg-alpr-600 hover:bg-alpr-700"
              disabled={!selectedImage || loading}
              onClick={processImage}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Detect License Plate'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={resetAll}
              disabled={!selectedImage || loading}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-gray-50">
          <Loader2 className="h-8 w-8 text-alpr-600 animate-spin mb-4" />
          <p className="text-alpr-700 font-medium">Processing Image...</p>
          <p className="text-alpr-600 text-sm mt-2">This may take a few moments.</p>
        </div>
      )}

      {results.length > 0 && (
        <PlateResults results={results} originalImage={originalImageUrl} />
      )}
    </div>
  );
};

export default AlprApp;
