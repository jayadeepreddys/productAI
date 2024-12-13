import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeMessage, StreamedResponse } from '@/types/claude';

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      temperature: 0.1,
      system: messages[0].content,
      messages: messages.slice(1),
      stream: true
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let currentArtifact: StreamedArtifact | null = null;

          for await (const chunk of response) {
            switch (chunk.type) {
              case 'content_block_start':
                if (chunk.content_block.type === 'artifact') {
                  currentArtifact = {
                    type: chunk.content_block.metadata?.artifact_type as 'code' | 'text' | 'image',
                    id: chunk.content_block.id,
                    content: '',
                    metadata: {
                      fileName: chunk.content_block.metadata?.file_name,
                      language: chunk.content_block.metadata?.language,
                    }
                  };
                }
                break;

              case 'content_block_delta':
                if (currentArtifact) {
                  currentArtifact.content += chunk.delta.text;
                } else {
                  const message: StreamedResponse = {
                    type: 'text',
                    content: chunk.delta.text
                  };
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`)
                  );
                }
                break;

              case 'content_block_stop':
                if (currentArtifact) {
                  const message: StreamedResponse = {
                    type: 'artifact',
                    content: '',
                    artifact: currentArtifact
                  };
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`)
                  );
                  currentArtifact = null;
                }
                break;

              case 'message_stop':
                controller.enqueue(
                  new TextEncoder().encode('data: [DONE]\n\n')
                );
                controller.close();
                break;
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
      cancel() {
        response.abort();
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json({ 
      error: 'AI service error',
      message: error.message,
      details: error.response?.data || error.toString()
    }, { 
      status: error.status || 500 
    });
  }
}

export const dynamic = 'force-dynamic';