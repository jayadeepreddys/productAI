"use client";

import { useState, useEffect } from 'react';

export function LivePreview({ content }: { content: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isServerAvailable, setIsServerAvailable] = useState(false);
  const [width, setWidth] = useState<number>(375);
  const [iframeKey, setIframeKey] = useState(0);

  // Check if preview server is available
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setIsServerAvailable(true);
          setError(null);
        }
      } catch (err) {
        console.error('Preview server not available:', err);
        setError('Preview server is not running. Please start the preview server on port 3001.');
        setIsServerAvailable(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  // Send content to preview server
  useEffect(() => {
    if (!content || !isServerAvailable) return;

    fetch('http://localhost:3001/api/update-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }).catch(err => {
      console.error('Failed to send content to preview:', err);
      setError(err.message);
    });
  }, [content, isServerAvailable]);

  const openInNewTab = () => {
    window.open('http://localhost:3001', '_blank');
  };

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
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
            onClick={refreshPreview}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 overflow-auto">
        <div 
          className="mx-auto transition-all duration-200 bg-white"
          style={{ width: `${width}px` }}
        >
          <iframe 
            key={iframeKey}
            src="http://localhost:3001"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts"
            style={{ height: 'calc(100vh - 3rem)' }}
          />
        </div>
      </div>
    </div>
  );
} 