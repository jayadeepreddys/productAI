import ProjectSetupWizard from '@/components/setup/ProjectSetupWizard';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function NewProject() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground text-center mb-8">
            Create New Project
          </h1>
          <ProjectSetupWizard />
        </div>
      </div>
    </div>
  );
}
