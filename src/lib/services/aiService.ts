import { ClaudeMessage, StreamedResponse, StreamedArtifact } from '@/types/claude';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateText(prompt: string, type: 'page' | 'component') {
  try {
    const systemPrompt = {
      role: 'system',
      content: `You are an expert Next.js developer. Follow this project structure:

src/
├── app/                    # App Router directory
│   ├── (auth)/            # Grouped auth routes
│   │   ├── data.ts        # Page-specific data
│   │   └── types.ts       # Page-specific types
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   └── shared/           # Complex shared components
├── lib/                   # Utility functions & libraries
├── types/                # Global TypeScript type definitions
└── styles/               # Component styles

When writing code:
- Keep page-specific types and data files within their respective page directories:
  * For example: src/app/dashboard/types.ts
  * For example: src/app/dashboard/data.ts
- Only use the root types/ directory for shared/global types
- Create separate code artifacts for each file
- Include complete implementations with all imports
- Calculate relative paths correctly based on file location:
  * For pages (src/app/pagename/page.tsx):
    '../../../components/ui/button'
    '../../../lib/utils'
  * For components (src/components/ui/Component.tsx):
    '../../lib/utils'
    '../shared/OtherComponent'
  * For lib functions (src/lib/utils.ts):
    '../components/ui/button'
- Never use @ aliases for imports
- Use TypeScript with proper types
- Follow Next.js 14 best practices with App Router
- Use "use client" directive for client components
- Use Tailwind CSS exclusively for all styling
- Keep explanations brief and focused
- Place components in appropriate subdirectories
- Ensure proper error handling and loading states
- Follow these additional preview server rules:
  * All client-side components must have "use client" directive
  * Avoid using external CSS files - use Tailwind only
  * Keep component state management simple and local
  * Handle loading and error states explicitly
  * Use proper TypeScript types for all props
  * Ensure responsive design works on all screen sizes
  * Add proper aria-labels and accessibility attributes
  * Keep bundle size minimal by avoiding large dependencies
  * Use Next.js Image component for optimized images
  * Implement proper SEO meta tags where needed

Example responses by file type:

1. For a page component:
[Artifact: src/app/dashboard/page.tsx]
\`\`\`typescript
"use client";

import { Button } from '../../../components/ui/button';
import { DashboardHeader } from '../../../components/shared/dashboard-header';
// ... rest of code
\`\`\`

2. For a UI component:
[Artifact: src/components/ui/Button.tsx]
\`\`\`typescript
"use client";

import { useState } from 'react';
import { cn } from '../../lib/utils';
// ... rest of code
\`\`\`

3. For a utility function:
[Artifact: src/lib/utils.ts]
\`\`\`typescript
import { type ClassValue } from '../types';
// ... rest of code
\`\`\``
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
                  let cleanedContent = artifact.content
                    // Remove typescript/tsx/ts file path patterns
                    .replace(/^(typescript|tsx|ts):.*?(\r?\n|\r|$)/, '')
                    // Remove just file path patterns
                    .replace(/^.*?(src\/.*?\.[t|j]sx?)(\r?\n|\r|$)/, '')
                    // Remove any remaining language identifier lines
                    .replace(/^(typescript|tsx|ts)(\r?\n|\r|$)/, '')
                    // Clean up any extra newlines at the start
                    .replace(/^[\r\n]+/, '')
                    .trim();

                  // Check first 30 words for language identifiers
                  const firstPart = cleanedContent.split(/\s+/).slice(0, 30).join(' ');
                  if (firstPart.match(/^(typescript|tsx|ts)(\s|$)/i)) {
                    cleanedContent = cleanedContent
                      .replace(/^(typescript|tsx|ts)(\s|$)/i, '')
                      .trim();
                  }

                  yield {
                    type: 'code',
                    language: artifact.metadata.language || 'typescript',
                    filepath: artifact.metadata.fileName || '',
                    content: cleanedContent
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