import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const client = new Anthropic({
      apiKey: ANTHROPIC_API_KEY
    });

    const response = new TransformStream();
    const writer = response.writable.getWriter();
    const encoder = new TextEncoder();

    // Start the streaming request
    const messageStream = await client.messages.stream({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
    });

    // Handle the stream
    (async () => {
      try {
        for await (const chunk of messageStream) {
          if (chunk.type === 'content_block_delta') {
            const text = chunk.delta?.text || '';
            await writer.write(encoder.encode(`data: ${text}\n\n`));
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        // Send error message through the stream
        await writer.write(encoder.encode(`data: Error: ${error}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(response.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 