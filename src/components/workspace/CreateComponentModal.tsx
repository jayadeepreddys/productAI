"use client";

import { useState } from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';

interface CreateComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; type: string }) => void;
  onDelete?: () => void;
  initialData?: {
    name?: string;
    type?: string;
  };
  isEditing?: boolean;
}

const COMPONENT_TYPES = [
  { id: 'ui', value: 'ui', label: 'UI Component', description: 'Buttons, cards, and other UI elements' },
  { id: 'layout', value: 'layout', label: 'Layout Component', description: 'Headers, footers, and page layouts' },
  { id: 'form', value: 'form', label: 'Form Component', description: 'Input fields, forms, and validation' },
  { id: 'data', value: 'data', label: 'Data Component', description: 'Tables, lists, and data visualization' },
];

type Step = 'name' | 'type' | 'confirm';

export function CreateComponentModal({
  isOpen,
  onClose,
  onCreate,
  onDelete,
  initialData = {},
  isEditing = false
}: CreateComponentModalProps) {
  const [name, setName] = useState(initialData.name || '');
  const [type, setType] = useState(initialData.type || '');
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    
    if (currentStep === 'name') {
      if (!name.trim()) {
        setError('Please enter a component name');
        return;
      }
      setCurrentStep('type');
    } else if (currentStep === 'type') {
      if (!type) {
        setError('Please select a component type');
        return;
      }
      setCurrentStep('confirm');
    } else if (currentStep === 'confirm') {
      onCreate({ name: name.trim(), type });
      setName('');
      setType('');
      setCurrentStep('name');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep === 'type') setCurrentStep('name');
    if (currentStep === 'confirm') setCurrentStep('type');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <div className="space-y-4">
            <div className="chat-message bg-gray-100 p-4 rounded-lg">
              What would you like to name your component?
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="e.g., Header, UserCard, LoginForm"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        );

      case 'type':
        return (
          <div className="space-y-4">
            <div className="chat-message bg-gray-100 p-4 rounded-lg">
              What type of component is {name}?
            </div>
            <div className="space-y-2">
              {COMPONENT_TYPES.map((componentType) => (
                <div
                  key={componentType.id}
                  className={`relative rounded-lg border p-4 cursor-pointer hover:border-primary ${
                    type === componentType.value ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setType(componentType.value);
                    setTimeout(handleNext, 500);
                  }}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          type === componentType.value
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {type === componentType.value && (
                          <div className="h-2 w-2 m-0.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {componentType.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {componentType.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-4">
            <div className="chat-message bg-gray-100 p-4 rounded-lg">
              Great! Here's what I'll create:
              <div className="mt-2 font-medium">
                • Name: {name}
                <br />
                • Type: {COMPONENT_TYPES.find(t => t.value === type)?.label}
              </div>
              <div className="mt-2">
                Would you like me to create this component?
              </div>
            </div>
          </div>
        );
    }
  };

  const renderDeleteButton = () => {
    if (!isEditing || !onDelete) return null;

    return (
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this component?')) {
            onDelete();
            onClose();
          }
        }}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
      >
        Delete Component
      </button>
    );
  };

  return (
    <HeadlessDialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <HeadlessDialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <HeadlessDialog.Title className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Component' : 'Create New Component'}
            </HeadlessDialog.Title>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {renderStep()}

              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between space-x-3">
              <div>
                {renderDeleteButton()}
              </div>
              <div className="flex space-x-3">
                {currentStep !== 'name' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90"
                >
                  {currentStep === 'confirm' ? (isEditing ? 'Save Changes' : 'Create Component') : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeadlessDialog>
  );
} 