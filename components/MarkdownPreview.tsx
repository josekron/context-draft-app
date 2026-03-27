'use client';

import { Check, Copy, Download } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
  isLoading: boolean;
  error?: string | null;
}

export default function MarkdownPreview({ content, isLoading, error }: MarkdownPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'context-draft.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border overflow-hidden transition-colors">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface">
        <div className="font-semibold text-primary text-sm flex items-center gap-2 transition-colors">
          Markdown Output
          {isLoading && (
            <span className="flex h-2.5 w-2.5 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!content}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download .md file"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-900 min-h-[300px] transition-colors">
        {content ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 text-primary transition-colors" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5 text-primary tracking-tight transition-colors" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4 text-primary transition-colors" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-base font-bold mb-2 mt-3 text-primary transition-colors" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-[15px] transition-colors" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-1 transition-colors" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-1 transition-colors" {...props} />,
              li: ({node, ...props}) => <li className="text-[15px]" {...props} />,
              a: ({node, ...props}) => <a className="text-accent hover:underline font-medium transition-colors" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-1 my-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg" {...props} />,
              code: ({node, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                  <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono shadow-sm">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-slate-100 dark:bg-slate-800 text-accent px-1.5 py-0.5 rounded text-sm font-mono transition-colors" {...props}>
                    {children}
                  </code>
                )
              },
              img: ({node, ...props}) => (
                <img
                  className="max-w-full rounded-xl mb-4 border border-border shadow-sm"
                  {...props}
                />
              ),
              hr: ({node, ...props}) => <hr className="my-6 border-border" {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 italic space-y-2">
            {error && !isLoading ? (
              <p className="text-red-500 font-medium">Failed to generate draft. Please try again.</p>
            ) : (
              <p>{isLoading ? 'Analyzing image...' : 'Waiting for image analysis...'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
