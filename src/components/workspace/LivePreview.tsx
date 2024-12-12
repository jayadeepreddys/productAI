"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { projectStore } from '@/lib/store/projects';

interface DeploymentResult {
  success: boolean;
  error?: string;
  results?: Array<{
    path: string;
    success: boolean;
    size?: number;
    error?: string;
  }>;
}

export function LivePreview() {
  const params = useParams();
  const projectId = params.id as string;
  const [width, setWidth] = useState<number>(375);
  const [iframeKey, setIframeKey] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  const deployToPreview = async () => {
    setIsDeploying(true);
    try {
      const pages = projectStore.getProjectPages(projectId);
      const components = projectStore.getProjectComponents(projectId);

      const files: Record<string, string> = {};

      // Add pages with proper Next.js structure
      pages?.forEach(page => {
        if (page.path && page.content) {
          const normalizedPath = page.path.replace(/^\//, '').replace(/\.tsx$/, '');
          // Skip layout and header files
          if (normalizedPath !== 'layout' && normalizedPath !== 'header') {
            files[`app/${normalizedPath}/page.tsx`] = `
              "use client";
              ${page.content}
            `;
          }
        }
      });

      // Add components with proper structure
      components?.forEach(component => {
        const componentContent = component.content || component.code;
        if (componentContent) {
          const componentName = component.name.replace(/\.tsx$/, '');
          // Skip Header component
          if (componentName !== 'Header') {
            const componentPath = `components/${componentName}.tsx`;
            files[componentPath] = `
              "use client";
              ${componentContent}
            `;
          }
        }
      });

      console.log('Starting deployment with files:', files);
      const response = await fetch('http://localhost:3001/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          files,
          projectId 
        }),
      });

      const result: DeploymentResult = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Deployment failed');
      }

      // Log deployment results
      result.results?.forEach(file => {
        if (file.success) {
          console.log(`✓ ${file.path} (${file.size} bytes)`);
        } else {
          console.error(`✗ ${file.path}: ${file.error}`);
        }
      });

      console.log('Deployment successful, refreshing preview...');
      setIframeKey(prev => prev + 1);
    } catch (error) {
      console.error('Deploy error:', error);
    } finally {
      setIsDeploying(false);
    }
  };

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
            onClick={deployToPreview}
            disabled={isDeploying}
            className={`px-3 py-1 rounded text-sm ${
              isDeploying 
                ? 'bg-gray-200 text-gray-500' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </button>
          <button onClick={() => window.open('http://localhost:3001', '_blank')} className="p-2 text-gray-500 hover:text-gray-700" title="Open in new tab">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button onClick={() => setIframeKey(prev => prev + 1)} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh preview">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 overflow-auto">
        <div className="mx-auto transition-all duration-200 bg-white" style={{ width: `${width}px` }}>
          <iframe 
            key={iframeKey}
            src="http://localhost:3001"
            className="w-full h-full border-0"
            style={{ height: 'calc(100vh - 3rem)' }}
          />
        </div>
      </div>
    </div>
  );
} 