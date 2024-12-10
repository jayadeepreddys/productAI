"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LivePreview } from '@/components/workspace/LivePreview';
import { samplesStore } from '@/lib/store/samples';
import { projectStore, ComponentItem } from '@/lib/store/projects';

interface Params {
  id: string;
}

export default function WorkspaceComponents() {
  const params = useParams<Params>();
  const router = useRouter();
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'library'>('my');

  const sampleComponents = samplesStore.getSampleComponents();

  useEffect(() => {
    if (params?.id) {
      const projectComponents = projectStore.getProjectComponents(params.id);
      setComponents(projectComponents);
    }
  }, [params?.id]);

  const handleDeleteComponent = (componentId: string) => {
    if (!params?.id) return;

    if (window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
      projectStore.deleteComponent(params.id, componentId);
      setComponents(prev => prev.filter(comp => comp.id !== componentId));
    }
  };

  const handleSampleSelect = (sample: any) => {
    setSelectedSample(sample);
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Components</h1>
          <Link
            href={`/workspace/${params?.id}/components/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Create New Component
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`${
                activeTab === 'my'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Components
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`${
                activeTab === 'library'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Component Library
            </button>
          </nav>
        </div>

        {activeTab === 'my' ? (
          components.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-sm font-medium text-gray-900">No components created yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first component.
              </p>
              <div className="mt-4">
                <Link
                  href={`/workspace/${params?.id}/components/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  Create New Component
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <ul className="divide-y divide-gray-200">
                {components.map((component) => (
                  <li key={component.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{component.name}</h3>
                        <p className="text-sm text-gray-500">Type: {component.type}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/workspace/${params?.id}/components/${component.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteComponent(component.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleComponents.map((sample) => (
              <div
                key={sample.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div
                  className="h-48 bg-gray-200 relative cursor-pointer"
                  onClick={() => handleSampleSelect(sample)}
                >
                  {sample.preview && (
                    <img
                      src={sample.preview}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900">{sample.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{sample.description}</p>
                  <Link
                    href={`/workspace/${params?.id}/components/new?template=${sample.id}`}
                    className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Use Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedSample && (
        <div className="mt-4">
          <LivePreview 
            content={selectedSample.code}
            showPlaceholder={false}
          />
        </div>
      )}
    </div>
  );
} 