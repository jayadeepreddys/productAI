"use client";

import { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export function CodeEditor({ value, onChange, language = 'typescript' }: CodeEditorProps) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Configure editor settings
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
      }
    });

    monaco.editor.setTheme('customTheme');
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      value={value}
      onChange={(value) => onChange(value || '')}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 2,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
      }}
    />
  );
} 