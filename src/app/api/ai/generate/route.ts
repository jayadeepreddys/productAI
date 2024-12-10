import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { prompt, type } = await req.json();
    console.log('Received request:', { prompt, type });

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({ completion: message.content[0].text });
  } catch (error) {
    console.error('Error in AI generate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error generating response' },
      { status: 500 }
    );
  }
} 