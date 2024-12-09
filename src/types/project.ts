export interface ProjectData {
  id: string;
  name: string;
  description: string;
  techStack: {
    ui: string;
    state: string;
    validation: string;
  };
  gitProvider: string;
  repoName: string;
  createdAt: string;
}

export interface StepProps {
  data: ProjectData;
  onUpdate: (data: ProjectData) => void;
  onNext: () => void;
  onBack?: () => void;
} 