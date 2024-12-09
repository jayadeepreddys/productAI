"use client";

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  initialValue: string;
  language: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ initialValue, language, onChange }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Editor
      height="70vh"
      defaultLanguage={language}
      defaultValue={initialValue}
      theme="vs-dark"
      onChange={(value) => onChange(value || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
} 