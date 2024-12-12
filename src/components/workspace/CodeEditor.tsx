"use client";

import { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export function CodeEditor({ value, onChange, language = "typescript" }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Disable all validations at Monaco instance level
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestions: true
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestions: true
    });
    
    // Configure editor settings with a simplified dark theme
    monaco.editor.defineTheme('simpleDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: '60A5FA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' }
      ],
      colors: {
        'editor.background': '#111827',
        'editor.foreground': '#D1D5DB',
        'editor.lineHighlightBackground': '#1F2937',
        'editorLineNumber.foreground': '#4B5563',
        'editorLineNumber.activeForeground': '#60A5FA',
        'editor.selectionBackground': '#2563EB40',
        'editor.inactiveSelectionBackground': '#374151',
        'editorCursor.foreground': '#60A5FA',
      }
    });
    
    monaco.editor.setTheme('simpleDark');
  };
  

  return (
    <div className="h-[500px] border border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 15,
          lineHeight: 24,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'off',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          wordWrap: 'on',
          wrappingIndent: 'indent',
          renderLineHighlight: 'none',
          validateOnModelChange: false,
          tokenization: {
            tokenization: false
          },
          diagnostics: {
            noSuggestions: true,
            noSemanticValidation: true,
            noSyntaxValidation: true
          },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12
          },
          guides: {
            indentation: true,
            bracketPairs: true
          }
        }}
      />
    </div>
  );
}