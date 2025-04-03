
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Loading application..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50">
      <Loader2 className="h-12 w-12 text-alpr-600 animate-spin mb-4" />
      <h2 className="text-xl font-medium text-alpr-800">{message}</h2>
      <p className="text-alpr-600 mt-2 max-w-md text-center">
        Please wait while we initialize the necessary components. This might take a few moments...
      </p>
    </div>
  );
};

export default LoadingScreen;
