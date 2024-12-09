"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { projectStore, PageItem } from '@/lib/store/projects';

interface Params {
  id: string;
}

export default function WorkspacePages() {
  const params = useParams<Params>();
  const [pages, setPages] = useState<PageItem[]>([]);

  useEffect(() => {
    if (params?.id) {
      const projectPages = projectStore.getProjectPages(params.id);
      setPages(projectPages);
    }
  }, [params?.id]);

  const handleDeletePage = (pageId: string) => {
    if (!params?.id) return;

    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      projectStore.deletePage(params.id, pageId);
      setPages(prev => prev.filter(page => page.id !== pageId));
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <Link
            href={`/workspace/${params?.id}/pages/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Create New Page
          </Link>
        </div>

        {pages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-sm font-medium text-gray-900">No pages created yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first page.
            </p>
            <div className="mt-4">
              <Link
                href={`/workspace/${params?.id}/pages/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Create New Page
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <ul className="divide-y divide-gray-200">
              {pages.map((page) => (
                <li key={page.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{page.name}</h3>
                      <p className="text-sm text-gray-500">Layout: {page.layout || 'Default'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/workspace/${params?.id}/pages/${page.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePage(page.id)}
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
        )}
      </div>
    </div>
  );
} 