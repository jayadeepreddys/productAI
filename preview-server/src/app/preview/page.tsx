'use client';

import { useEffect, useState } from 'react';

interface PreviewData {
  content: string;
  store: any;
}

export default function PreviewPage() {
  const [data, setData] = useState<PreviewData>({ content: '', store: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch('/api/update-preview');
        if (!response.ok) {
          throw new Error('Failed to fetch preview data');
        }
        const previewData = await response.json();
        setData(previewData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview');
      }
    };

    // Initial fetch
    fetchPreview();

    // Poll for updates every second
    const interval = setInterval(fetchPreview, 1000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  // Debug output
  console.log('Preview Data:', data);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4">
        {data.content ? (
          <>
            <div className="mb-4 p-2 bg-gray-100 rounded">
              <pre className="text-xs">{JSON.stringify(data.store, null, 2)}</pre>
            </div>
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500">
            Waiting for content...
          </div>
        )}
      </div>
    </div>
  );
} 