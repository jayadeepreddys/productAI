import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen flex">
      <WorkspaceSidebar projectId={params.id} />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
} 