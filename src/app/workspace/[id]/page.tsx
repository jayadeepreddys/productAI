"use client";

import { use } from 'react';
import { useEffect, useState } from 'react';
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
      </div>
    </div>
  );
} 