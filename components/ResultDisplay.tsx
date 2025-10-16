import React from 'react';
import { OutputFormat, CompressionLevel } from '../types';
import { formatBytes } from '../utils/fileUtils';
import { Spinner } from './Spinner';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';

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
  openModal: () => void;
}

const ImageCard: React.FC<{ title: string; imageSrc: string | null; file: File | null; size: number | null; dimensions: { w: number, h: number } | null; children?: React.ReactNode; isCompressed?: boolean; onClick?: () => void; savings?: number; }> = ({ title, imageSrc, file, size, dimensions, children, isCompressed = false, onClick, savings }) => (
  <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-900/60 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
    <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-1">
            {size !== null && <span>{formatBytes(size)}</span>}
            {file && <span className="font-mono bg-gray-100 dark:bg-slate-800/50 px-2 py-0.5 rounded text-xs">{file.type}</span>}
        </div>
      </div>
      {savings && savings > 0 ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-3 py-1.5 rounded-full">
            <Icon name="savings" className="w-5 h-5"/>
            <span className="font-bold text-sm">{savings.toFixed(1)}%</span>
        </div>
      ) : (
        dimensions && <p className="text-sm font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800/50 px-2 py-1 rounded-md">{`${dimensions.w} x ${dimensions.h}`}</p>
      )}
    </div>
    <div className="flex-grow flex items-center justify-center p-4 min-h-[300px] relative group bg-slate-50 dark:bg-slate-800/20 rounded-b-2xl">
      {imageSrc ? (
        <>
            <img src={imageSrc} alt={title} className="max-w-full max-h-[40vh] object-contain rounded-lg" />
            {isCompressed && onClick && (
                 <div onClick={onClick} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-lg">
                    <div className="flex items-center gap-2 text-white font-bold text-lg p-3 bg-black/60 rounded-lg">
                        <Icon name="compare" className="w-6 h-6" />
                        <span>Click to Compare & Edit</span>
                    </div>
                </div>
            )}
        </>
      )
       : <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/20">{children}</div>}
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
  error,
  openModal
}) => {
  const [originalDims, setOriginalDims] = React.useState<{w: number, h: number} | null>(null);
  const [compressedDims, setCompressedDims] = React.useState<{w: number, h: number} | null>(null);
  const [compressedFile, setCompressedFile] = React.useState<File | null>(null);

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
        fetch(compressedImage).then(res => res.blob()).then(blob => {
            setCompressedFile(new File([blob], `compressed.${outputFormat}`, { type: blob.type }));
        })
    } else {
        setCompressedDims(null);
        setCompressedFile(null);
    }
  }, [compressedImage, outputFormat]);
  
  const originalSize = originalFile?.size ?? null;
  const compressedSize = compressedFile?.size ?? null;
  
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
  
  const hasResult = compressedSize !== null && originalSize !== null;

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-fade-in-up">
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <ImageCard title="Original" imageSrc={originalImagePreview} file={originalFile} size={originalSize} dimensions={originalDims} />
        <ImageCard title="Compressed" imageSrc={compressedImage} file={compressedFile} size={compressedSize} dimensions={compressedDims} isCompressed={!!compressedImage} onClick={openModal} savings={sizeReduction}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-slate-400">
              <Spinner />
              <p className="mt-4 text-sm font-medium">{loadingMessage}</p>
            </div>
          ) : !compressedImage && (
            <div className="text-center text-gray-500 dark:text-slate-400 px-4">
              <Icon name="logo" className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-700" />
              <p className="mt-4">Your compressed image will appear here. Click the "Compress" button to start.</p>
            </div>
          )}
        </ImageCard>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white/60 dark:bg-slate-900/70 backdrop-blur-lg shadow-xl border border-gray-200 dark:border-slate-800 w-full max-w-4xl">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Column 1: Format & Quality */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Format:</span>
                <div className="flex rounded-lg bg-gray-200 dark:bg-slate-800 p-1">
                  <Tooltip text="Best for photos, smaller file size.">
                    <button onClick={() => setOutputFormat('jpeg')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${outputFormat === 'jpeg' ? 'bg-white dark:bg-slate-600 text-brand-purple shadow' : 'text-gray-600 dark:text-slate-300'}`}>JPG</button>
                  </Tooltip>
                  <Tooltip text="Best for graphics with transparency.">
                    <button onClick={() => setOutputFormat('png')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${outputFormat === 'png' ? 'bg-white dark:bg-slate-600 text-brand-purple shadow' : 'text-gray-600 dark:text-slate-300'}`}>PNG</button>
                  </Tooltip>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Quality:</span>
                <div className="flex rounded-lg bg-gray-200 dark:bg-slate-800 p-1">
                {(['low', 'medium', 'high'] as CompressionLevel[]).map(level => (
                    <Tooltip key={level} text={`${level === 'low' ? 'Highest quality' : level === 'medium' ? 'Balanced' : 'Smallest size'}`}>
                      <button onClick={() => setCompressionLevel(level)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors capitalize ${compressionLevel === level ? 'bg-white dark:bg-slate-600 text-brand-purple shadow' : 'text-gray-600 dark:text-slate-300'}`}>
                          {level}
                      </button>
                    </Tooltip>
                ))}
                </div>
            </div>
          </div>
          {/* Column 2: Main Action Button */}
          <div className="flex justify-center">
            <button
                onClick={onCompress}
                disabled={isLoading}
                className={`w-48 h-16 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none flex items-center justify-center text-lg gap-2
                           bg-brand-purple hover:bg-purple-700
                           shadow-lg shadow-brand-purple/30 hover:shadow-xl hover:shadow-brand-purple/40
                           focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800
                           disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none
                           ${!compressedImage && !isLoading ? 'animate-subtle-pulse' : ''}`}
            >
                {isLoading ? <><Spinner /> Working...</> : (compressedImage ? <><Icon name="refresh" className="w-6 h-6"/> Re-Compress</> : 'Compress')}
            </button>
          </div>
          {/* Column 3: Download & Start Over Buttons */}
          <div className="flex md:justify-end justify-center items-center gap-4">
            {compressedImage && !isLoading && (
                <a
                  href={compressedImage}
                  download={`compressed_image.${outputFormat}`}
                  className="w-48 h-16 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none flex items-center justify-center gap-2 text-lg
                            bg-brand-blue hover:bg-blue-700
                            shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40
                            focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                >
                  <Icon name="download" className="w-6 h-6" />
                  Download
                </a>
            )}
             {!isLoading && <button
                onClick={onStartOver}
                className="w-48 h-16 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none flex items-center justify-center gap-2 text-lg
                            bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200
                            shadow-md shadow-slate-500/10 hover:shadow-lg hover:shadow-slate-500/20
                            focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                <Icon name="start-over" className="w-6 h-6" />
                Start Over
              </button>}
          </div>
        </div>
        
        {/* Status Message Area */}
        {(error || hasResult) && (
            <div className="mt-4 w-full">
            {error && (
                <div className="p-3 text-sm text-center text-red-800 rounded-lg bg-red-50 dark:bg-red-500/10 dark:text-red-400 animate-shake" role="alert">
                <span className="font-medium">Error:</span> {error}
                </div>
            )}
            {!error && hasResult && sizeReduction > 0 && (
                <div className="p-4 text-center w-full rounded-lg bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 space-y-2">
                <p className="font-semibold text-lg">Success! Reduced size by {sizeReduction.toFixed(1)}%</p>
                <div className="text-sm font-mono text-green-700 dark:text-green-300 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <p>Original: {originalDims?.w}x{originalDims?.h} &middot; {originalSize.toLocaleString()} bytes</p>
                    <p>Compressed: {compressedDims?.w}x{compressedDims?.h} &middot; {compressedSize.toLocaleString()} bytes</p>
                </div>
                <div title={`Compressed size is ${((compressedSize/originalSize) * 100).toFixed(1)}% of original`} className="w-full bg-green-200 dark:bg-green-900 rounded-full h-2.5 mt-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(compressedSize/originalSize) * 100}%` }}></div>
                </div>
                </div>
            )}
            {!error && hasResult && sizeReduction <= 0 && (
                <div className="p-3 text-center w-full rounded-lg bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400">
                <p className="font-semibold">Compression did not reduce file size. Try a higher compression level.</p>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};