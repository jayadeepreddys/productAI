"use client";

import { useState, useEffect } from 'react';

interface LivePreviewComponentProps {
  content?: string;
  showPlaceholder?: boolean;
}

export function LivePreviewComponent({ content, showPlaceholder = true }: LivePreviewComponentProps) {
  const [width, setWidth] = useState<number>(375);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (content) {
      fetch('/api/preview/component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }).catch(error => {
        console.error('Failed to send preview content:', error);
      });
    }
  }, [content]);

  const openInNewTab = () => {
    const previewUrl = `/preview/component?fullscreen=true`;
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">Width:</label>
          <input
            type="range"
            min="375"
            max="1920"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-600">{width}px</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Open in new tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button
            onClick={() => setIframeKey(prev => prev + 1)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
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
              src="/preview/component"
              className="w-full h-full border-0"
              style={{ height: 'calc(100vh - 3rem)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 