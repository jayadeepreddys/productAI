'use client';

import { useEffect, useState } from 'react';
import { parseContent, sanitizeContent } from '../utils/contentHandler';

export default function PreviewRenderer() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        
        // Ignore React DevTools messages
        if (event.data.source === 'react-devtools-bridge') return;
        
        // Handle different types of content
        let contentToRender = '';
        
        if (typeof event.data === 'string') {
          contentToRender = event.data;
        } else if (typeof event.data === 'object') {
          contentToRender = event.data.content || event.data.html || '';
        }

        // Only update if we have actual content
        if (contentToRender) {
          const sanitizedContent = sanitizeContent(contentToRender);
          setContent(sanitizedContent);
        }
      } catch (error) {
        console.error('Preview render error:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!content) {
    return <div className="min-h-screen flex items-center justify-center">Loading preview...</div>;
  }

  return (
    <div 
      id="preview-content"
      className="min-h-screen"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
} 