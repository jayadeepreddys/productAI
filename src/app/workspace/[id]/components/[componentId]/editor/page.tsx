"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CodeEditor } from '@/components/workspace/CodeEditor';

const DEFAULT_COMPONENT_TEMPLATE = `"use client";

import React from 'react';

interface Props {
  // Add your props here
}

export default function Component(props: Props) {
  return (
    <div>
      {/* Add your component content here */}
    </div>
  );
}
`;

export default function ComponentEditor({ params }: { params: { id: string; componentId: string } }) {
  const [code, setCode] = useState(DEFAULT_COMPONENT_TEMPLATE);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      console.log('Saving code:', code);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium text-gray-900">Component Editor</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <CodeEditor
          initialValue={code}
          language="typescript"
          onChange={setCode}
        />
      </div>
    </div>
  );
} 