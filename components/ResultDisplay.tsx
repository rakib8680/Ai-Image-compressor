import React from 'react';
import { OutputFormat, CompressionLevel } from '../types';
import { formatBytes } from '../utils/fileUtils';
import { Spinner } from './Spinner';
import { Icon } from './Icon';

interface ResultDisplayProps {
  originalImagePreview: string;
  originalFile: File | null;
  compressedImage: string | null;
  isLoading: boolean;
  onCompress: () => void;
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  compressionLevel: CompressionLevel;
  setCompressionLevel: (level: CompressionLevel) => void;
  onStartOver: () => void;
  error: string | null;
}

const ImageCard: React.FC<{ title: string; imageSrc: string | null; size: number | null; dimensions: { w: number, h: number } | null; children?: React.ReactNode }> = ({ title, imageSrc, size, dimensions, children }) => (
  <div className="flex-1 flex flex-col bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {size !== null && <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(size)}</p>}
      </div>
      {dimensions && <p className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">{`${dimensions.w} x ${dimensions.h}`}</p>}
    </div>
    <div className="flex-grow flex items-center justify-center p-4 min-h-[300px]">
      {imageSrc ? <img src={imageSrc} alt={title} className="max-w-full max-h-[40vh] object-contain rounded-lg" /> : children}
    </div>
  </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalImagePreview,
  originalFile,
  compressedImage,
  isLoading,
  onCompress,
  outputFormat,
  setOutputFormat,
  compressionLevel,
  setCompressionLevel,
  onStartOver,
  error
}) => {
  const [originalDims, setOriginalDims] = React.useState<{w: number, h: number} | null>(null);
  const [compressedDims, setCompressedDims] = React.useState<{w: number, h: number} | null>(null);

  React.useEffect(() => {
    if (originalImagePreview) {
        const img = new Image();
        img.onload = () => setOriginalDims({ w: img.width, h: img.height });
        img.src = originalImagePreview;
    }
  }, [originalImagePreview]);

  React.useEffect(() => {
    if (compressedImage) {
        const img = new Image();
        img.onload = () => setCompressedDims({ w: img.width, h: img.height });
        img.src = compressedImage;
    } else {
        setCompressedDims(null);
    }
  }, [compressedImage]);
  
  const originalSize = originalFile?.size ?? null;
  
  const getCompressedSize = () => {
    if (!compressedImage) return null;
    const base64Data = compressedImage.split(',')[1];
    return (base64Data.length * 3) / 4 - (base64Data.endsWith('==') ? 2 : (base64Data.endsWith('=') ? 1 : 0));
  };

  const compressedSize = getCompressedSize();
  const sizeReduction = originalSize && compressedSize ? ((originalSize - compressedSize) / originalSize) * 100 : 0;
  
  const loadingMessages = React.useMemo(() => [
    "Analyzing pixels...",
    "Consulting with the AI...",
    "Applying compression magic...",
    "Optimizing image data...",
    "Almost there..."
  ], []);
  const [loadingMessage, setLoadingMessage] = React.useState(loadingMessages[0]);
  
  React.useEffect(() => {
    let interval: number;
    if (isLoading) {
      let i = 0;
      setLoadingMessage(loadingMessages[0]);
      interval = window.setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingMessages]);

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-fade-in-up">
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <ImageCard title="Original" imageSrc={originalImagePreview} size={originalSize} dimensions={originalDims} />
        <ImageCard title="Compressed" imageSrc={compressedImage} size={compressedSize} dimensions={compressedDims}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Spinner />
              <p className="mt-4 text-sm font-medium">{loadingMessage}</p>
            </div>
          ) : !compressedImage && (
            <div className="text-center text-gray-500 dark:text-gray-400 px-4">
              <Icon name="logo" className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-4">Your compressed image will appear here once you click the "Compress" button below.</p>
            </div>
          )}
        </ImageCard>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Column 1: Format & Quality */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Format:</span>
                <div className="flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                <button onClick={() => setOutputFormat('jpeg')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${outputFormat === 'jpeg' ? 'bg-white dark:bg-gray-900 text-brand-purple shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                    JPG
                </button>
                <button onClick={() => setOutputFormat('png')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${outputFormat === 'png' ? 'bg-white dark:bg-gray-900 text-brand-purple shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                    PNG
                </button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Quality:</span>
                <div className="flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                {(['low', 'medium', 'high'] as CompressionLevel[]).map(level => (
                    <button key={level} onClick={() => setCompressionLevel(level)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors capitalize ${compressionLevel === level ? 'bg-white dark:bg-gray-900 text-brand-purple shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                        {level}
                    </button>
                ))}
                </div>
            </div>
          </div>
          {/* Column 2: Main Action Button */}
          <div className="flex justify-center">
            <button
                onClick={onCompress}
                disabled={isLoading}
                className="w-48 h-16 bg-brand-purple hover:bg-brand-purple/90 disabled:bg-brand-purple/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple/50 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 flex items-center justify-center text-lg"
            >
                {isLoading ? 'Working...' : (compressedImage ? 'Re-Compress' : 'Compress')}
            </button>
          </div>
          {/* Column 3: Download Button */}
          <div className="flex md:justify-end justify-center">
            {compressedImage && (
                <a
                  href={compressedImage}
                  download={`compressed_image.${outputFormat}`}
                  className="w-48 h-16 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  <Icon name="download" className="w-6 h-6" />
                  Download
                </a>
            )}
          </div>
        </div>
        
        {/* Status Message Area */}
        <div className="mt-4 w-full min-h-[44px]">
          {error && (
            <div className="p-3 text-sm text-center text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 animate-shake" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          {!error && compressedSize && sizeReduction > 0 && (
            <div className="p-3 text-center w-full rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
              <p className="font-semibold">Success! File size reduced by {sizeReduction.toFixed(1)}%.</p>
            </div>
          )}
          {!error && compressedSize && sizeReduction <= 0 && (
            <div className="p-3 text-center w-full rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
              <p className="font-semibold">Compression did not reduce file size. Try a higher compression level.</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onStartOver}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-300/70 dark:hover:bg-gray-600/70 transition-colors"
      >
        <Icon name="start-over" className="w-5 h-5" />
        Compress another image
      </button>
    </div>
  );
};