import React from 'react';

interface FileChange {
  filepath: string;
  content: string;
  type: 'component' | 'page';
}

interface FileChangesListProps {
  changes: FileChange[];
  onCreateFile: (change: FileChange) => void;
}

export function FileChangesList({ changes, onCreateFile }: FileChangesListProps) {
  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-medium">Suggested Files</h3>
      <div className="grid gap-4">
        {changes.map((change, index) => (
          <div 
            key={index}
            className="border border-gray-700 rounded-lg p-4 bg-gray-800"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-gray-400">Type: </span>
                <span className="text-gray-200 capitalize">{change.type}</span>
              </div>
              <button
                onClick={() => onCreateFile(change)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create File
              </button>
            </div>
            <div>
              <span className="text-gray-400">Path: </span>
              <span className="text-gray-200 font-mono text-sm">{change.filepath}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 