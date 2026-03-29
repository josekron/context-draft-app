'use client';

import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';
import Header from '@/components/Header';
import ErrorTopBar from '@/components/ErrorTopBar';
import FileUploader from '@/components/FileUploader';
import MarkdownPreview from '@/components/MarkdownPreview';
import { randomizeFilename } from '@/lib/utils';
import { Zap } from 'lucide-react';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisHints, setAnalysisHints] = useState('');
  const [storedImageBase64, setStoredImageBase64] = useState<string | null>(null);

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
      console.log(`Uploading file: ${newFilename}`);
      
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(newFilename)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload image. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use text or default message
          const textError = await response.text();
          errorMessage = textError || errorMessage;
        }
        console.error('Upload failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const blobData = await response.json();
      console.log('Upload successful:', blobData.url);

      // Store data for manual analysis trigger
      setImageUrl(blobData.url);
      setStoredImageBase64(dataUrl);
      setIsUploading(false);

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsUploading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!imageUrl) return;
    setError(null);
    await complete('', { body: { imageUrl, imageBase64: storedImageBase64, analysisHints } });
  };

  return (
    <main className="h-screen bg-background flex flex-col font-sans overflow-hidden transition-colors duration-300">
      <Header />
      <ErrorTopBar message={error} onClose={() => setError(null)} />

      <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Column: Image / Uploader */}
        <section className="flex-1 lg:max-w-md xl:max-w-lg flex flex-col h-full bg-background rounded-xl shadow-sm border border-border overflow-hidden shrink-0 transition-colors duration-300">
          <div className="px-5 py-3 border-b border-border bg-surface shrink-0">
            <h2 className="font-semibold text-primary text-sm flex items-center gap-2">
              Image Source
            </h2>
          </div>

          {/* Content area for the image - now scales dynamically to avoid scrolling */}
          <div className="flex-1 flex flex-col overflow-hidden px-8 pt-8 pb-4 relative">
            {!imageUrl ? (
              <div className="flex-1 flex items-center justify-center py-4">
                <FileUploader onFileSelect={handleUploadFile} isUploading={isUploading} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full animate-in fade-in duration-700">
                {/* Scalable Image Container */}
                <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden rounded-2xl group/image shadow-2xl shadow-black/10 dark:shadow-white/5 border border-border/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`h-full w-full object-contain transition-all duration-700 ease-out ${isUploading ? 'opacity-40 scale-[0.96] blur-sm' : 'opacity-100 scale-100'
                      }`}
                  />
                  
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-10 pointer-events-none">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--accent),0.5)]" />
                          </div>
                        </div>
                        <span className="text-foreground text-sm font-bold tracking-tight px-4 py-2 bg-background/50 backdrop-blur-xl rounded-lg border border-border shadow-xl">
                          Uploading to Vercel...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button - Now clearly separated and always visible */}
                {!isUploading && !isLoading && (
                  <div className="shrink-0 pt-6 pb-2">
                    <button
                      onClick={() => {
                        setImageUrl(null);
                        setCompletion('');
                        setError(null);
                        setStoredImageBase64(null);
                      }}
                      className="group/btn px-6 py-3 bg-surface/80 hover:bg-surface text-muted-foreground hover:text-foreground text-sm font-semibold rounded-xl transition-all border border-border/60 hover:border-accent/40 shadow-sm hover:shadow-xl active:scale-95 flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 group-hover/btn:bg-accent rounded-full transition-colors" />
                      Upload another screenshot
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Footer: Hints and Main Action */}
          <div className="shrink-0 p-8 border-t border-border bg-surface/40 backdrop-blur-md">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2.5">
                <label htmlFor="hints" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 ml-0.5">
                  Analysis Hints
                </label>
                <textarea
                  id="hints"
                  value={analysisHints}
                  onChange={(e) => setAnalysisHints(e.target.value)}
                  placeholder="What should I pay special attention to in this screenshot?"
                  className="w-full h-32 p-4 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-muted-foreground/40 resize-none text-foreground shadow-sm focus:shadow-md leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground/50 px-1 italic flex items-center gap-1.5 font-medium">
                  <span className="inline-block w-1 h-1 bg-muted-foreground/30 rounded-full" />
                  This context helps the AI analyze the image; it cannot change the note structure.
                </p>
              </div>

              <button
                onClick={handleStartAnalysis}
                disabled={!imageUrl || isLoading || isUploading}
                className="w-full group relative flex items-center justify-center gap-3 px-6 py-4.5 bg-accent hover:bg-accent/90 disabled:bg-muted/10 disabled:text-muted-foreground/30 disabled:scale-100 disabled:shadow-none text-white font-bold rounded-2xl transition-all shadow-xl shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Zap size={20} className={`${isLoading ? 'animate-pulse text-white/50' : 'text-white'}`} />
                <span className="tracking-tight text-lg">
                  {isLoading ? 'Processing...' : 'Analyse Screenshot'}
                </span>
              </button>
            </div>
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
