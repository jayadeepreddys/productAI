"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { projectStore } from "@/lib/store/projects";
import { ProjectData } from "@/types/project";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            What are you building today?
          </h1>
          <p className="mt-6 text-xl text-indigo-200 max-w-2xl mx-auto">
            Let's turn your idea into reality. Start by telling us about your project.
          </p>
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <ProjectInitializer />
        </div>

        <MyProjects />
      </main>
    </div>
  );
}

function ProjectInitializer() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  });

  const handleCreateProject = async () => {
    const newProject = projectStore.addProject({
      name: projectData.name,
      description: projectData.description,
      techStack: {
        ui: 'React',
        state: 'None',
        validation: 'None',
      },
      gitProvider: 'None',
      repoName: projectData.name.toLowerCase().replace(/\s+/g, '-'),
    });

    router.push(`/workspace/${newProject.id}/pages`);
  };

  if (step === 1) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6">Name your project</h2>
        <input
          type="text"
          placeholder="My Awesome Project"
          value={projectData.name}
          onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {projectData.name && (
          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Continue →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
      <h2 className="text-2xl font-semibold mb-6">Describe your project</h2>
      <textarea
        placeholder="What are you planning to build?"
        value={projectData.description}
        onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
      />
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleCreateProject}
          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
        >
          Create Project
        </button>
      </div>
    </div>
  );
}

function MyProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const loadedProjects = projectStore.getProjects();
      setProjects(loadedProjects);
    }
  }, [session]);

  if (!session || projects.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-semibold mb-8">My Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/workspace/${project.id}/pages`}
            className="block bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-colors"
          >
            <h3 className="text-xl font-medium">{project.name}</h3>
            <p className="mt-2 text-indigo-200 line-clamp-2">{project.description}</p>
            <div className="mt-4 flex items-center text-sm text-indigo-300">
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              <span className="ml-auto">View Project →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
