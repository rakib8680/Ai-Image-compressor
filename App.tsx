import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { compressImage } from './services/geminiService';
import { OutputFormat, CompressionLevel } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ImageDetailModal } from './components/ImageDetailModal';

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
    <div className={`min-h-screen w-full flex flex-col font-sans text-gray-800 dark:text-slate-200 transition-colors duration-300 relative isolate overflow-hidden`}>
       {/* Professional Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,theme(colors.slate.900)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.900)_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#c9b2f566,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,theme(colors.purple.950/50),transparent)]"></div>
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
              openModal={() => setIsModalOpen(true)}
            />
          )}
        </div>
      </main>
      
      {isModalOpen && compressedImage && originalImagePreview && (
        <ImageDetailModal
          originalImage={originalImagePreview}
          compressedImage={compressedImage}
          onClose={() => setIsModalOpen(false)}
          outputFormat={outputFormat}
        />
      )}
      
      <Footer />
    </div>
  );
}