"use client";

import { useState, useEffect, useRef } from 'react';
import { generateText } from '@/lib/services/aiService';

interface CodeBlock {
  filepath: string;
  content: string;
  type: 'component' | 'page' | 'style' | 'config';
  action: 'create' | 'update';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

interface EnhancedAIChatProps {
  currentContent: string;
  onUpdateContent: (content: string) => void;
  pageId: string;
  contextType?: 'component' | 'page';
}

export default function EnhancedAIChat({ 
  currentContent, 
  onUpdateContent, 
  pageId,
  contextType = 'page'
}: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getSystemPrompt = () => {
    return `You are an expert Next.js developer. When providing code, please follow these guidelines:

1. Always use TypeScript
2. Always wrap code blocks with triple backticks and include the filepath, like:
\`\`\`typescript:src/components/Example.tsx
// code here
\`\`\`

3. For components:
   - Include proper TypeScript interfaces
   - Use modern React patterns (hooks, functional components)
   - Include JSDoc comments with @preview data
   - Follow Next.js 14 conventions

4. For pages:
   - Use the App Router format
   - Include proper metadata exports
   - Follow Next.js 14 file conventions

Current ${contextType} content:
\`\`\`typescript
${currentContent || '// No content yet'}
\`\`\``;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const systemPrompt = getSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser request: ${userMessage.content}\n\nProvide your response with code blocks using the specified format.`;
      
      const response = await generateText(fullPrompt, contextType, true);
      let fullResponse = '';
      let currentAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        codeBlocks: []
      };

      for await (const chunk of response) {
        fullResponse += chunk.data;
        
        // Update message content
        setMessages(prev => {
          const messages = [...prev];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: fullResponse
            };
          } else {
            messages.push({
              ...currentAssistantMessage,
              content: fullResponse
            });
          }
          return messages;
        });
      }

      // Process code blocks after full response
      const codeBlocks = parseCodeBlocks(fullResponse);
      
      // Update final message with code blocks
      setMessages(prev => {
        const messages = [...prev];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant') {
          messages[messages.length - 1] = {
            ...lastMessage,
            codeBlocks
          };
        }
        return messages;
      });

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'An error occurred',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseCodeBlocks = (text: string): CodeBlock[] => {
    const blocks: CodeBlock[] = [];
    const regex = /```(?:typescript|tsx|ts):([^\n]+)\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [_, filepath, content] = match;
      if (filepath && content) {
        blocks.push({
          filepath: filepath.trim(),
          content: content.trim(),
          type: getFileType(filepath),
          action: 'create' // You might want to determine this based on file existence
        });
      }
    }

    return blocks;
  };

  const getFileType = (filepath: string): CodeBlock['type'] => {
    if (filepath.includes('/components/')) return 'component';
    if (filepath.includes('/app/')) return 'page';
    if (filepath.includes('.css') || filepath.includes('.scss')) return 'style';
    return 'config';
  };

  const handleApplyChanges = (codeBlock: CodeBlock) => {
    if (onUpdateContent) {
      onUpdateContent(codeBlock.content);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-white'
            }`}>
              <div className="prose prose-invert max-w-none">
                {message.content}
              </div>
              {message.codeBlocks && message.codeBlocks.length > 0 && (
                <div className="mt-4 space-y-4">
                  {message.codeBlocks.map((block, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-700 px-4 py-2 flex justify-between items-center">
                        <span className="text-sm font-mono">{block.filepath}</span>
                        <button
                          onClick={() => handleApplyChanges(block)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Apply Changes
                        </button>
                      </div>
                      <pre className="p-4 bg-gray-900 overflow-x-auto">
                        <code className="text-sm text-gray-300">
                          {block.content}
                        </code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-gray-800 text-white rounded px-4 py-2"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 