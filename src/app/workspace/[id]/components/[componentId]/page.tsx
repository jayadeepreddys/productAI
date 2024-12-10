"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { projectStore, ComponentItem } from '@/lib/store/projects';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ComponentConfig {
  name: string;
  type: string;
  props: {
    name: string;
    type: 'string' | 'number' | 'boolean';
    default?: any;
  }[];
  style: {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
  };
  code: string;
}

const DEFAULT_CONFIG: ComponentConfig = {
  name: '',
  type: '',
  props: [],
  style: {
    backgroundColor: '#ffffff',
    padding: '1rem',
    borderRadius: '0.5rem'
  },
  code: ''
};

export default function ComponentEditor({ params: paramsPromise }: { params: Promise<{ id: string; componentId: string }> }) {
  const params = use(paramsPromise);
  const [config, setConfig] = useState<ComponentConfig>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'll help you create a new component. What would you like to name it?",
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

  useEffect(() => {
    if (params?.id && params?.componentId) {
      const components = projectStore.getProjectComponents(params.id);
      const component = components.find(c => c.id === params.componentId);
      if (component) {
        setConfig({
          name: component.name,
          type: component.type,
          props: component.props || [],
          style: component.style || DEFAULT_CONFIG.style,
          code: component.code || ''
        });
      }
    }
  }, [params?.id, params?.componentId]);

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

    // Include current component configuration in the prompt
    const prompt = `
Current component configuration:
- Name: ${config.name}
- Type: ${config.type}
- Props: ${config.props.map(p => `${p.name}: ${p.type}`).join(', ')}
- Code:
\`\`\`typescript
${config.code}
\`\`\`

User request: ${userMessage}

Please provide guidance for the component. If code changes are needed, wrap them in a code block using \`\`\`typescript.
`;

    addMessage('user', userMessage);
    setIsProcessing(true);

    try {
      const aiResponse = await generateText(prompt, 'component');
      addMessage('assistant', aiResponse);

      // Extract code blocks if present
      const codeMatch = aiResponse.match(/```typescript\n([\s\S]*?)```/);
      if (codeMatch) {
        const newCode = codeMatch[1].trim();
        setConfig(prev => ({
          ...prev,
          code: newCode
        }));
      }

      // Update component name if suggested in the response
      const nameMatch = aiResponse.match(/component name to "([^"]+)"/);
      if (nameMatch && !config.name) {
        setConfig(prev => ({
          ...prev,
          name: nameMatch[1]
        }));
      }

      // Update component type if suggested
      const typeMatch = aiResponse.toLowerCase().match(/type: (ui|layout|form|data)/);
      if (typeMatch && !config.type) {
        setConfig(prev => ({
          ...prev,
          type: typeMatch[1]
        }));
      }
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock AI response - Replace with actual API call
  const mockAIResponse = async (message: string, currentConfig: ComponentConfig) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (!currentConfig.name) {
      return {
        message: `Great! I'll set the component name to "${message}". What type of component is this? (UI, Layout, Form, or Data)`,
        updates: { name: message }
      };
    }

    if (!currentConfig.type) {
      const type = message.toLowerCase();
      if (['ui', 'layout', 'form', 'data'].includes(type)) {
        return {
          message: `Perfect! Now, let's define the props for your component. What properties should it have? For example: "title: string, isActive: boolean"`,
          updates: { type }
        };
      } else {
        return {
          message: "Please choose one of: UI, Layout, Form, or Data",
          updates: {}
        };
      }
    }

    if (currentConfig.props.length === 0) {
      // Parse props from message
      const propDefinitions = message.split(',').map(prop => {
        const [name, type] = prop.trim().split(':').map(s => s.trim());
        return {
          name,
          type: type.toLowerCase() as 'string' | 'number' | 'boolean'
        };
      });

      return {
        message: "Great! I'll generate some code for your component. Would you like to customize the styling?",
        updates: { 
          props: propDefinitions,
          code: generateComponentCode(currentConfig.name, propDefinitions)
        }
      };
    }

    // Handle style customization
    if (message.toLowerCase().includes('yes')) {
      return {
        message: "What styling would you like? You can specify background color, padding, and border radius.",
        updates: {}
      };
    }

    // Parse style properties
    const styleUpdates = {};
    if (message.includes('background')) {
      styleUpdates['backgroundColor'] = message.match(/#[0-9a-f]{6}/i)?.[0] || '#ffffff';
    }
    if (message.includes('padding')) {
      styleUpdates['padding'] = message.match(/\d+rem/)?.[0] || '1rem';
    }
    if (message.includes('radius')) {
      styleUpdates['borderRadius'] = message.match(/\d+rem/)?.[0] || '0.5rem';
    }

    return {
      message: "I've updated the styling. Would you like to create this component now?",
      updates: { 
        style: { ...currentConfig.style, ...styleUpdates }
      }
    };
  };

  const generateComponentCode = (name: string, props: ComponentConfig['props']) => {
    const propsString = props.map(p => `${p.name}: ${p.type}`).join(', ');
    return `
interface ${name}Props {
  ${propsString}
}

export function ${name}({ ${props.map(p => p.name).join(', ')} }: ${name}Props) {
  return (
    <div className="p-4 rounded-lg bg-white">
      {/* Add your component content here */}
    </div>
  );
}
    `.trim();
  };

  return (
    <div className="h-screen flex">
      {/* Chat Interface - Left Side */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-medium text-gray-900">
            {params.componentId === 'new' ? 'Create New Component' : 'Edit Component'}
          </h1>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Component Preview</h2>
          
          {config.name && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Name</h3>
              <p className="mt-1 text-gray-900">{config.name}</p>
            </div>
          )}

          {config.type && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Type</h3>
              <p className="mt-1 text-gray-900 capitalize">{config.type}</p>
            </div>
          )}

          {config.props.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Props</h3>
              <ul className="mt-1 space-y-1">
                {config.props.map((prop, index) => (
                  <li key={index} className="text-gray-900">
                    {prop.name}: <span className="text-primary">{prop.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {config.code && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Generated Code</h3>
              <pre className="mt-1 p-4 bg-gray-50 rounded-lg overflow-x-auto">
                <code className="text-sm">{config.code}</code>
              </pre>
            </div>
          )}

          {config.name && config.type && config.props.length > 0 && (
            <button
              onClick={() => {
                projectStore.addComponent(params.id, config);
                router.push(`/workspace/${params.id}/components`);
              }}
              className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Create Component
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 