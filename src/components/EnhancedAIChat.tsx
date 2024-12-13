"use client";

import { useState, useEffect, useRef } from 'react';
import { generateText } from '@/lib/services/aiService';
import { projectStore } from '@/lib/store/projects';
import { useParams } from 'next/navigation';

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

interface FileOperation {
  content: string;
  filepath: string;
  type: 'component' | 'page' | 'style' | 'config';
  projectId?: string;
  action?: 'create' | 'update';
}

interface EnhancedAIChatProps {
  currentContent: string;
  onUpdateContent: (content: string) => void;
  onCreateFile?: (operation: FileOperation) => Promise<void>;
  pageId: string;
  contextType?: 'component' | 'page';
  isFileExists?: (filepath: string) => boolean;
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
  onCreateFile,
  pageId,
  contextType = 'page',
  isFileExists
}: EnhancedAIChatProps) {
  const params = useParams();
  
  // Use the 'id' parameter instead of 'workspaceId'
  const projectId = params.id as string;
  
  console.log('URL Params:', params);
  console.log('Current Project ID:', projectId);

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

  const handleApplyChanges = async (filepath: string, code: string, type: string) => {
    try {
      console.log('=== Starting Save Operation ===');
      console.log('Project ID:', projectId);
      console.log('Original Type:', type);
      console.log('File Path:', filepath);

      // Determine the correct type based on filepath
      let fileType = type;
      if (filepath.includes('page.tsx')) {
        fileType = 'page';
      } else if (filepath.endsWith('.tsx')) {
        fileType = 'component';
      }

      console.log('Resolved File Type:', fileType);

      if (!projectId) {
        console.error('No project ID found in URL');
        return;
      }

      const project = projectStore.getProjectById(projectId);
      
      if (!project) {
        console.error(`Project with ID ${projectId} not found`);
        return;
      }

      console.log('Found Project:', project.name);

      if (fileType === 'component') {
        const componentName = filepath.split('/').pop()?.replace('.tsx', '') || '';
        
        // Check if component already exists
        const existingComponents = projectStore.getProjectComponents(projectId);
        const existingComponent = existingComponents.find(c => c.name === componentName);
        
        if (existingComponent) {
          // Update existing component
          projectStore.updateComponent(projectId, existingComponent.id, {
            code: code,
          });
          console.log(`Updated existing component: ${componentName}`);
        } else {
          // Create new component
          const newComponent = projectStore.addComponent(projectId, {
            name: componentName,
            type: 'ui',
            code: code,
            preview: '',
          });
          console.log('Created new component:', newComponent);
        }
      } 
      else if (fileType === 'page') {
        // Extract function name from the code for the page name
        const functionMatch = code.match(/export\s+default\s+function\s+(\w+)/);
        let pageName = functionMatch ? functionMatch[1].replace('Page', '') : '';
        
        // If no function name found, use filepath
        if (!pageName) {
          pageName = filepath.split('/').pop()?.replace('page.tsx', '') || 'index';
        }
        
        // Clean up the name
        pageName = pageName
          .replace(/([A-Z])/g, ' $1') // Add spaces before capitals
          .trim() // Remove extra spaces
          .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
        
        // Generate path from name
        const pagePath = pageName.toLowerCase() === 'home' 
          ? '/' 
          : `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;

        console.log('Page Details:', {
          name: pageName,
          path: pagePath,
          projectId: projectId
        });

        // Check if page already exists
        const existingPages = projectStore.getProjectPages(projectId);
        const existingPage = existingPages.find(p => p.path === pagePath);

        if (existingPage) {
          // Update existing page
          projectStore.updatePage(projectId, existingPage.id, {
            content: code,
          });
          console.log(`Updated existing page: ${pageName} at ${pagePath}`);
        } else {
          // Create new page
          const newPage = projectStore.addPage(projectId, {
            name: pageName,
            path: pagePath,
            description: `Auto-generated page: ${pageName}`,
            components: [],
            apis: [],
            content: code,
          });
          console.log('Created new page:', newPage);
        }
      } else {
        console.warn('Unhandled file type:', fileType);
      }

      console.log('=== Save Operation Complete ===');

    } catch (error) {
      console.error('=== Save Operation Failed ===');
      console.error('Error details:', error);
      console.error('Failed operation type:', type);
      console.error('Failed filepath:', filepath);
      throw new Error(`Failed to save ${type}: ${error}`);
    }
  };

  const handleBatchChanges = async () => {
    try {
      const files = message.content.split('[Artifact:').slice(1).map(part => {
        const filepath = part.slice(0, part.indexOf(']'));
        const codeContent = part.slice(part.indexOf('```') + 3);
        const code = codeContent.slice(0, codeContent.indexOf('```')).trim();
        const { type } = getFileTypeStyles(filepath);
        return { filepath, code, type };
      });

      for (const file of files) {
        await handleApplyChanges(file.filepath, file.code, file.type);
      }
    } catch (error) {
      console.error('Failed to process files:', error);
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

  // Add this helper function at component level
  const getFileTypeStyles = (filepath: string) => {
    if (filepath.includes('/components/')) {
      return { type: 'component', color: 'bg-blue-600', icon: '⚛️' };
    }
    if (filepath.includes('/app/') || filepath.includes('/pages/')) {
      return { type: 'page', color: 'bg-green-600', icon: '📄' };
    }
    if (filepath.includes('.css') || filepath.includes('.module.css')) {
      return { type: 'style', color: 'bg-purple-600', icon: '🎨' };
    }
    if (filepath.includes('types.ts') || filepath.includes('.d.ts')) {
      return { type: 'types', color: 'bg-yellow-600', icon: 'TS' };
    }
    return { type: 'other', color: 'bg-gray-600', icon: '📁' };
  };

  const getActionButtonText = (filepath: string, type: string): string => {
    const exists = isFileExists?.(filepath) ?? false;
    if (exists) {
      return 'Update File';
    }
    
    switch (type) {
      case 'component':
        return 'Create Component';
      case 'page':
        return 'Create Page';
      case 'style':
        return 'Add Styles';
      default:
        return 'Create File';
    }
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
                {/* Regular text content */}
                <div className="prose prose-invert max-w-none">
                  {message.content.split('[Artifact:').map((part, index) => {
                    if (index === 0) return part;
                    const endIndex = part.indexOf(']');
                    return part.slice(endIndex + 1);
                  })}
                </div>

                {/* Artifacts Section */}
                {message.role === 'assistant' && (
                  <div className="mt-6 space-y-6">
                    {/* File Overview */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-3">Generated Files:</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {message.content.split('[Artifact:').slice(1).map((part, index) => {
                          const filepath = part.slice(0, part.indexOf(']'));
                          const { type, color, icon } = getFileTypeStyles(filepath);
                          return (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <span className={`w-6 h-6 ${color} rounded flex items-center justify-center text-xs`}>
                                {icon}
                              </span>
                              <span className="truncate">{filepath}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Code Blocks */}
                    <div className="space-y-4">
                      {message.content.split('[Artifact:').slice(1).map((part, index) => {
                        const filepath = part.slice(0, part.indexOf(']'));
                        const codeContent = part.slice(part.indexOf('```') + 3);
                        const endCode = codeContent.indexOf('```');
                        const code = codeContent.slice(0, endCode).trim();
                        const { type, color, icon } = getFileTypeStyles(filepath);

                        return (
                          <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-gray-700 px-4 py-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className={`w-6 h-6 ${color} rounded flex items-center justify-center text-xs`}>
                                    {icon}
                                  </span>
                                  <span className="text-sm font-mono">{filepath}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApplyChanges(filepath, code, type)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                                  >
                                    {getActionButtonText(filepath, type)}
                                  </button>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            </div>
                            <pre className="p-4 bg-gray-900 overflow-x-auto">
                              <code className="text-sm text-gray-300">{code}</code>
                            </pre>
                          </div>
                        );
                      })}
                    </div>

                    {/* Batch Actions */}
                    <div className="border-t border-gray-700 pt-4 flex space-x-3">
                      <button
                        onClick={handleBatchChanges}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md"
                      >
                        {message.content.split('[Artifact:').slice(1).some(part => {
                          const filepath = part.slice(0, part.indexOf(']'));
                          return isFileExists?.(filepath) ?? false;
                        }) ? 'Update/Create Files' : 'Create All Files'}
                      </button>
                      <button
                        onClick={() => {
                          const allCode = message.content.split('[Artifact:').slice(1)
                            .map(part => {
                              const codeContent = part.slice(part.indexOf('```') + 3);
                              return codeContent.slice(0, codeContent.indexOf('```')).trim();
                            })
                            .join('\n\n');
                          navigator.clipboard.writeText(allCode);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md"
                      >
                        Copy All Code
                      </button>
                    </div>
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