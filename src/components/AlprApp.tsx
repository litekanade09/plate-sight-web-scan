import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Camera, ImageIcon, Clock as ActivityEntry } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OpenCvLoader from './OpenCvLoader';
import ImageUploader from './ImageUploader';
import PlateResults from './PlateResults';
import RealTimeCamera from './RealTimeCamera';
import LegalityCheck from './LegalityCheck';
import ActivityLog from './ActivityLog';
import AlprService, { PlateResult } from '@/services/AlprService';
import DataService from '@/services/DataService';
import { ActivityEntry as ActivityEntryType } from './ActivityLog';

const AlprApp = () => {
  const [loading, setLoading] = useState(false);
  const [openCvLoaded, setOpenCvLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [results, setResults] = useState<PlateResult[]>([]);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityEntryType[]>([]);
  const [currentPlate, setCurrentPlate] = useState<{
    text: string;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    if (openCvLoaded) {
      const savedActivities = DataService.loadActivityLog();
      setActivityLog(savedActivities);
    }
  }, [openCvLoaded]);

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
    setCurrentPlate(null);
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
        setCurrentPlate({
          text: plateResults[0].text,
          confidence: plateResults[0].confidence
        });
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

  const handlePlateDetected = (plateResult: PlateResult) => {
    if (plateResult && plateResult.text) {
      setResults([plateResult]);
      setCurrentPlate({
        text: plateResult.text,
        confidence: plateResult.confidence
      });
      toast.success(`Detected license plate: ${plateResult.text}`);
    }
  };

  const handleLegalityDetermined = (isLegal: boolean, plateNumber: string, region: string) => {
    const confidence = currentPlate?.confidence || 0;
    const newEntry = DataService.addActivity(plateNumber, region, isLegal, confidence);
    
    setActivityLog(prev => [newEntry, ...prev]);
    
    toast.success(`Plate ${plateNumber} checked and logged`);
  };

  const handleClearLog = () => {
    DataService.clearActivityLog();
    setActivityLog([]);
    toast.success('Activity log cleared');
  };

  const resetAll = () => {
    setSelectedImage(null);
    setResults([]);
    setCurrentPlate(null);
    
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
      setOriginalImageUrl(null);
    }
  };

  if (!openCvLoaded) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <OpenCvLoader onLoaded={() => setOpenCvLoaded(true)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-white shadow-lg border-alpr-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-alpr-600" />
            <CardTitle className="text-2xl text-alpr-800 bg-gradient-to-r from-alpr-700 to-alpr-500 bg-clip-text text-transparent">
              PlateSight Scanner
            </CardTitle>
          </div>
          <CardDescription>
            Capture license plates from images or video and verify their legality with advanced computer vision.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image Upload
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Live Camera
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="camera">
              <RealTimeCamera 
                onPlateDetected={handlePlateDetected}
                isProcessing={isProcessingVideo}
                setIsProcessing={setIsProcessingVideo}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-gray-50">
          <Loader2 className="h-8 w-8 text-alpr-600 animate-spin mb-4" />
          <p className="text-alpr-700 font-medium">Processing Image...</p>
          <p className="text-alpr-600 text-sm mt-2">This may take a few moments.</p>
        </div>
      )}

      {(results.length > 0 || currentPlate) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.length > 0 && (
            <div className="md:col-span-1">
              <PlateResults results={results} originalImage={originalImageUrl} />
            </div>
          )}
          
          <div className="md:col-span-1">
            <LegalityCheck 
              detectedPlate={currentPlate?.text || null}
              confidence={currentPlate?.confidence || 0}
              onLegalityDetermined={handleLegalityDetermined}
            />
          </div>
        </div>
      )}
      
      <Sheet>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-alpr-800 my-4 flex items-center gap-2">
            <ActivityEntry className="h-5 w-5 text-alpr-600" />
            Recent Activity
          </h2>
          <SheetTrigger asChild>
            <Button>View Full Log</Button>
          </SheetTrigger>
        </div>
        
        {activityLog.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLog.slice(0, 5).map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-medium">{entry.plateNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        entry.isLegal 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.isLegal ? 'Legal' : 'Illegal'}
                      </span>
                    </TableCell>
                    <TableCell>{entry.region}</TableCell>
                    <TableCell>{entry.timestamp.toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No plate detection activity yet.</p>
          </div>
        )}
        
        <SheetContent size="xl">
          <ActivityLog 
            activities={activityLog}
            onClearLog={handleClearLog}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AlprApp;
