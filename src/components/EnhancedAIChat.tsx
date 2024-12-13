"use client";

import { useState, useEffect, useRef } from 'react';
import { generateText } from '@/lib/services/aiService';

interface CodeBlock {
  type: 'component' | 'page' | 'style' | 'config';
  filepath: string;
  content: string;
  action: 'create' | 'update';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
  isCodeBlocksExtracted?: boolean;
}

interface EnhancedAIChatProps {
  currentContent: string;
  onUpdateContent: (content: string) => void;
  pageId: string;
  contextType?: 'component' | 'page';
}

interface StreamBlock {
  type: 'code' | 'text';
  language: string;
  filepath: string;
  content: string;
}

export default function EnhancedAIChat({ 
  currentContent, 
  onUpdateContent, 
  pageId,
  contextType = 'page'
}: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(`chat_history_${pageId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        const { scrollHeight, clientHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth'
        });
      }
    };

    // Scroll on new messages
    scrollToBottom();
    
    // Also scroll after a short delay to handle content loading
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${pageId}`, JSON.stringify(messages));
    }
  }, [messages, pageId]);

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
      const response = await generateText(inputValue, contextType);
      
      let currentAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        codeBlocks: []
      };

      for await (const block of response) {
        if (block.type === 'code') {
          // Handle code artifacts
          const codeBlock: CodeBlock = {
            filepath: block.filepath,
            content: block.content,
            type: getFileType(block.filepath),
            action: 'create'
          };
          
          currentAssistantMessage.codeBlocks = [
            ...(currentAssistantMessage.codeBlocks || []),
            codeBlock
          ];
        } else {
          // Handle text content
          currentAssistantMessage.content += block.content;
        }

        // Update message in real-time
        setMessages(prev => {
          const messages = [...prev];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.role === 'assistant') {
            messages[messages.length - 1] = currentAssistantMessage;
          } else {
            messages.push(currentAssistantMessage);
          }
          return messages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileType = (filepath: string): CodeBlock['type'] => {
    if (filepath.includes('/components/')) return 'component';
    if (filepath.includes('/app/')) return 'page';
    if (filepath.includes('.css') || filepath.includes('.scss')) return 'style';
    return 'config';
  };

  const handleApplyChanges = async (block: CodeBlock) => {
    try {
      await onUpdateContent(block.content);
      // Show success toast or feedback
    } catch (error) {
      console.error('Failed to apply changes:', error);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(`chat_history_${pageId}`);
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const prevUserMessage = messages.slice(0, messageIndex).reverse()
      .find(m => m.role === 'user');
    
    if (!prevUserMessage) return;

    setIsLoading(true);
    
    try {
      const response = await generateText(prevUserMessage.content, contextType);
      
      let currentAssistantMessage: Message = {
        ...messages[messageIndex],
        content: '',
        codeBlocks: []
      };

      for await (const block of response) {
        if (block.type === 'code') {
          const codeBlock: CodeBlock = {
            filepath: block.filepath,
            content: block.content,
            type: getFileType(block.filepath),
            action: 'create'
          };
          
          currentAssistantMessage.codeBlocks = [
            ...(currentAssistantMessage.codeBlocks || []),
            codeBlock
          ];
        } else {
          currentAssistantMessage.content += block.content;
        }

        // Update message in real-time
        setMessages(prev => {
          const messages = [...prev];
          messages[messageIndex] = currentAssistantMessage;
          return messages;
        });
      }
    } catch (error) {
      console.error('Regeneration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to clean code content
  const cleanCodeContent = (content: string): string => {
    return content
      .replace(/([a-zA-Z]+)=/g, '$1=') // Fix attribute spacing
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([^>])\n/g, '$1 ') // Remove newlines not after closing tags
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900 overflow-hidden">
      <div className="flex justify-end p-2 border-b border-gray-800">
        <button
          onClick={clearHistory}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Clear History
        </button>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-white'
              }`}>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                  {message.content.split('[Artifact:').map((part, index) => {
                    if (index === 0) return part;
                    // Skip artifact references in the text as we'll show them separately
                    const endIndex = part.indexOf(']');
                    return part.slice(endIndex + 1);
                  })}
                </div>
                
                {/* Code Artifacts */}
                {message.role === 'assistant' && message.codeBlocks && message.codeBlocks.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {message.codeBlocks.map((block, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-700 px-4 py-2 flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono">{block.filepath}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              block.type === 'component' ? 'bg-blue-600' :
                              block.type === 'page' ? 'bg-green-600' :
                              block.type === 'style' ? 'bg-purple-600' : 'bg-gray-600'
                            }`}>
                              {block.type}
                            </span>
                          </div>
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

                {/* Assistant message controls */}
                {message.role === 'assistant' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => regenerateResponse(message.id)}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Regenerating...' : 'Regenerate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-4 bg-gray-900">
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