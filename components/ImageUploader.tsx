import React, { useCallback, useState } from 'react';
import { Icon } from './Icon';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  error: string | null;
  clearError: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, error, clearError }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);


  return (
    <div className="w-full max-w-2xl mx-auto text-center animate-fade-in-up">
      <div className="mb-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          High-Quality Image Compression
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
          Reduce image file sizes with minimal quality loss. Powered by Gemini.
        </p>
      </div>

      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`mt-8 group relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
        ${isDragging ? 'border-brand-purple bg-purple-50 dark:bg-slate-800' : 'border-gray-300 dark:border-slate-700 hover:border-brand-purple/70 dark:hover:border-brand-purple/70 bg-gray-50/50 dark:bg-slate-900/30'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-slate-400">
          <Icon name="upload" className={`w-12 h-12 mb-4 text-gray-400 dark:text-slate-500 group-hover:text-brand-purple transition-colors ${isDragging ? 'text-brand-purple' : ''}`} />
          <p className="mb-2 text-lg"><span className="font-semibold text-brand-purple">Click to upload</span> or drag and drop</p>
          <p className="text-sm">PNG, JPG, HEIC, etc. (max 20MB)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
      
      {error && (
        <div className="mt-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-950/50 dark:text-red-400 animate-shake" role="alert">
          <span className="font-medium">Error:</span> {error}
          <button onClick={clearError} className="ml-4 font-bold">X</button>
        </div>
      )}
    </div>
  );
};