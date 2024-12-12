"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { projectStore } from '@/lib/store/projects';
import { LivePreview } from '@/components/workspace/LivePreview';
import { Toast } from '@/components/ui/Toast';
import { CodeEditor } from '@/components/workspace/CodeEditor';
import EnhancedAIChat from '@/components/EnhancedAIChat';
import JSZip from 'jszip';
import { generateProjectFiles } from '@/lib/utils/projectFiles';

interface PageConfig {
  name: string;
  layout: string;
  content: string;
  isEditingCode: boolean;
  references: {
    components: string[];
    pages: string[];
    apis: string[];
  };
}

export default function PageEditor({ params: paramsPromise }: { params: Promise<{ id: string; pageId: string }> }) {
  const params = use(paramsPromise);
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [config, setConfig] = useState<PageConfig>({
    name: '',
    layout: '',
    content: '',
    isEditingCode: false,
    references: {
      components: [],
      pages: [],
      apis: []
    }
  });
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        const project = projectStore.getProjectById(params.id);
        if (!project) return;

        const pages = projectStore.getProjectPages(params.id);
        const page = pages.find(p => p.id === params.pageId);
        if (!page) return;

        setConfig(prev => ({
          ...prev,
          name: page.name || '',
          content: page.content || '',
          layout: page.layout || 'default',
          references: page.references || {
            components: [],
            pages: [],
            apis: []
          }
        }));
      } catch (error) {
        console.error('Error loading page:', error);
      }
    };

    loadPageContent();
  }, [params]);

  const handleContentChange = (newContent: string) => {
    setConfig(prev => ({
      ...prev,
      content: newContent
    }));

    // Update the project store
    projectStore.updatePage(params.id, params.pageId, {
      content: newContent
    });
    
    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownloadCode = async () => {
    try {
      const project = projectStore.getProjectById(params.id);
      if (!project) return;

      const files = generateProjectFiles(project);
      const zip = new JSZip();

      // Add all files to the zip
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      // Generate and download zip
      const blob = await zip.generateAsync({ type: "blob" });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-project.zip`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading project:', error);
    }
  };

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-gray-700 bg-gray-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-medium text-white truncate">{config.name}</h1>
          <p className="mt-1 text-sm text-gray-400">Page Editor</p>
        </div>
        
        <div className="p-4 space-y-3">
          <button
            onClick={handleDownloadCode}
            className="w-full px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Code
          </button>
          
          <button
            onClick={() => setShowCode(!showCode)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            {showCode ? 'Hide Code' : 'Show Code'}
          </button>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          <button
            onClick={() => handleContentChange(config.content)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`flex-1 flex ${showPreview ? 'mr-[500px]' : ''}`}>
          {/* Code Editor and Chat Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {showCode && (
              <div className="p-6 border-b border-gray-700">
                <CodeEditor
                  value={config.content}
                  onChange={handleContentChange}
                  language="typescript"
                />
              </div>
            )}
            
            <div className="flex-1 p-6 overflow-auto">
              <EnhancedAIChat 
                currentContent={config.content}
                onUpdateContent={handleContentChange}
                pageId={params.pageId}
              />
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="fixed top-0 right-0 w-[500px] h-screen bg-gray-800 border-l border-gray-700 overflow-hidden">
              <LivePreview content={config.content} />
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <Toast 
          message="Changes saved successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}