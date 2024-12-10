"use client";

import { useEffect, useState } from 'react';
import { previewData } from '@/config/preview-data';

function PreviewComponent({ content }: { content: string }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        await Promise.all([
          loadLibrary('https://unpkg.com/react@18/umd/react.development.js'),
          loadLibrary('https://unpkg.com/react-dom@18/umd/react-dom.development.js'),
          loadLibrary('https://unpkg.com/@babel/standalone/babel.min.js')
        ]);

        // Find the component name
        const nameMatch = content.match(/(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z]\w+)/);
        if (!nameMatch) {
          throw new Error('Could not find component name');
        }
        const componentName = nameMatch[1];

        // Get props from preview-data.ts
        let previewProps = {};
        if (previewData[componentName]) {
          console.log('Using preview data from preview-data.ts for', componentName);
          previewProps = previewData[componentName].props;
        } else {
          console.warn(`No preview data found for ${componentName}`);
        }

        // Process the content - remove imports and type annotations
        let processedContent = content
          .replace(/"use client";?/g, '')
          .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
          .replace(/import\s+{.*?}\s+from\s+['"].*?['"];?/g, '')
          .replace(/interface\s+\w+\s*{[^}]*}/g, '')
          .replace(/:\s*React\.FC<[^>]*>/g, '')
          .replace(/:\s*[A-Za-z<>{},\[\]]+/g, '')
          .replace(/export\s+(?:default\s+)?/g, '')
          .trim();

        // Create container and mount component
        const container = document.createElement('div');
        container.id = 'preview-root';
        document.body.appendChild(container);

        // Transform JSX to React.createElement
        const transformedCode = Babel.transform(processedContent, {
          presets: ['react'],
          filename: 'component.jsx'
        }).code;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.text = `
          const previewProps = ${JSON.stringify(previewProps)};
          
          ${transformedCode}

          try {
            const root = ReactDOM.createRoot(document.getElementById('preview-root'));
            root.render(React.createElement(${componentName}, previewProps));
          } catch (error) {
            console.error('Render error:', error);
            const container = document.getElementById('preview-root');
            if (container) {
              container.innerHTML = '<div class="p-4 bg-red-50 text-red-600"><p>Error rendering component:</p><pre class="mt-2 text-sm">' + error.message + '</pre></div>';
            }
          }
        `;

        document.body.appendChild(script);

        return () => {
          document.body.removeChild(container);
          document.body.removeChild(script);
        };
      } catch (error) {
        console.error('Script loading error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load preview');
      }
    };

    const loadLibrary = async (url: string) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    if (content) {
      loadScripts();
    }
  }, [content]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600">
        <p>Error loading preview:</p>
        <pre className="mt-2 text-sm">{error}</pre>
      </div>
    );
  }

  return <div id="preview-root" />;
}

export default function ComponentPreviewPage() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const eventSource = new EventSource('/api/preview/component');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PreviewComponent content={content} />
    </div>
  );
} 