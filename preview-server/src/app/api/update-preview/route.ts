import { NextResponse } from 'next/server';

// Store content only
let currentContent: string = '';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    currentContent = content;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update preview' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ content: currentContent });
} 