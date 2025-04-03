
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const clearImage = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.gif']
    },
    maxFiles: 1,
    disabled
  });

  return (
    <div className="w-full">
      {!preview ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-alpr-500 bg-alpr-50" : "border-gray-300 hover:border-alpr-400 hover:bg-gray-50",
            disabled && "opacity-60 cursor-not-allowed hover:border-gray-300 hover:bg-transparent"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Image className="h-12 w-12 text-gray-400" />
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-700">
                {isDragActive ? "Drop image here" : "Drag and drop an image"}
              </p>
              <p className="text-sm text-gray-500">or click to browse files</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPG, PNG, BMP
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-auto rounded-lg object-contain max-h-[400px] border border-gray-200" 
          />
          <Button
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={clearImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
