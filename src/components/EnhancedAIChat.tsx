"use client";

import { useState, useEffect, useRef } from 'react';
import { generateText } from '@/lib/services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
  codeBlock?: string;
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
  const isInitialMount = useRef(true);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_history_${pageId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        localStorage.removeItem(`chat_history_${pageId}`);
      }
    }
  }, [pageId]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${pageId}`, JSON.stringify(messages));
    }
  }, [messages, pageId]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    try {
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      const contextPrompt = contextType === 'component' 
        ? `You are helping create/modify a React component. 

Please ensure the component follows this structure:

/**
 * @preview {
 *   // Add realistic preview data here
 *   // Example:
 *   "items": [
 *     { "id": 1, "title": "Item 1", "description": "Description 1" },
 *     { "id": 2, "title": "Item 2", "description": "Description 2" }
 *   ],
 *   "config": {
 *     "showHeader": true,
 *     "maxItems": 5
 *   }
 * }
 */

Current component code:
\`\`\`typescript
${currentContent || 'No content yet'}
\`\`\`

User request: ${userMessage.content}

Provide the complete component code with TypeScript types and JSDoc preview data.`
        : `Current page content:
\`\`\`typescript
${currentContent || 'No content yet'}
\`\`\`

User request: ${userMessage.content}

If suggesting code changes, provide them in a typescript code block.`;

      // Stream the response in chunks
      const response = await generateText(contextPrompt, 'page', true); // Add streaming parameter
      let fullResponse = '';
      
      // Show partial responses as they come in
      for await (const chunk of response) {
        fullResponse += chunk;
        
        // Update the latest assistant message with the accumulated response
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
              id: Date.now().toString(),
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date()
            });
          }
          return messages;
        });
      }

      // Process code blocks after full response
      const codeMatch = fullResponse.match(/```typescript\n([\s\S]*?)```/);
      const codeBlock = codeMatch ? codeMatch[1].trim() : undefined;

      // Update final message with code block info
      setMessages(prev => {
        const messages = [...prev];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant') {
          messages[messages.length - 1] = {
            ...lastMessage,
            hasCode: !!codeBlock,
            codeBlock
          };
        }
        return messages;
      });

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'An error occurred while processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = (codeBlock: string) => {
    if (onUpdateContent) {
      onUpdateContent(codeBlock);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-200">AI Assistant</h3>
        <button
          onClick={() => {
            localStorage.removeItem(`chat_history_${pageId}`);
            setMessages([]);
          }}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Clear History
        </button>
      </div>
      
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-gray-100'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              <div className="whitespace-pre-wrap break-words font-mono text-sm">{message.content}</div>
              {message.hasCode && message.codeBlock && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleApplyChanges(message.codeBlock!)}
                    className="w-full px-3 py-1.5 bg-green-600 text-gray-100 rounded hover:bg-green-700 transition-colors"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={() => setInputValue("Can you explain these changes?")}
                    className="w-full px-3 py-1.5 bg-blue-600/30 text-blue-200 rounded hover:bg-blue-600/40 transition-colors"
                  >
                    Ask for Explanation
                  </button>
                </div>
              )}
              <div className="text-xs mt-1 text-gray-400">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <div className="animate-pulse">Thinking</div>
                <div className="animate-bounce">...</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 rounded-md bg-gray-700 border border-gray-600 px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 