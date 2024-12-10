import { ProjectData, PageData, ComponentData } from '@/lib/types';
import { projectStore } from '@/lib/store/projects';

export function generateProjectFiles(project: ProjectData) {
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: project.name.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        'next': '^13.4.0',
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'tailwindcss': '^3.3.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'typescript': '^5.0.0',
        'autoprefixer': '^10.4.0',
        'postcss': '^8.4.0'
      }
    }, null, 2),
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./src/*'] }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2),
    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    '.gitignore': `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# typescript
*.tsbuildinfo
next-env.d.ts`
  };

  // Add project pages
  const pages = projectStore.getProjectPages(project.id);
  if (pages) {
    pages.forEach(page => {
      files[`src/app/${page.path}/page.tsx`] = page.content;
    });
  }

  // Add project components
  const components = projectStore.getProjectComponents(project.id);
  if (components) {
    components.forEach(component => {
      files[`src/components/${component.name}.tsx`] = component.content || '';
    });
  }

  return files;
} 