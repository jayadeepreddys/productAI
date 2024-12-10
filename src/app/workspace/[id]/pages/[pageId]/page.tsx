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
  const [config, setConfig] = useState<PageConfig>({
    name: '',
    layout: 'default',
    content: '',
    isEditingCode: true,
    references: {
      components: [],
      pages: [],
      apis: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

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
      } finally {
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-white">
          <h1 className="text-xl font-medium text-gray-900">Edit Page: {config.name}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={() => handleContentChange(config.content)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <textarea
            value={config.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter your page content here..."
          />
        </div>
        
        <div className="h-1/3 border-t">
          <EnhancedAIChat 
            currentContent={config.content}
            onUpdateContent={handleContentChange}
            pageId={params.pageId}
          />
        </div>
      </div>

      {/* Floating Preview */}
      {showPreview && (
        <div className="fixed top-4 right-4 w-[500px] h-[calc(100vh-32px)] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 flex items-center justify-end px-2">
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-full pt-6">
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