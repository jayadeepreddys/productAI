import { projectStore } from '@/lib/store/projects';
import type { PageData } from '@/lib/store/projects';

interface FileStructure {
  [key: string]: string;
}

export function generatePreviewFiles(projectId: string): FileStructure {
  const pages = projectStore.getProjectPages(projectId);
  const components = projectStore.getProjectComponents(projectId);
  const files: FileStructure = {};

  // Generate app directory structure
  files['app/layout.tsx'] = generateLayoutFile();
  files['app/page.tsx'] = generateHomePage();

  // Generate pages
  pages.forEach((page: PageData) => {
    const routePath = page.path.replace(/^\//, ''); // Remove leading slash
    files[`app/${routePath}/page.tsx`] = generatePageFile(page);
  });

  // Generate components
  components.forEach((component) => {
    files[`components/${component.name}.tsx`] = component.code || '';
  });

  // Add necessary configuration files
  files['tsconfig.json'] = generateTSConfig();
  files['package.json'] = generatePackageJson();

  return files;
}

function generateLayoutFile(): string {
  return `
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
`;
}

function generateHomePage(): string {
  return `
export default function Home() {
  return (
    <main>
      <h1>Welcome to Preview</h1>
    </main>
  )
}
`;
}

function generatePageFile(page: PageData): string {
  return `
${page.content || `
export default function Page() {
  return (
    <div>
      <h1>${page.name}</h1>
    </div>
  )
}`}
`;
}

function generateTSConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "es5",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "node",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [
        {
          name: "next"
        }
      ],
      paths: {
        "@/*": ["./*"]
      }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }, null, 2);
}

function generatePackageJson(): string {
  return JSON.stringify({
    name: "preview",
    version: "0.1.0",
    private: true,
    scripts: {
      "dev": "next dev",
      "build": "next build",
      "start": "next start"
    },
    dependencies: {
      "next": "14.0.1",
      "react": "^18",
      "react-dom": "^18"
    },
    devDependencies: {
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "typescript": "^5"
    }
  }, null, 2);
} 