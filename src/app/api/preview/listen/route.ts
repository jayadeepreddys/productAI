import { NextResponse } from 'next/server';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Send the initial content
      if (global.__PREVIEW_CONTENT__) {
        controller.enqueue(`data: ${JSON.stringify(global.__PREVIEW_CONTENT__)}\n\n`);
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
} 