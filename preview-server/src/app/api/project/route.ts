import { NextResponse } from 'next/server';
import { projectStore } from '@/lib/store/projectStore';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Handle pages
    if (data.pages) {
      data.pages.forEach((page: any) => {
        projectStore.addPage({
          id: page.id,
          path: page.path,
          content: page.content
        });
      });
    }

    // Handle components
    if (data.components) {
      data.components.forEach((component: any) => {
        projectStore.addComponent({
          id: component.id,
          name: component.name,
          content: component.content
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const structure = projectStore.getProjectStructure();
    return NextResponse.json(structure);
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
} 