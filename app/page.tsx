'use client';

import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';
import Header from '@/components/Header';
import ErrorTopBar from '@/components/ErrorTopBar';
import FileUploader from '@/components/FileUploader';
import MarkdownPreview from '@/components/MarkdownPreview';
import { randomizeFilename } from '@/lib/utils';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { complete, completion, isLoading, setCompletion } = useCompletion({
    api: '/api/analyze',
    streamProtocol: 'text',
    onError: (err) => {
      console.log(`Error analyzing image: ${err.message}`)
      setError(err.message.includes('Failed to fetch') ? 'Failed to analyze the image.' : err.message);
      setIsUploading(false);
    },
  });

  const handleUploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setCompletion(''); // Reset markdown

    try {
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);

      // Extract Base64 to bypass private blob limitations in AI SDK
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to Vercel Blob via our endpoint
      const newFilename = randomizeFilename(file.name);
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(newFilename)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        console.error(await response.text());
        throw new Error('Failed to upload image. Please try again.');
      }

      const blobData = await response.json();

      // Trigger Gemini streaming
      setIsUploading(false);
      await complete('', { body: { imageUrl: blobData.url, imageBase64: dataUrl } });

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsUploading(false);
    }
  };

  return (
    <main className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-hidden transition-colors">
      <Header />
      <ErrorTopBar message={error} onClose={() => setError(null)} />

      <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Column: Image / Uploader */}
        <section className="flex-1 lg:max-w-md xl:max-w-lg flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border overflow-hidden shrink-0 transition-colors">
          <div className="px-5 py-3 border-b border-border bg-surface">
            <h2 className="font-semibold text-primary text-sm flex items-center gap-2">
              Image Source
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center items-center overflow-auto">
            {!imageUrl ? (
              <FileUploader onFileSelect={handleUploadFile} isUploading={isUploading} />
            ) : (
              <div className="relative w-full h-full min-h-[250px] flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Uploaded preview"
                  className={`max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-sm border border-border transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'
                    }`}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 rounded-lg">
                    <span className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-pulse">
                      Uploading to Vercel Blob...
                    </span>
                  </div>
                )}

                {/* Action button to clear and start over */}
                {!isUploading && !isLoading && (
                  <button
                    onClick={() => {
                      setImageUrl(null);
                      setCompletion('');
                      setError(null);
                    }}
                    className="mt-6 px-4 py-2 bg-surface text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium rounded-lg transition-colors border border-border shadow-sm"
                  >
                    Upload a different screenshot
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Markdown Output */}
        <section className="flex-[2] h-full overflow-hidden min-h-[400px]">
          <MarkdownPreview
            content={completion}
            isLoading={isLoading || isUploading}
            error={error}
          />
        </section>
      </div>
    </main>
  );
}
