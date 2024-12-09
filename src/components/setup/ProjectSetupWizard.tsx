"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectData, StepProps } from '@/types/project';
import { ProjectBasicInfo } from './steps/ProjectBasicInfo';
import { TechStackSelection } from './steps/TechStackSelection';
import { GitConfiguration } from './steps/GitConfiguration';
import { ProjectSummary } from './steps/ProjectSummary';
import { projectStore } from '@/lib/store/projects';

type SetupStep = 'basic-info' | 'tech-stack' | 'git-config' | 'summary';

type StepComponent = React.ComponentType<StepProps>;

interface StepConfig {
  component: StepComponent;
  title: string;
}

export default function ProjectSetupWizard() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('basic-info');
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    techStack: {
      ui: '',
      state: '',
      validation: '',
    },
    gitProvider: '',
    repoName: '',
  });
  
  const router = useRouter();

  const steps: Record<SetupStep, StepConfig> = {
    'basic-info': {
      component: ProjectBasicInfo,
      title: 'Basic Information',
    },
    'tech-stack': {
      component: TechStackSelection,
      title: 'Technology Stack',
    },
    'git-config': {
      component: GitConfiguration,
      title: 'Git Configuration',
    },
    'summary': {
      component: ProjectSummary,
      title: 'Project Summary',
    },
  };

  const handleNext = () => {
    const stepOrder: SetupStep[] = ['basic-info', 'tech-stack', 'git-config', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex === stepOrder.length - 1) {
      handleProjectCreation();
    } else if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: SetupStep[] = ['basic-info', 'tech-stack', 'git-config', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleProjectCreation = async () => {
    try {
      setError(null);
      if (!projectData.name || !projectData.description) {
        throw new Error('Please fill in all required fields');
      }

      // Ensure all required fields are present
      const newProject = projectStore.addProject({
        name: projectData.name,
        description: projectData.description,
        techStack: {
          ui: projectData.techStack?.ui || 'React',
          state: projectData.techStack?.state || 'None',
          validation: projectData.techStack?.validation || 'None',
        },
        gitProvider: projectData.gitProvider || 'None',
        repoName: projectData.repoName || projectData.name.toLowerCase().replace(/\s+/g, '-'),
      });

      // Log the new project to verify it was created correctly
      console.log('Created project:', newProject);

      // Navigate to the workspace page with the correct ID
      router.push(`/workspace/${newProject.id}`);
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="mb-8">
        <nav className="flex items-center justify-center" aria-label="Progress">
          <ol className="flex items-center space-x-5">
            {Object.entries(steps).map(([key, { title }], index) => (
              <li key={key} className="flex items-center">
                <div className={`flex items-center ${currentStep === key ? 'text-primary' : 'text-gray-500'}`}>
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                    ${currentStep === key ? 'bg-primary/10 border-2 border-primary' : 'border border-gray-300'}`}>
                    {index + 1}
                  </span>
                  <span className="ml-3 text-sm font-medium">{title}</span>
                </div>
                {index < Object.keys(steps).length - 1 && (
                  <div className="ml-4 flex-shrink-0 h-0.5 w-8 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {React.createElement(steps[currentStep].component, {
          data: projectData,
          onUpdate: (newData: ProjectData) => setProjectData(newData),
          onNext: handleNext,
          onBack: handleBack,
        })}
      </div>
    </div>
  );
} 