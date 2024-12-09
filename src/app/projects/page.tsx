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

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone and will delete all associated pages.')) {
      projectStore.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    }
  };

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

          {projects.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first project. You can create multiple projects and manage them all in one place.
              </p>
              <div className="mt-6">
                <Link
                  href="/setup/new-project"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 shadow-sm hover:shadow transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Project
                </Link>
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="relative group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                  <Link
                    href={`/workspace/${project.id}`}
                    className="block p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {project.techStack.ui}
                          </span>
                          {project.techStack.state !== 'None' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {project.techStack.state}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteProject(project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center text-primary group-hover:underline">
                        Open Project
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
