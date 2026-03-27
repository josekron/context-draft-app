'use client';

import { useCompletion } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ErrorTopBar from '@/components/ErrorTopBar';
import FileUploader from '@/components/FileUploader';
import MarkdownPreview from '@/components/MarkdownPreview';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { complete, completion, isLoading, setCompletion } = useCompletion({
    api: '/api/analyze',
    streamProtocol: 'text',
    onError: (err) => {
      setError(err.message || 'Failed to analyze the image.');
      setIsUploading(false); // Just in case it was stuck
    },
  });

  useEffect(() => {
    const imageMatch = completion.match(/!\[[^\]]*]\(([^)]+)\)/);
    // #region agent log
    fetch('http://127.0.0.1:7425/ingest/e40e11f2-6139-4b3c-b89b-b0abe6c5943d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c5235c'},body:JSON.stringify({sessionId:'c5235c',runId:'public-blob-image-debug',hypothesisId:'C3',location:'app/page.tsx:28',message:'Completion updated with first markdown image URL',data:{completionLength:completion.length,firstImageUrl:imageMatch?imageMatch[1]:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [completion]);

  const handleFileSelect = async (file: File) => {
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
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        console.error(await response.text());
        throw new Error('Failed to upload image. Please try again.');
      }

      const blobData = await response.json();
      // #region agent log
      fetch('http://127.0.0.1:7425/ingest/e40e11f2-6139-4b3c-b89b-b0abe6c5943d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c5235c'},body:JSON.stringify({sessionId:'c5235c',runId:'public-blob-image-debug',hypothesisId:'C2',location:'app/page.tsx:62',message:'Client received blob response',data:{blobUrl:typeof blobData?.url==='string'?blobData.url:null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

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
    <main className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      <Header />
      <ErrorTopBar message={error} onClose={() => setError(null)} />

      <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Column: Image / Uploader */}
        <section className="flex-1 lg:max-w-md xl:max-w-lg flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
          <div className="px-5 py-3 border-b border-slate-200 bg-surface">
            <h2 className="font-semibold text-primary text-sm flex items-center gap-2">
              Image Source
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center items-center overflow-auto">
            {!imageUrl ? (
              <FileUploader onFileSelect={handleFileSelect} isUploading={isUploading} />
            ) : (
              <div className="relative w-full h-full min-h-[250px] flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Uploaded preview"
                  className={`max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-sm border border-slate-200 transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'
                    }`}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-lg">
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
                    className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-200 shadow-sm"
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
