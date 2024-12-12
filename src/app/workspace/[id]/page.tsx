"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { projectStore } from '@/lib/store/projects';
import { ProjectData } from '@/types/project';

interface PageProps {
  params: Promise<{ id: string }>;
}

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
      <div className="p-8 text-center text-gray-400">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Project Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">Tech Stack</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-400">UI Framework</dt>
                <dd className="text-sm text-gray-200">{project.techStack.ui}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">State Management</dt>
                <dd className="text-sm text-gray-200">{project.techStack.state}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">Form Validation</dt>
                <dd className="text-sm text-gray-200">{project.techStack.validation}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">Git Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-400">Provider</dt>
                <dd className="text-sm text-gray-200">{project.gitProvider}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">Repository</dt>
                <dd className="text-sm text-gray-200">{project.repoName}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 