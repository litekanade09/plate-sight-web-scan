
import { useState, useRef, useEffect } from 'react';
import { Camera, Video, Pause, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import AlprService from '@/services/AlprService';

interface RealTimeCameraProps {
  onPlateDetected: (plateResult: any) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const RealTimeCamera: React.FC<RealTimeCameraProps> = ({
  onPlateDetected,
  isProcessing,
  setIsProcessing
}) => {
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingIntervalRef = useRef<number | null>(null);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
      if (processingIntervalRef.current) {
        window.clearInterval(processingIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
        setError(null);
        toast.success('Camera started successfully');
        
        // Start processing frames for plate detection
        startPlateDetection();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      toast.error('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (processingIntervalRef.current) {
      window.clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    
    setStreaming(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob and process it
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      processFrame(file);
    }, 'image/jpeg', 0.9);
  };

  const processFrame = async (imageFile: File) => {
    try {
      setIsProcessing(true);
      const plateResults = await AlprService.recognizePlate(imageFile);
      
      if (plateResults.length > 0) {
        // Send the detected plate to the parent component
        onPlateDetected(plateResults[0]);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startPlateDetection = () => {
    // Process frames at regular intervals (e.g., every 2 seconds)
    processingIntervalRef.current = window.setInterval(() => {
      captureFrame();
    }, 2000);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 p-4 z-10">
            <p>{error}</p>
          </div>
        )}
        
        <div className="relative">
          <video 
            ref={videoRef} 
            className={`w-full h-auto ${streaming ? 'block' : 'hidden'}`} 
            playsInline
            muted
          ></video>
          
          {!streaming && (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <Camera className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        
        <div className="p-4 flex justify-between items-center bg-alpr-50">
          {!streaming ? (
            <Button 
              onClick={startCamera} 
              className="w-full bg-alpr-600 hover:bg-alpr-700"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button 
              onClick={stopCamera} 
              variant="destructive"
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Stop Camera
            </Button>
          )}
        </div>
        
        {isProcessing && (
          <div className="absolute top-2 right-2 bg-alpr-600 text-white px-2 py-1 rounded-md text-xs animate-pulse">
            Processing...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeCamera;
