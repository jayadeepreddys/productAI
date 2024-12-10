import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: messages.map(msg => ({
          role: msg.role === 'system' ? 'assistant' : msg.role,
          content: msg.content
        }))
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error details:', data);
      throw new Error(`Anthropic API error: ${data.error?.message || response.statusText}`);
    }

    if (!data.content || !data.content[0]) {
      throw new Error('Invalid response from Anthropic API');
    }

    return NextResponse.json({ 
      text: data.content[0].text 
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 