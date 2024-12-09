import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { projectStore } from '@/lib/store/projects';
import { Readable } from 'stream';
import { ProjectData } from '@/types/project';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = projectStore.getProjectById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create project structure
    const projectFiles = generateProjectFiles(project);
    
    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    
    archive.on('error', (err) => {
      throw err;
    });

    // Add files to archive
    Object.entries(projectFiles).forEach(([path, content]) => {
      archive.append(content, { name: path });
    });

    await archive.finalize();

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.name.toLowerCase().replace(/\s+/g, '-')}.zip"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate project files' },
      { status: 500 }
    );
  }
}

function generateProjectFiles(project: ProjectData) {
  const files: Record<string, string> = {
    'package.json': JSON.stringify(
      {
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
          'next': '14.0.0',
          'react': '18.2.0',
          'react-dom': '18.2.0',
          ...(project.techStack.ui === 'Material UI' && {
            '@mui/material': '^5.0.0',
            '@emotion/react': '^11.0.0',
            '@emotion/styled': '^11.0.0',
          }),
          ...(project.techStack.state === 'Redux Toolkit' && {
            '@reduxjs/toolkit': '^2.0.0',
            'react-redux': '^9.0.0',
          }),
          ...(project.techStack.validation === 'Zod' && {
            'zod': '^3.0.0',
          }),
        },
        devDependencies: {
          '@types/node': '20.8.9',
          '@types/react': '18.2.33',
          '@types/react-dom': '18.2.14',
          'typescript': '5.2.2',
          'tailwindcss': '3.3.5',
          'postcss': '8.4.31',
          'autoprefixer': '10.4.16',
        }
      },
      null,
      2
    ),
    'README.md': generateReadme(project),
    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`,
    'tsconfig.json': JSON.stringify(
      {
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
          plugins: [
            {
              name: 'next'
            }
          ],
          paths: {
            '@/*': ['./src/*']
          }
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules']
      },
      null,
      2
    ),
    'tailwind.config.ts': `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config`,
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
next-env.d.ts`,
  };

  // Add project pages
  const pages = projectStore.getProjectPages(project.id);
  pages.forEach(page => {
    files[`src/app/${page.path}/page.tsx`] = page.content;
  });

  // Add project components
  const components = projectStore.getProjectComponents(project.id);
  components.forEach(component => {
    files[`src/components/${component.name}.tsx`] = component.code;
  });

  return files;
}

function generateReadme(project: ProjectData): string {
  return `# ${project.name}

${project.description}

## Tech Stack

- UI Framework: ${project.techStack.ui}
- State Management: ${project.techStack.state}
- Form Validation: ${project.techStack.validation}

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- \`/src/app\` - Application pages and routes
- \`/src/components\` - Reusable components
- \`/public\` - Static assets

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
${project.techStack.ui === 'Material UI' ? '- [Material UI Documentation](https://mui.com/docs)' : ''}
${project.techStack.state === 'Redux Toolkit' ? '- [Redux Toolkit Documentation](https://redux-toolkit.js.org)' : ''}
${project.techStack.validation === 'Zod' ? '- [Zod Documentation](https://zod.dev)' : ''}
`;
} 