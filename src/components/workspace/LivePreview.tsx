"use client";

import { useState, useEffect } from 'react';

interface LivePreviewProps {
  content?: string;
  showPlaceholder?: boolean;
}

export function LivePreview({ content, showPlaceholder = true }: LivePreviewProps) {
  const [width, setWidth] = useState<number>(1024);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (content) {
      fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      .catch(err => {
        console.error('Preview error:', err);
        setError(err.message);
      });
    }
  }, [content]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
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
        <button
          onClick={() => setIframeKey(prev => prev + 1)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {error ? (
        <div className="flex-1 p-4 bg-red-50 text-red-600">
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      ) : !content && showPlaceholder ? (
        <div className="flex-1 bg-gray-100 p-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500">
            Start editing to see a live preview of your changes
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div 
            className="mx-auto transition-all duration-200 bg-white"
            style={{ width: `${width}px` }}
          >
            <iframe
              key={iframeKey}
              src="/preview"
              className="w-full h-full border-0"
              style={{ height: 'calc(100vh - 3rem)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 