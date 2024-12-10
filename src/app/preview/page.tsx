'use client';

import { useEffect, useState } from 'react';

const PreviewComponent = ({ content }: { content: string }) => {
  useEffect(() => {
    const scripts = [
      {
        src: 'https://unpkg.com/react@18/umd/react.production.min.js',
        id: 'react-script'
      },
      {
        src: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
        id: 'react-dom-script'
      },
      {
        src: 'https://unpkg.com/@babel/standalone/babel.min.js',
        id: 'babel-script'
      },
      {
        src: 'https://cdn.tailwindcss.com',
        id: 'tailwind-script'
      }
    ];

    // Process the content to remove TypeScript and module syntax
    const processContent = (rawContent: string) => {
      return rawContent
        .replace(/"use client";?/g, '')
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/import\s+{.*?}\s+from\s+['"].*?['"];?/g, '')
        .replace(/export\s+default\s+function\s+/, 'function ')
        .replace(/export\s+function\s+/, 'function ')
        .replace(/export\s+default\s+/, '')
        .replace(/:\s*[A-Za-z<>{},\[\]]+/g, '')
        .replace(/interface\s+\w+\s*{[^}]*}/g, '')
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
        .trim();
    };

    const loadScripts = async () => {
      try {
        for (const scriptData of scripts) {
          if (!document.getElementById(scriptData.id)) {
            const script = document.createElement('script');
            script.src = scriptData.src;
            script.id = scriptData.id;
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
        }

        while (!window.Babel) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const existingRoot = document.getElementById('preview-root');
        if (existingRoot) {
          existingRoot.innerHTML = '';
        }

        const processedContent = processContent(content);
        const transformedCode = window.Babel.transform(processedContent, {
          presets: ['react'],
        }).code;

        const componentScript = document.createElement('script');
        componentScript.id = 'preview-script';
        componentScript.text = `
          ${transformedCode}
          
          (function() {
            var root = ReactDOM.createRoot(document.getElementById('preview-root'));
            var componentName = '${content.match(/function\s+(\w+)/)?.[1] || 'Component'}';
            if (typeof window[componentName] !== 'undefined') {
              root.render(React.createElement(window[componentName]));
            } else {
              console.error('Component not found:', componentName);
            }
          })();
        `;

        document.body.appendChild(componentScript);

      } catch (error) {
        console.error('Error loading scripts:', error);
      }
    };

    if (content) {
      loadScripts().catch(console.error);
    }

    return () => {
      const componentScript = document.getElementById('preview-script');
      if (componentScript) {
        document.body.removeChild(componentScript);
      }
    };
  }, [content]);

  return <div id="preview-root" />;
};

export default function PreviewPage() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetch('/api/preview')
      .then(response => response.json())
      .then(data => {
        if (data.content) {
          setContent(data.content);
        }
      })
      .catch(console.error);

    const eventSource = new EventSource('/api/preview/listen');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setContent(data);
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