"use client";

import React, { useState, useEffect } from 'react';
import { projectStore } from '@/lib/store/projects';

interface ComponentAnalyzerProps {
  content: string;
  projectId: string;
  onCreateComponents: (components: Array<{ name: string, code: string }>) => void;
}

export function ComponentAnalyzer({ content, projectId, onCreateComponents }: ComponentAnalyzerProps) {
  const [newComponents, setNewComponents] = useState<Array<{ name: string, code: string }>>([]);
  const [existingComponents, setExistingComponents] = useState<string[]>([]);

  useEffect(() => {
    // Parse AI response to find component sections
    const componentsMatch = content.match(/COMPONENTS_NEEDED:\n([\s\S]*?)(?=NEW_COMPONENTS:|$)/);
    const newComponentsMatch = content.match(/NEW_COMPONENTS:\n```typescript\n([\s\S]*?)```/);

    if (componentsMatch) {
      const componentsList = componentsMatch[1]
        .split('\n')
        .filter(line => line.startsWith('- '))
        .map(line => {
          const [name, status] = line.replace('- ', '').split(' ');
          return { name, isNew: status?.includes('new') };
        });

      setExistingComponents(componentsList.filter(c => !c.isNew).map(c => c.name));
      
      if (newComponentsMatch) {
        const newComponentsCode = newComponentsMatch[1];
        // Extract individual component codes
        const componentCodes = newComponentsCode.split(/export function/).filter(Boolean);
        setNewComponents(componentsList
          .filter(c => c.isNew)
          .map((c, i) => ({
            name: c.name,
            code: `export function ${componentCodes[i]}`
          }))
        );
      }
    }
  }, [content]);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Component Analysis</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Components</h4>
          <div className="space-y-1">
            {existingComponents.map(name => (
              <div key={name} className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {newComponents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">New Components Needed</h4>
            <div className="space-y-2">
              {newComponents.map(comp => (
                <div key={comp.name} className="flex items-center text-sm">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                  <span>{comp.name}</span>
                </div>
              ))}
              <button
                onClick={() => onCreateComponents(newComponents)}
                className="mt-2 w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create New Components
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 