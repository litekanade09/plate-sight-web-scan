
import AlprApp from '@/components/AlprApp';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-alpr-800 mb-2">
            PlateSight
          </h1>
          <p className="text-xl text-gray-600">
            Automatic License Plate Recognition using OpenCV and Tesseract OCR
          </p>
        </header>
        
        <AlprApp />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with OpenCV.js and Tesseract.js</p>
          <p className="mt-1">© 2025 PlateSight - All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
