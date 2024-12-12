"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import { CollapsibleMenu } from '@/components/workspace/CollapsibleMenu';
import { projectStore } from '@/lib/store/projects';
import { ProjectData } from '@/types/project';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default function WorkspaceLayout({
  children,
  params,
}: LayoutProps) {
  const [project, setProject] = useState<ProjectData>();
  const resolvedParams = use(params);

  useEffect(() => {
    if (resolvedParams?.id) {
      const foundProject = projectStore.getProjectById(resolvedParams.id);
      setProject(foundProject);
    }
  }, [resolvedParams?.id]);

  if (!project) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <CollapsibleMenu projectId={resolvedParams.id} projectName={project.name} />
      <main className="flex-1 overflow-auto bg-gray-900">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
} 