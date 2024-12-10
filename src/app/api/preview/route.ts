import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    content: global.__PREVIEW_CONTENT__ || '' 
  });
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    global.__PREVIEW_CONTENT__ = content;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update preview',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 