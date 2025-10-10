
import React from 'react';
import { OutputFormat } from '../types';
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
  onStartOver: () => void;
}

const ImageCard: React.FC<{ title: string; imageSrc: string | null; size: number | null; children?: React.ReactNode }> = ({ title, imageSrc, size, children }) => (
  <div className="flex-1 flex flex-col bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {size !== null && <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(size)}</p>}
    </div>
    <div className="flex-grow flex items-center justify-center p-4 min-h-[200px]">
      {imageSrc ? <img src={imageSrc} alt={title} className="max-w-full max-h-80 object-contain rounded-lg" /> : children}
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
  onStartOver
}) => {
  const originalSize = originalFile?.size ?? null;
  
  const getCompressedSize = () => {
    if (!compressedImage) return null;
    const base64Data = compressedImage.split(',')[1];
    // This is an approximation. Actual size might vary slightly.
    return (base64Data.length * 3) / 4 - (base64Data.endsWith('==') ? 2 : (base64Data.endsWith('=') ? 1 : 0));
  };

  const compressedSize = getCompressedSize();
  const sizeReduction = originalSize && compressedSize ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <ImageCard title="Original" imageSrc={originalImagePreview} size={originalSize} />
        <ImageCard title="Compressed" imageSrc={compressedImage} size={compressedSize}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Spinner />
              <p className="mt-2 text-sm">Compressing your image...</p>
            </div>
          ) : !compressedImage && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Your compressed image will appear here.</p>
            </div>
          )}
        </ImageCard>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-medium">Output Format:</span>
            <div className="flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
              <button onClick={() => setOutputFormat('jpeg')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${outputFormat === 'jpeg' ? 'bg-white dark:bg-gray-900 text-brand-purple shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                JPG
              </button>
              <button onClick={() => setOutputFormat('png')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${outputFormat === 'png' ? 'bg-white dark:bg-gray-900 text-brand-purple shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                PNG
              </button>
            </div>
          </div>
          
          <button
            onClick={onCompress}
            disabled={isLoading}
            className="flex-shrink-0 bg-brand-purple hover:bg-brand-purple/90 disabled:bg-brand-purple/50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple/50 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
          >
            {isLoading ? 'Compressing...' : 'Compress Image'}
          </button>
          
          {compressedImage && (
            <a
              href={compressedImage}
              download={`compressed_image.${outputFormat}`}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Icon name="download" className="w-5 h-5" />
              Download
            </a>
          )}
      </div>

       {compressedSize && sizeReduction > 0 && (
        <div className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
          <p className="font-semibold">Success! File size reduced by {sizeReduction.toFixed(1)}%.</p>
        </div>
      )}

      <button
        onClick={onStartOver}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-purple dark:hover:text-brand-purple underline"
      >
        Compress another image
      </button>
    </div>
  );
};
