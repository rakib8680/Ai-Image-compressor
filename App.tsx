import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { compressImage } from './services/geminiService';
import { OutputFormat, CompressionLevel } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 20MB. Please choose a smaller file.`);
      return;
    }
    setError(null);
    setOriginalImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCompress = async () => {
    if (!originalImage || !originalImagePreview) return;
    setIsLoading(true);
    setError(null);
    setCompressedImage(null);

    try {
      const base64Data = originalImagePreview.split(',')[1];
      const compressedBase64 = await compressImage(base64Data, originalImage.type, outputFormat, compressionLevel);
      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      setCompressedImage(`data:${mimeType};base64,${compressedBase64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartOver = () => {
    setOriginalImage(null);
    setOriginalImagePreview(null);
    setCompressedImage(null);
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300 relative isolate overflow-hidden`}>
      {/* Blurry Background */}
      <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]" aria-hidden="true">
        <div 
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] via-[#9089fc] to-[#3b82f6] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem] animate-background-pan" 
          style={{ 
            backgroundSize: '200% 200%',
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' 
          }}
        ></div>
      </div>

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-6xl mx-auto">
          {!originalImagePreview ? (
            <ImageUploader onFileSelect={handleFileSelect} error={error} clearError={() => setError(null)} />
          ) : (
            <ResultDisplay
              originalImagePreview={originalImagePreview}
              originalFile={originalImage}
              compressedImage={compressedImage}
              isLoading={isLoading}
              onCompress={handleCompress}
              outputFormat={outputFormat}
              setOutputFormat={setOutputFormat}
              compressionLevel={compressionLevel}
              setCompressionLevel={setCompressionLevel}
              onStartOver={handleStartOver}
              error={error}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}