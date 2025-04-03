
import AlprApp from '@/components/AlprApp';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-alpr-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <div className="inline-block p-2 bg-white rounded-xl shadow-md mb-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-alpr-700 to-alpr-500 bg-clip-text text-transparent mb-2">
              PlateSight
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-alpr-400 to-alpr-600 rounded-full mx-auto"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced license plate recognition with real-time detection, legality verification, 
            and comprehensive activity logging.
          </p>
        </header>
        
        <AlprApp />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <div className="p-4 bg-white rounded-lg shadow-sm inline-block">
            <p>Built with OpenCV.js and Tesseract.js</p>
            <p className="mt-1">© 2025 PlateSight - All rights reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
