"use client";

import { useState, useRef, useEffect } from 'react';
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
}

export default function EnhancedAIChat({ currentContent, onUpdateContent, pageId }: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_history_${pageId}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(parsedMessages);
    }
  }, [pageId]);

  useEffect(() => {
    localStorage.setItem(`chat_history_${pageId}`, JSON.stringify(messages));
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

      const contextPrompt = `Current page content:
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
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">AI Assistant</h3>
        <button
          onClick={() => {
            localStorage.removeItem(`chat_history_${pageId}`);
            setMessages([]);
          }}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Clear History
        </button>
      </div>
      
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white shadow-sm border border-gray-200 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap break-words font-mono text-sm">{message.content}</div>
              {message.hasCode && message.codeBlock && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleApplyChanges(message.codeBlock!)}
                    className="w-full px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={() => setInputValue("Can you explain these changes?")}
                    className="w-full px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Ask for Explanation
                  </button>
                </div>
              )}
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">Thinking</div>
                <div className="animate-bounce">...</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 