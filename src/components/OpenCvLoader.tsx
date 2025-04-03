
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OpenCvLoaderProps {
  onLoaded: () => void;
}

const OpenCvLoader: React.FC<OpenCvLoaderProps> = ({ onLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if OpenCV.js is already loaded
    if (window.cv) {
      setLoading(false);
      onLoaded();
      return;
    }

    // Create Module object before the script loads
    window.Module = window.Module || {};
    
    // Setup the callback function when OpenCV.js is ready
    window.Module.onRuntimeInitialized = () => {
      console.log('OpenCV.js loaded');
      setLoading(false);
      onLoaded();
    };

    // Load OpenCV.js script
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.7.0/opencv.js';
    script.async = true;
    script.onerror = () => {
      setError('Failed to load OpenCV.js. Please check your internet connection.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onLoaded]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Reload
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-alpr-50 border border-alpr-100 rounded-lg">
        <Loader2 className="h-8 w-8 text-alpr-600 animate-spin mb-4" />
        <p className="text-alpr-700 font-medium">Loading OpenCV.js...</p>
        <p className="text-alpr-600 text-sm mt-2">This may take a moment depending on your connection.</p>
      </div>
    );
  }

  return null;
};

export default OpenCvLoader;
