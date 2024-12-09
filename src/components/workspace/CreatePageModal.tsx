"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (pageData: { name: string; path: string }) => void;
}

export function CreatePageModal({ isOpen, onClose, onCreate }: CreatePageModalProps) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ name, path });
    setName('');
    setPath('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Create New Page
              </h3>
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Page Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="Home"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="path" className="block text-sm font-medium text-gray-700">
                      Page Path
                    </label>
                    <input
                      type="text"
                      id="path"
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="/home"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 