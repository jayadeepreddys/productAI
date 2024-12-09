"use client";

import { use } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData } from '@/types/project';
import { projectStore } from '@/lib/store/projects';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function WorkspaceOverview({ params }: PageProps) {
  const [project, setProject] = useState<ProjectData | undefined>();
  const resolvedParams = use(params);

  useEffect(() => {
    if (resolvedParams?.id) {
      const foundProject = projectStore.getProjectById(resolvedParams.id);
      setProject(foundProject);
    }
  }, [resolvedParams?.id]);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Project Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tech Stack</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">UI Framework</dt>
                <dd className="text-sm text-gray-900">{project.techStack.ui}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">State Management</dt>
                <dd className="text-sm text-gray-900">{project.techStack.state}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Form Validation</dt>
                <dd className="text-sm text-gray-900">{project.techStack.validation}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Git Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="text-sm text-gray-900">{project.gitProvider}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Repository</dt>
                <dd className="text-sm text-gray-900">{project.repoName}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">API Routes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Workspace API</h3>
                <code className="block mt-1 text-xs bg-gray-50 p-2 rounded">
                  GET /api/workspace/{project.id}
                </code>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Pages API</h3>
                <code className="block mt-1 text-xs bg-gray-50 p-2 rounded">
                  GET /api/workspace/{project.id}/pages
                </code>
                <code className="block mt-1 text-xs bg-gray-50 p-2 rounded">
                  POST /api/workspace/{project.id}/pages
                </code>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Components API</h3>
                <code className="block mt-1 text-xs bg-gray-50 p-2 rounded">
                  GET /api/workspace/{project.id}/components
                </code>
                <code className="block mt-1 text-xs bg-gray-50 p-2 rounded">
                  POST /api/workspace/{project.id}/components
                </code>
              </div>
              <Link
                href={`/workspace/${project.id}/api`}
                className="block mt-4 text-sm text-primary hover:text-primary/90 font-medium"
              >
                View API Documentation →
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pages</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Manage your project pages and layouts</p>
              <Link
                href={`/workspace/${project.id}/pages`}
                className="inline-flex items-center text-sm text-primary hover:text-primary/90 font-medium"
              >
                View Pages →
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Components</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Browse and manage reusable components</p>
              <Link
                href={`/workspace/${project.id}/components`}
                className="inline-flex items-center text-sm text-primary hover:text-primary/90 font-medium"
              >
                View Components →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 