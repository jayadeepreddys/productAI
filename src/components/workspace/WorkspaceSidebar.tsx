"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData } from '@/types/project';
import { projectStore } from '@/lib/store/projects';

interface WorkspaceSidebarProps {
  projectId: string;
}

export function WorkspaceSidebar({ projectId }: WorkspaceSidebarProps) {
  const [project, setProject] = useState<ProjectData>();

  useEffect(() => {
    const foundProject = projectStore.getProjectById(projectId);
    setProject(foundProject);
  }, [projectId]);

  const workspaceItems = [
    { name: 'Overview', href: `/workspace/${projectId}` },
    { name: 'Pages', href: `/workspace/${projectId}/pages` },
    { name: 'Components', href: `/workspace/${projectId}/components` },
    { name: 'API Routes', href: `/workspace/${projectId}/api` },
    { name: 'Settings', href: `/workspace/${projectId}/settings` },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 truncate">
          {project?.name || 'Loading...'}
        </h2>
      </div>
      <nav className="mt-4">
        {workspaceItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 