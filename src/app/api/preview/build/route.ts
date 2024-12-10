import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  let tempDir = '';
  
  try {
    const { content } = await request.json();

    // Create a temporary directory with a unique name
    tempDir = path.join(os.tmpdir(), `preview-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    // Create the Next.js project structure
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'src/app'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'public'), { recursive: true });
    
    // Process the content to remove any existing imports and 'use client'
    const processedContent = content
      .replace(/"use client";?/g, '')
      .replace(/import.*?;/g, '')
      .trim();

    // Create necessary files
    const files = {
      'src/app/page.tsx': `
        'use client';
        
        // Mock data
        const services = [
          'Emergency Care',
          'Outpatient Clinics',
          'Specialized Treatment',
          'Diagnostic Services',
          'Rehabilitation Services',
        ];

        const doctors = [
          { name: 'Dr. John Doe', specialty: 'Cardiology' },
          { name: 'Dr. Jane Smith', specialty: 'Pediatrics' },
          { name: 'Dr. Michael Johnson', specialty: 'Orthopedics' },
          { name: 'Dr. Emily Davis', specialty: 'Dermatology' },
          { name: 'Dr. Robert Wilson', specialty: 'Neurology' },
        ];

        const laboratoryServices = [
          'Blood Tests',
          'Urine Analysis',
          'Pathology',
          'Microbiology',
          'Genetic Testing',
        ];

        ${processedContent}
      `,
      'src/app/layout.tsx': `
        export const metadata = {
          title: 'Preview',
          description: 'Live preview of the component',
        }
        
        export default function RootLayout({
          children,
        }: {
          children: React.ReactNode
        }) {
          return (
            <html lang="en">
              <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <script src="https://cdn.tailwindcss.com"></script>
              </head>
              <body>{children}</body>
            </html>
          )
        }
      `,
      'next.config.js': `
        /** @type {import('next').NextConfig} */
        const nextConfig = {
          output: 'export',
          images: {
            unoptimized: true
          },
          typescript: {
            ignoreBuildErrors: true
          }
        }
        module.exports = nextConfig
      `,
      'package.json': JSON.stringify({
        name: "preview",
        version: "1.0.0",
        private: true,
        scripts: {
          "build": "NODE_ENV=production next build"
        },
        dependencies: {
          "next": "14.0.0",
          "react": "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@types/node": "^20.0.0",
          "@types/react": "^18.2.0",
          "typescript": "^5.0.0"
        }
      }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
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
            "@/*": ["./src/*"]
          }
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"]
      })
    };

    // Write all files
    await Promise.all(
      Object.entries(files).map(([filename, content]) =>
        fs.writeFile(path.join(tempDir, filename), content)
      )
    );

    console.log('Installing dependencies...');
    await execAsync('npm install', { cwd: tempDir });

    console.log('Building project...');
    const { stdout, stderr } = await execAsync('npm run build', { 
      cwd: tempDir,
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('Build output:', stdout);
    if (stderr) console.error('Build errors:', stderr);

    // Read the generated HTML
    const html = await fs.readFile(
      path.join(tempDir, 'out', 'index.html'),
      'utf-8'
    );

    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Build error:', error);
    
    // Clean up on error
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate preview',
        details: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export const runtime = 'nodejs';