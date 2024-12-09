"use client";

import { useState } from 'react';
import Image from 'next/image';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  preview: string;
  code?: string;
  onUse?: () => void;
}

export function PreviewModal({
  isOpen,
  onClose,
  title,
  description,
  preview,
  code,
  onUse
}: PreviewModalProps) {
  const [showCode, setShowCode] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        <div className="relative bg-white rounded-lg max-w-3xl w-full mx-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-medium">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-500 mb-4">{description}</p>
            
            <div className="flex justify-end space-x-2 mb-4">
              {code && (
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {showCode ? 'Show Preview' : 'Show Code'}
                </button>
              )}
            </div>

            {showCode && code ? (
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{code}</code>
              </pre>
            ) : (
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              {onUse && (
                <button
                  onClick={onUse}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90"
                >
                  Use Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 