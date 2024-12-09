import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
            Project Manager
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create, manage, and track your development projects with ease. 
            Get started by creating your first project.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/setup/new-project"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create New Project
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View Projects
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const features = [
  {
    title: 'Project Templates',
    description: 'Choose from pre-configured project templates or create your own custom setup.',
  },
  {
    title: 'Tech Stack Selection',
    description: 'Easily select and configure your preferred technologies and frameworks.',
  },
  {
    title: 'Git Integration',
    description: 'Seamlessly connect with your preferred Git provider and manage repositories.',
  },
];
