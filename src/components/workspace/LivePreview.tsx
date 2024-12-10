"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface LivePreviewProps {
  content?: string;
  showPlaceholder?: boolean;
}

export function LivePreview({ content, showPlaceholder = true }: LivePreviewProps) {
  const params = useParams();
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(1024);
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  useEffect(() => {
    if (content) {
      try {
        // Process the content while preserving styles and structure
        let processedContent = content;
        
        // If content doesn't have a wrapping component, add one
        if (!content.includes('export default') && !content.includes('function')) {
          processedContent = `
            export default function Preview() {
              return (
                <div>${content}</div>
              );
            }
          `;
        }

        // Convert React component to HTML
        processedContent = processedContent
          .replace(/"use client";?\n?/, '')
          .replace(/import.*?\n/g, '')
          .replace(/export\s+default\s+function.*?\{/, '')
          .replace(/function.*?\{/, '')
          .replace(/return\s*\(/, '')
          .replace(/\)\s*;\s*\}/, '')
          .replace(/\)\s*\}\s*$/, '')
          .replace(/className=/g, 'class=')
          .replace(/{`/g, '')
          .replace(/`}/g, '')
          .replace(/{"/g, '')
          .replace(/"}/g, '')
          .replace(/{\s*([^{}]*)\s*}/g, '$1') // Replace simple JS expressions
          .trim();

        const previewContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 0; }
                .preview-container { min-height: 100vh; }
              </style>
            </head>
            <body>
              <div class="preview-container">
                ${processedContent}
              </div>
            </body>
          </html>
        `;

        console.log('Preview content:', previewContent); // For debugging
        setPreviewHtml(previewContent);
        setError(null);
      } catch (err) {
        console.error('Preview error:', err);
        setError(err instanceof Error ? err.message : 'Invalid component code');
      }
    }
  }, [content]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Width: {width}px</span>
          <button
            onClick={handleRefresh}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Refresh preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setWidth(375)}
            className={`px-3 py-1 text-xs font-medium rounded ${
              width === 375 ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mobile
          </button>
          <button
            onClick={() => setWidth(768)}
            className={`px-3 py-1 text-xs font-medium rounded ${
              width === 768 ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tablet
          </button>
          <button
            onClick={() => setWidth(1024)}
            className={`px-3 py-1 text-xs font-medium rounded ${
              width === 1024 ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Desktop
          </button>
        </div>
      </div>
      {!content && showPlaceholder ? (
        <div className="flex-1 bg-gray-100">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500">
            Start editing to see a live preview of your changes
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div 
            className="mx-auto transition-all duration-200 bg-white shadow-lg"
            style={{ width: `${width}px` }}
          >
            <iframe
              key={iframeKey}
              srcDoc={previewHtml}
              className="w-full h-full"
              style={{ height: 'calc(100vh - 3rem)' }}
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}
    </div>
  );
} 