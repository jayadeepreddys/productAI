import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { name, code, dependencies, projectId } = await request.json();

    // Validate input
    if (!name || !code || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create components directory if it doesn't exist
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    await fs.mkdir(componentsDir, { recursive: true });

    // Create the component file
    const componentPath = path.join(componentsDir, `${name}.tsx`);
    await fs.writeFile(componentPath, code);

    // You might want to update your project's state/database here
    // For example, adding the component to a components registry

    return NextResponse.json({
      success: true,
      message: `Component ${name} created successfully`,
      path: componentPath
    });

  } catch (error) {
    console.error('Error creating component:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 