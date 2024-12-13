import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: Request) {
  // Add CORS headers to the response
  const headers = {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const projectData = await request.json();
    const { id, name, pages, components } = projectData;

    // Create components directory
    const componentsDir = path.join(process.cwd(), 'src/components');
    await fs.mkdir(componentsDir, { recursive: true });

    // Write pages
    for (const page of pages) {
      if (page.path && page.content) {
        // Remove leading slash if present
        const cleanPath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
        const pagePath = path.join(process.cwd(), 'src/app', cleanPath === '' ? 'page.tsx' : `${cleanPath}/page.tsx`);
        await fs.mkdir(path.dirname(pagePath), { recursive: true });
        await fs.writeFile(pagePath, `"use client";\n\n${page.content}`);
      }
    }

    // Write components
    for (const component of components) {
      if (component.name && component.content) {
        const componentPath = path.join(componentsDir, `${component.name}.tsx`);
        await fs.writeFile(componentPath, `"use client";\n\n${component.content}`);
      }
    }

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error('Preview deploy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deploy to preview' },
      { status: 500, headers }
    );
  }
} 