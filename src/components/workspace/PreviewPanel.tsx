"use client";

import { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';

interface PreviewPanelProps {
  projectId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function PreviewPanel({ projectId, isVisible, onClose }: PreviewPanelProps) {
  const [width, setWidth] = useState(600);
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  if (!isVisible) return null;

  return (
    <Resizable
      className="fixed top-0 right-0 h-screen bg-white shadow-lg z-50 flex flex-col"
      size={{ width, height: '100%' }}
      minWidth={400}
      maxWidth={1200}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
    >
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Preview</h3>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 bg-gray-100 p-4">
        <iframe
          key={iframeKey}
          src={`/api/preview/${projectId}`}
          className="w-full h-full bg-white rounded-lg shadow"
        />
      </div>
      <div className="h-12 border-t border-gray-200 flex items-center justify-between px-4">
        <span className="text-sm text-gray-500">Width: {width}px</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setWidth(375)}
            className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Mobile
          </button>
          <button
            onClick={() => setWidth(768)}
            className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Tablet
          </button>
          <button
            onClick={() => setWidth(1024)}
            className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Desktop
          </button>
        </div>
      </div>
    </Resizable>
  );
} 