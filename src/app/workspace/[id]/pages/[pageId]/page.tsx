"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { projectStore } from '@/lib/store/projects';
import { LivePreview } from '@/components/workspace/LivePreview';
import { Toast } from '@/components/ui/Toast';
import EnhancedAIChat from '@/components/EnhancedAIChat';

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

  return (
    <div className="h-screen flex relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-medium text-gray-900">Edit Page: {config.name}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={() => handleContentChange(config.content)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Adjusted for fixed header */}
      <div className={`flex-1 flex flex-col mt-[73px] ${showPreview ? 'mr-[520px]' : ''}`}>
        {/* Code Editor Section - Hidden by default */}
        {showCode && (
          <div className="border-b border-gray-200">
            <textarea
              value={config.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-[300px] p-4 font-mono text-sm border-0 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter your page content here..."
            />
          </div>
        )}
        
        {/* AI Chat Section */}
        <div className="flex-1">
          <EnhancedAIChat 
            currentContent={config.content}
            onUpdateContent={handleContentChange}
            pageId={params.pageId}
          />
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="fixed top-0 right-0 w-[500px] h-screen bg-white border-l border-gray-200 overflow-hidden">
          <div className="h-full pt-[73px]">
            <LivePreview content={config.content} />
          </div>
        </div>
      )}

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