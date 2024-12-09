"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { projectStore, PageItem } from '@/lib/store/projects';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PageConfig {
  name: string;
  layout: string;
  content: string;
  references: {
    components: string[];
    pages: string[];
    apis: string[];
  };
}

const DEFAULT_CONFIG: PageConfig = {
  name: '',
  layout: 'default',
  content: '',
  references: {
    components: [],
    pages: [],
    apis: []
  }
};

export default function PageEditor({ params: paramsPromise }: { params: Promise<{ id: string; pageId: string }> }) {
  const params = use(paramsPromise);
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'll help you create a new page. What would you like to name it?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    addMessage('user', userMessage);
    setIsProcessing(true);

    try {
      // TODO: Replace with actual Claude/ChatGPT API call
      const aiResponse = await mockAIResponse(userMessage, config);
      addMessage('assistant', aiResponse.message);
      setConfig(prev => ({ ...prev, ...aiResponse.updates }));
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock AI response - Replace with actual API call
  const mockAIResponse = async (message: string, currentConfig: PageConfig) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (!currentConfig.name) {
      return {
        message: `Great! I'll set the page name to "${message}". Now, what kind of layout would you like to use? (default, sidebar, or blank)`,
        updates: { name: message }
      };
    }

    if (!currentConfig.layout || currentConfig.layout === 'default') {
      if (message.toLowerCase().includes('sidebar')) {
        return {
          message: "I've set the layout to sidebar. Now, describe the content you'd like on this page. You can use @Component{}, @Page{}, or @API{} to reference other parts of your project.",
          updates: { layout: 'sidebar' }
        };
      }
    }

    // Parse references from the message
    const componentRefs = message.match(/@Component\{([^}]+)\}/g)?.map(ref => 
      ref.match(/@Component\{([^}]+)\}/)?.[1] || ''
    ) || [];
    const pageRefs = message.match(/@Page\{([^}]+)\}/g)?.map(ref => 
      ref.match(/@Page\{([^}]+)\}/)?.[1] || ''
    ) || [];
    const apiRefs = message.match(/@API\{([^}]+)\}/g)?.map(ref => 
      ref.match(/@API\{([^}]+)\}/)?.[1] || ''
    ) || [];

    return {
      message: `I've updated the content and found these references:\n${
        componentRefs.length ? `\nComponents: ${componentRefs.join(', ')}` : ''
      }${
        pageRefs.length ? `\nPages: ${pageRefs.join(', ')}` : ''
      }${
        apiRefs.length ? `\nAPIs: ${apiRefs.join(', ')}` : ''
      }\n\nWould you like to add more content or shall we create the page?`,
      updates: {
        content: message,
        references: {
          components: componentRefs,
          pages: pageRefs,
          apis: apiRefs
        }
      }
    };
  };

  return (
    <div className="h-screen flex">
      {/* Chat Interface - Left Side */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-medium text-gray-900">Create New Page</h1>
        </div>

        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !inputValue.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Preview - Right Side */}
      <div className="w-1/2 bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
          
          {config.name && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Name</h3>
              <p className="mt-1 text-gray-900">{config.name}</p>
            </div>
          )}

          {config.layout && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Layout</h3>
              <p className="mt-1 text-gray-900 capitalize">{config.layout}</p>
            </div>
          )}

          {config.content && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Content</h3>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{config.content}</p>
            </div>
          )}

          {Object.values(config.references).some(arr => arr.length > 0) && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">References</h3>
              {config.references.components.length > 0 && (
                <div className="mt-1">
                  <p className="text-sm font-medium">Components:</p>
                  <ul className="list-disc ml-4 text-gray-900">
                    {config.references.components.map((comp, i) => (
                      <li key={i}>{comp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {config.references.pages.length > 0 && (
                <div className="mt-1">
                  <p className="text-sm font-medium">Pages:</p>
                  <ul className="list-disc ml-4 text-gray-900">
                    {config.references.pages.map((page, i) => (
                      <li key={i}>{page}</li>
                    ))}
                  </ul>
                </div>
              )}
              {config.references.apis.length > 0 && (
                <div className="mt-1">
                  <p className="text-sm font-medium">APIs:</p>
                  <ul className="list-disc ml-4 text-gray-900">
                    {config.references.apis.map((api, i) => (
                      <li key={i}>{api}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {config.name && config.layout && config.content && (
            <button
              onClick={() => {
                projectStore.addPage(params.id, config);
                router.push(`/workspace/${params.id}/pages`);
              }}
              className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Create Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 