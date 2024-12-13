import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function printDirectoryTree(dir: string, prefix = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const tree: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // Skip hidden files
    
    if (entry.isDirectory()) {
      tree.push(`${prefix}📁 ${entry.name}/`);
      const subTree = await printDirectoryTree(path.join(dir, entry.name), `${prefix}  `);
      tree.push(...subTree);
    } else {
      tree.push(`${prefix}📄 ${entry.name}`);
    }
  }

  return tree;
}

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
  const headers = {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const projectData = await request.json();
    const { id, name, pages, components, types, lib, utils } = projectData;

    console.log('\n📦 Deployment Started');
    console.log('====================');
    console.log('Project Details:');
    console.log(`Name: ${name}`);
    console.log(`ID: ${id}`);
    console.log('\nContent Summary:');
    console.log(`- Pages: ${pages?.length || 0}`);
    console.log(`- Components: ${components?.length || 0}`);
    console.log(`- Types: ${types?.length || 0}`);
    console.log(`- Lib files: ${lib?.length || 0}`);
    console.log(`- Utils: ${utils?.length || 0}`);

    // Create necessary directories
    const componentsDir = path.join(process.cwd(), 'src/components');
    const typesDir = path.join(process.cwd(), 'src/types');
    const libDir = path.join(process.cwd(), 'src/lib');
    const utilsDir = path.join(process.cwd(), 'src/utils');

    await Promise.all([
      fs.mkdir(componentsDir, { recursive: true }),
      fs.mkdir(typesDir, { recursive: true }),
      fs.mkdir(libDir, { recursive: true }),
      fs.mkdir(utilsDir, { recursive: true })
    ]);

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

    // Write types
    if (types && Array.isArray(types)) {
      console.log('Writing types...');
      for (const type of types) {
        if (type.name && type.content) {
          const typePath = path.join(typesDir, `${type.name}.ts`);
          await fs.writeFile(typePath, type.content);
          console.log(`✓ Wrote type: ${type.name}.ts`);
        }
      }
    }

    // Write lib files
    if (lib && Array.isArray(lib)) {
      console.log('Writing lib files...');
      for (const libFile of lib) {
        if (libFile.name && libFile.content) {
          const libPath = path.join(libDir, `${libFile.name}.ts`);
          await fs.writeFile(libPath, libFile.content);
          console.log(`✓ Wrote lib file: ${libFile.name}.ts`);
        }
      }
    }

    // Write utils files
    if (utils && Array.isArray(utils)) {
      console.log('Writing utils files...');
      for (const utilFile of utils) {
        if (utilFile.name && utilFile.content) {
          const utilPath = path.join(utilsDir, `${utilFile.name}.ts`);
          await fs.writeFile(utilPath, utilFile.content);
          console.log(`✓ Wrote util file: ${utilFile.name}.ts`);
        }
      }
    }

    // After all files are written, print the final project structure
    console.log('\n📂 Final Project Structure:');
    console.log('==========================');
    const projectTree = await printDirectoryTree(path.join(process.cwd(), 'src'));
    console.log(projectTree.join('\n'));
    
    console.log('\n✅ Deployment Complete\n');

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error('\n❌ Preview deploy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deploy to preview' },
      { status: 500, headers }
    );
  }
} 