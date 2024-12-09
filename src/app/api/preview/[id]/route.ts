import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/store/projects';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Preview requested for project:', params.id);
    const project = projectStore.getProjectById(params.id);
    
    if (!project) {
      console.log('Project not found in store');
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('Project found:', project.name);
    const pages = projectStore.getProjectPages(params.id);
    const components = projectStore.getProjectComponents(params.id);

    // Generate the HTML preview
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${project.name} - Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          ${project.techStack.ui === 'Material UI' ? '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />' : ''}
        </head>
        <body>
          <div id="root">
            ${generatePreviewContent(pages, components)}
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

function generatePreviewContent(pages: any[], components: any[]): string {
  // Start with the home page or first available page
  const homePage = pages.find(p => p.path === '/' || p.path === '/home') || pages[0];
  
  if (!homePage) {
    return `
      <div class="flex min-h-screen items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">No pages available</h1>
          <p class="mt-2 text-gray-600">Create a page to see the preview</p>
        </div>
      </div>
    `;
  }

  // Replace component placeholders with actual component markup
  let content = homePage.content;
  components.forEach(component => {
    const componentPlaceholder = `<${component.name} />`;
    if (content.includes(componentPlaceholder)) {
      content = content.replace(
        componentPlaceholder,
        generateComponentMarkup(component)
      );
    }
  });

  return `
    <div class="min-h-screen">
      ${content}
    </div>
  `;
}

function generateComponentMarkup(component: any): string {
  // Convert component code to static HTML
  // This is a simplified version - you might want to add more sophisticated parsing
  try {
    // Remove React-specific code and convert to static HTML
    let markup = component.code
      .replace(/"use client";?\n?/, '')
      .replace(/import.*?\n/g, '')
      .replace(/export default.*?\{/, '')
      .replace(/}\s*$/, '')
      .replace(/className/g, 'class')
      .trim();

    // Add any component-specific styling
    if (component.style) {
      markup = `<div style="${Object.entries(component.style)
        .map(([key, value]) => `${key}:${value}`)
        .join(';')}">${markup}</div>`;
    }

    return markup;
  } catch (error) {
    console.error(`Error generating markup for component ${component.name}:`, error);
    return `<div class="p-4 border border-red-300 rounded bg-red-50 text-red-700">
      Error rendering component: ${component.name}
    </div>`;
  }
} 