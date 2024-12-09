"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectData } from '@/types/project';
import { projectStore } from '@/lib/store/projects';
import Link from 'next/link';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectData | undefined>();

  useEffect(() => {
    if (typeof id === 'string') {
      const foundProject = projectStore.getProjectById(id);
      setProject(foundProject);
    }
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Project Not Found</h1>
              <Link
                href="/projects"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <div className="flex justify-between items-center">
              <Link
                href="/projects"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Projects
              </Link>
              <Link
                href={`/workspace/${project.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Start Building
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{project.description}</p>
            </div>

            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Tech Stack</h2>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">UI Framework:</span> {project.techStack.ui}</p>
                <p><span className="font-medium">State Management:</span> {project.techStack.state}</p>
                <p><span className="font-medium">Form Validation:</span> {project.techStack.validation}</p>
              </div>
            </div>

            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Git Configuration</h2>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Provider:</span> {project.gitProvider}</p>
                <p><span className="font-medium">Repository:</span> {project.repoName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 