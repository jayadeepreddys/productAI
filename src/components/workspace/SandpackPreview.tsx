"use client";

import {
  SandpackProvider,
  SandpackPreview,
  SandpackConsole,
} from "@codesandbox/sandpack-react";
import { useEffect, useState, useRef } from "react";
import { projectStore } from "@/lib/store/projects";

interface PreviewProps {
  projectId: string;
  showConsole?: boolean;
  onClose?: () => void;
  initialPosition?: { x: number; y: number };
}

export function LivePreview({ 
  projectId, 
  showConsole = false, 
  onClose,
  initialPosition = { x: window.innerWidth - 520, y: 100 }
}: PreviewProps) {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [dependencies, setDependencies] = useState<Record<string, string>>({});
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState({ width: 500, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  // ... existing useEffect for files and dependencies ...

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        setPosition({
          x: e.clientX - dragRef.current.x,
          y: e.clientY - dragRef.current.y
        });
      } else if (isResizing && dragRef.current) {
        const dx = e.clientX - dragRef.current.x;
        const dy = e.clientY - dragRef.current.y;
        setSize(prev => ({
          width: Math.max(300, prev.width + dx),
          height: Math.max(200, prev.height + dy)
        }));
        dragRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div 
      className="fixed shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 50
      }}
    >
      <div 
        className="h-8 bg-gray-100 flex items-center justify-between px-3 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-medium text-gray-700">Preview</span>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="h-[calc(100%-2rem)]">
        <SandpackProvider
          template="react-ts"
          files={files}
          customSetup={{
            dependencies: dependencies,
            entry: "/index.tsx"
          }}
          theme="dark"
        >
          <div className="h-full flex flex-col">
            <SandpackPreview
              showNavigator={true}
              showRefreshButton={true}
              style={{ height: '100%', minHeight: 0 }}
            />
            {showConsole && (
              <div className="h-48 border-t border-gray-700">
                <SandpackConsole />
              </div>
            )}
          </div>
        </SandpackProvider>
      </div>

      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <svg 
          className="w-4 h-4 text-gray-400" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M22 22H20V20H22V22ZM22 18H18V20H22V18ZM18 22H16V24H18V22ZM14 22H12V24H14V22Z" />
        </svg>
      </div>
    </div>
  );
}