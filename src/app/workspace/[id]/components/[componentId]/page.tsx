"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { projectStore } from '@/lib/store/projects';
import { LivePreviewComponent } from '@/components/workspace/LivePreviewComponent';
import { Toast } from '@/components/ui/Toast';
import EnhancedAIChat from '@/components/EnhancedAIChat';

// Helper function to generate component code
function generateComponentCode(name: string, props: Array<{ name: string; type: string }> = []) {
  const propsString = props.map(p => `${p.name}: ${p.type}`).join(', ');
  const propsInterface = props.length > 0 ? `\ninterface ${name}Props {\n  ${propsString}\n}\n` : '';
  const propsParam = props.length > 0 ? `{ ${props.map(p => p.name).join(', ')} }: ${name}Props` : '';

  return `"use client";

import { useState } from 'react';${propsInterface}
export function ${name}(${propsParam}) {
  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        ${name} Component
      </h2>
      <p className="mt-2 text-gray-600">
        Edit this component to add your content
      </p>
    </div>
  );
}`;
}

interface ComponentConfig {
  name: string;
  type: 'ui' | 'layout' | 'form' | 'data';
  props: Array<{ name: string; type: string }>;
  style: Record<string, string>;
  code: string;
}

const DEFAULT_CONFIG: ComponentConfig = {
  name: '',
  type: 'ui',
  props: [],
  style: {},
  code: ''
};

export default function ComponentEditor({ params: paramsPromise }: { params: Promise<{ id: string; componentId: string }> }) {
  const params = use(paramsPromise);
  const [config, setConfig] = useState<ComponentConfig>(DEFAULT_CONFIG);
  const [showCode, setShowCode] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isNewComponent, setIsNewComponent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (params?.id && params?.componentId) {
      if (params.componentId === 'new') {
        setIsNewComponent(true);
      } else {
        const components = projectStore.getProjectComponents(params.id);
        const component = components.find(c => c.id === params.componentId);
        if (component) {
          setConfig({
            name: component.name,
            type: component.type,
            props: component.props || [],
            style: component.style || DEFAULT_CONFIG.style,
            code: component.code || generateComponentCode(component.name, component.props || [])
          });
        }
      }
    }
  }, [params?.id, params?.componentId]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.name.trim()) return;

    // Generate initial component code with the provided name
    const newCode = generateComponentCode(config.name, []);
    setConfig(prev => ({
      ...prev,
      code: newCode
    }));
    setIsNewComponent(false);
  };

  // If it's a new component and name hasn't been set, show the name input form
  if (isNewComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Component</h2>
          <form onSubmit={handleNameSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="componentName" className="block text-sm font-medium text-gray-700">
                  Component Name
                </label>
                <input
                  type="text"
                  id="componentName"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="MyComponent"
                  pattern="[A-Z][A-Za-z]*"
                  title="Component name must start with a capital letter and contain only letters"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must start with a capital letter (e.g., Button, CardList)
                </p>
              </div>
              <div>
                <label htmlFor="componentType" className="block text-sm font-medium text-gray-700">
                  Component Type
                </label>
                <select
                  id="componentType"
                  value={config.type}
                  onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as ComponentConfig['type'] }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ui">UI Component</option>
                  <option value="layout">Layout Component</option>
                  <option value="form">Form Component</option>
                  <option value="data">Data Component</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90"
                >
                  Create Component
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const handleContentChange = (newContent: string) => {
    setConfig(prev => ({
      ...prev,
      code: newContent
    }));

    // Update the project store
    if (params.componentId === 'new') {
      // Logic to add a new component
      projectStore.addComponent(params.id, {
        ...config,
        code: newContent
      });
    } else {
      // Logic to update an existing component
      projectStore.updateComponent(params.id, params.componentId, {
        code: newContent
      });
    }
    
    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="h-screen flex relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-medium text-gray-900">
            {params.componentId === 'new' ? 'Create New Component' : `Edit Component: ${config.name}`}
          </h1>
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
              onClick={() => handleContentChange(config.code)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col mt-[73px] ${showPreview ? 'mr-[520px]' : ''}`}>
        {/* Code Editor Section */}
        {showCode && (
          <div className="border-b border-gray-200">
            <textarea
              value={config.code}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-[300px] p-4 font-mono text-sm border-0 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter your component code here..."
            />
          </div>
        )}
        
        {/* AI Chat Section */}
        <div className="flex-1">
          <EnhancedAIChat 
            currentContent={config.code}
            onUpdateContent={handleContentChange}
            pageId={params.componentId}
            contextType="component"
          />
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
          <div className="fixed top-0 right-0 w-[500px] h-screen bg-white border-l border-gray-200 overflow-hidden">
            <div className="h-full pt-[73px]">
              <LivePreviewComponent content={config.code} type="component" />
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