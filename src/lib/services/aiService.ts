import { parseCodeBlocks, cleanCodeContent, formatCode } from './codeBlockParser';

export async function generateText(prompt: string, type: 'page' | 'component', stream = false) {
  try {
    const systemPrompt = `You are an expert Next.js developer. IMPORTANT: Format your response exactly as shown below:

First file:

\`\`\`typescript:src/app/page.tsx
// Code for page.tsx here
\`\`\`

Second file:

\`\`\`typescript:src/components/TodoList.tsx
// Code for TodoList.tsx here
\`\`\`

Requirements:
1. Each file MUST start with \`\`\`typescript:filepath
2. Each file MUST end with \`\`\`
3. Add a brief explanation between files
4. Use complete, properly formatted TypeScript code
5. Include proper imports and exports
6. Follow Next.js 14 conventions

Your task: ${prompt}`;

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a Next.js expert. Always format code in clear, separate blocks.'
          },
          {
            role: 'user',
            content: systemPrompt
          }
        ],
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    return {
      async *[Symbol.asyncIterator]() {
        try {
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Process complete messages
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const text = line.slice(6).trim();
                if (!text || text === '[DONE]') continue;

                // Parse the text for code blocks
                const blocks = parseCodeBlocks(text);
                
                for (const block of blocks) {
                  if (block.type === 'code') {
                    yield {
                      type: 'codeBlock',
                      data: {
                        filepath: block.filepath!,
                        content: formatCode(cleanCodeContent(block.content))
                      }
                    };
                  } else {
                    yield {
                      type: 'text',
                      data: block.content
                    };
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
  } catch (error) {
    console.error('Error in generateText:', error);
    throw error;
  }
}

export interface CodeBlock {
  filepath: string;
  content: string;
}

export interface StreamChunk {
  type: 'text' | 'codeBlock';
  data: string | CodeBlock;
} 