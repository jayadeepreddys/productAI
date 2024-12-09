"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData } from '@/types/project';
import { projectStore } from '@/lib/store/projects';

export default function Projects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    const loadedProjects = projectStore.getProjects();
    console.log('Loaded projects:', loadedProjects);
    setProjects(loadedProjects);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Your Projects</h1>
            <Link
              href="/setup/new-project"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
            >
              Create New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first project.
              </p>
              <div className="mt-6">
                <Link
                  href="/setup/new-project"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                >
                  Create New Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/workspace/${project.id}`}
                  className="block group"
                >
                  <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        Open Project →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
