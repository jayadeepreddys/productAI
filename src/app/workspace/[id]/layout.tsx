"use client";

import { useState } from 'react';
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

  const handleDownload = () => {
    window.location.href = `/api/download/${params.id}`;
  };

  return (
    <div className="min-h-screen flex">
      <WorkspaceSidebar projectId={params.id} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex justify-end">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Download Code
          </button>
        </div>
        {children}
      </main>
    </div>
  );
} 