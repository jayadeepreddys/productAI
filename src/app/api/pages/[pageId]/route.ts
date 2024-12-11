import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function PUT(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const { content } = await request.json();
    const { pageId } = params;

    // Validate input
    if (!content) {
      return NextResponse.json(
        { error: 'Missing required content' },
        { status: 400 }
      );
    }

    // Create pages directory if it doesn't exist
    const pagesDir = path.join(process.cwd(), 'src', 'app');
    await fs.mkdir(pagesDir, { recursive: true });

    // Determine the page path
    const pagePath = path.join(pagesDir, pageId, 'page.tsx');
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(pagePath), { recursive: true });

    // Write the page content
    await fs.writeFile(pagePath, content);

    return NextResponse.json({
      success: true,
      message: `Page ${pageId} updated successfully`,
      path: pagePath
    });

  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 