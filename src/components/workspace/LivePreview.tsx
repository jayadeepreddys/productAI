"use client";

import { useState } from 'react';
import { Toast } from '@/components/ui/Toast';
import { deployToPreviewServer } from '@/lib/utils/previewServer';
import { useParams } from 'next/navigation';

export function LivePreview() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeploy = async () => {
    if (!projectId) {
      showToastMessage('Project ID not found', 'error');
      return;
    }

    setIsDeploying(true);
    try {
      const success = await deployToPreviewServer(projectId);
      
      if (success) {
        showToastMessage('Successfully deployed to preview', 'success');
        setPreviewUrl(`http://localhost:3001/preview/${projectId}`);
      } else {
        throw new Error('Deployment failed');
      }
    } catch (error) {
      console.error('Deploy error:', error);
      showToastMessage(
        'Failed to deploy: ' + (error instanceof Error ? error.message : 'Unknown error'),
        'error'
      );
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Live Preview</h2>
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className={`px-4 py-2 rounded-md text-white ${
            isDeploying 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isDeploying ? 'Deploying...' : 'Deploy'}
        </button>
      </div>

      {previewUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-700">
          <iframe
            src={previewUrl}
            className="w-full h-full"
            style={{ backgroundColor: 'white' }}
          />
        </div>
      )}

      {!previewUrl && (
        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">
            Deploy your changes to see the preview
          </p>
        </div>
      )}

      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
} 