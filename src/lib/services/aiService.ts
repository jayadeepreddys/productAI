import { ClaudeMessage, StreamedResponse, StreamedArtifact } from '@/types/claude';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateText(prompt: string, type: 'page' | 'component') {
  try {
    const systemPrompt = {
      role: 'system',
      content: `You are an expert Next.js developer. When writing code:
- Create separate code artifacts for each file
- Include complete implementations with all imports
- Use TypeScript with proper types
- Follow Next.js 14 best practices
- Include JSDoc comments for components
- Keep explanations brief and focused

Example response format:
Here's the component implementation:
[Artifact: TodoList.tsx]

And here's the types file:
[Artifact: types.ts]

For styling:
[Artifact: styles.css]`
    };

    const messages: AIMessage[] = [
      systemPrompt,
      {
        role: 'user',
        content: `Context type: ${type}\n\n${prompt}`
      }
    ];

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    return {
      async *[Symbol.asyncIterator]() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') return;
            if (!data) continue;

            try {
              const parsed = JSON.parse(data) as StreamedResponse;
              
              if (parsed.type === 'artifact' && parsed.artifact) {
                const artifact = parsed.artifact;
                if (artifact.type === 'code') {
                  yield {
                    type: 'code',
                    language: artifact.metadata.language || 'typescript',
                    filepath: artifact.metadata.fileName || '',
                    content: artifact.content
                  };
                }
              } else if (parsed.type === 'text') {
                yield {
                  type: 'text',
                  language: '',
                  filepath: '',
                  content: parsed.content
                };
              }
            } catch (e) {
              console.warn('Parse error:', e);
            }
          }
        }
      }
    };
  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}

export interface CodeBlock {
  type: 'code';
  language: string;
  filepath: string;
  content: string;
}

export interface TextBlock {
  type: 'text';
  language: string;
  filepath: string;
  content: string;
}

export type StreamBlock = CodeBlock | TextBlock; 