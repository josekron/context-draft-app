'use client';

import { UploadCloud } from 'lucide-react';
import { useCallback, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export default function FileUploader({ onFileSelect, isUploading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
        isDragging
          ? 'border-accent bg-accent/5 scale-[1.02]'
          : 'border-border hover:border-accent bg-surface'
      } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="file-upload"
        onChange={handleChange}
        disabled={isUploading}
      />
      <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full h-full">
        <UploadCloud
          size={48}
          className={`mb-4 transition-colors ${isDragging ? 'text-accent' : 'text-slate-400 dark:text-slate-500'}`}
        />
        <p className="text-lg font-medium text-primary mb-1">
          Drag & drop your screenshot here
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          or click to browse from your computer
        </p>
      </label>
    </div>

  );
}
