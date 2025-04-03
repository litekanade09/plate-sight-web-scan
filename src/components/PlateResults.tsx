
import { useState } from 'react';
import { Copy, Check, Maximize2 } from 'lucide-react';
import { PlateResult } from '@/services/AlprService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PlateResultsProps {
  results: PlateResult[];
  originalImage: string | null;
}

const PlateResults: React.FC<PlateResultsProps> = ({ results, originalImage }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success("Copied to clipboard");
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const openImage = (image: string, title: string) => {
    setSelectedImage(image);
    setSelectedTitle(title);
    setOpenImageDialog(true);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800";
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-alpr-800">
            Recognition Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center gap-4 bg-white shadow-sm"
              >
                {result.imageData && (
                  <div className="relative w-full md:w-36 h-16 flex-shrink-0">
                    <img 
                      src={result.imageData} 
                      alt={`Plate segment ${index + 1}`}
                      className="h-full w-full object-contain cursor-pointer"
                      onClick={() => openImage(result.imageData!, `Plate segment ${index + 1}`)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 bg-black/60 hover:bg-black/80 rounded-full p-1"
                      onClick={() => openImage(result.imageData!, `Plate segment ${index + 1}`)}
                    >
                      <Maximize2 className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{result.text}</h3>
                    <Badge className={getConfidenceColor(result.confidence)}>
                      Confidence: {result.confidence.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleCopy(result.text)}
                >
                  {copied === result.text ? (
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied === result.text ? "Copied" : "Copy"}
                </Button>
              </div>
            ))}
            {originalImage && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => openImage(originalImage, "Original Image")}
                  className="w-full"
                >
                  View Original Image
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTitle}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt={selectedTitle} 
                className="max-h-[70vh] max-w-full object-contain" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlateResults;
