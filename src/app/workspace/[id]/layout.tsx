"use client";

import { use } from 'react';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default function WorkspaceLayout({
  children,
  params: paramsPromise,
}: LayoutProps) {
  const params = use(paramsPromise);

  return (
    <div className="min-h-screen flex">
      <WorkspaceSidebar projectId={params.id} />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
} 