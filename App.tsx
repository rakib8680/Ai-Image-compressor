import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { compressImage } from './services/geminiService';
import { OutputFormat, CompressionLevel } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ImageDetailModal } from './components/ImageDetailModal';
import { dataURLtoFile } from './utils/fileUtils';
import { Icon } from './components/Icon';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const HomePageContent: React.FC<{onFileSelect: (file: File) => void; error: string | null; clearError: () => void;}> = ({onFileSelect, error, clearError}) => {
  const steps = [
    {
      icon: 'upload' as const,
      title: 'Upload Image',
      description: 'Click or drag & drop your image. We support various formats like PNG, JPG, and more, up to 20MB.',
    },
    {
      icon: 'settings' as const,
      title: 'Configure Settings',
      description: 'Choose your desired output format (JPG/PNG) and select a compression level to balance quality and file size.',
    },
    {
      icon: 'download' as const,
      title: 'Download',
      description: 'Compress with a single click and download your optimized image, ready for the web.',
    },
  ];
  
  const features = [
    {
      icon: 'sparkles' as const,
      title: 'AI-Powered Compression',
      description: 'Leverages advanced AI to intelligently reduce file size while preserving remarkable image quality.',
    },
    {
      icon: 'switch-horizontal' as const,
      title: 'Format Conversion',
      description: 'Easily convert your images between JPG and PNG formats to suit your needs.',
    },
    {
      icon: 'eye' as const,
      title: 'Live Preview & Edit',
      description: 'Instantly see the result and compare it with the original. Crop your images for the perfect finish.',
    },
    {
      icon: 'shield-check' as const,
      title: 'Privacy First',
      description: 'Your images are processed in memory and never stored on our servers, ensuring your data remains private.',
    },
  ]

  return (
    <>
      <ImageUploader onFileSelect={onFileSelect} error={error} clearError={clearError} />
      
      {/* How It Works Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-64 bg-brand-purple/10 dark:bg-brand-purple/20 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-xl mx-auto text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple & Quick Process
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
            Get your images optimized in just three easy steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="flex flex-col items-center p-6 bg-white/40 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-brand-purple/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center justify-center h-16 w-16 mb-4 rounded-full bg-brand-purple text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <Icon name={step.icon} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-slate-400 text-base">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-96 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-xl mx-auto text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Why Choose Our Compressor?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
            Packed with features to make your workflow seamless and efficient.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
             <div 
               key={feature.title} 
               className="flex items-start p-6 bg-white/40 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 group transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-900/70 hover:-translate-y-2 animate-fade-in-up"
               style={{ animationDelay: `${100 + index * 150}ms` }}
             >
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-brand-blue text-white mr-4 transition-all duration-300 group-hover:bg-brand-blue/90 group-hover:scale-110">
                <Icon name={feature.icon} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-1 text-gray-600 dark:text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Powered by Gemini Section */}
      <section className="py-16 sm:py-24 text-center">
         <div className="p-8 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-blue rounded-2xl shadow-2xl animate-background-pan relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_70%)] animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="relative">
              <Icon name="logo" className="w-16 h-16 mx-auto text-white/80 mb-4 animate-glow" />
              <h2 className="text-3xl font-extrabold text-white">Powered by Gemini</h2>
              <p className="mt-2 text-lg text-white/90 max-w-2xl mx-auto">
                  We use Google's state-of-the-art Gemini model to perform intelligent, context-aware image compression that understands every pixel.
              </p>
            </div>
         </div>
      </section>
    </>
  );
}


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

  const handleCrop = (croppedOriginalB64: string, croppedCompressedB64: string) => {
    setOriginalImagePreview(croppedOriginalB64);
    setCompressedImage(croppedCompressedB64);

    const newOriginalFile = dataURLtoFile(croppedOriginalB64, originalImage?.name ?? `cropped-original.${outputFormat}`);
    setOriginalImage(newOriginalFile);
    
    setIsModalOpen(false);
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
            <HomePageContent onFileSelect={handleFileSelect} error={error} clearError={() => setError(null)} />
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
          onCrop={handleCrop}
        />
      )}
      
      <Footer />
    </div>
  );
}