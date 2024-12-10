import { NextResponse } from 'next/server';

let lastContent: string | null = null;
const clients = new Set<ReadableStreamDefaultController>();

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    lastContent = content;

    // Notify all connected clients about the update
    clients.forEach(client => {
      client.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'Failed to update preview' }, { status: 500 });
  }
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      // Send initial content if available
      if (lastContent) {
        controller.enqueue(`data: ${JSON.stringify({ content: lastContent })}\n\n`);
      }

      // Keep track of this client
      const cleanup = () => {
        clients.delete(controller);
      };

      // Clean up when the connection is closed
      controller.signal?.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 