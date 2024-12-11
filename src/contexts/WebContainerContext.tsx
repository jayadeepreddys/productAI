"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { WebContainer } from '@webcontainer/api';

interface WebContainerContextType {
  webcontainer: WebContainer | null;
  isLoading: boolean;
  error: Error | null;
}

const WebContainerContext = createContext<WebContainerContextType>({
  webcontainer: null,
  isLoading: true,
  error: null,
});

let webcontainerInstance: WebContainer | null = null;

export function WebContainerProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const bootAttempted = useRef(false);

  useEffect(() => {
    if (bootAttempted.current || webcontainerInstance) {
      setIsLoading(false);
      return;
    }

    async function bootWebContainer() {
      try {
        bootAttempted.current = true;
        
        if (!window.crossOriginIsolated) {
          throw new Error('Cross-Origin Isolation is not enabled');
        }

        const { WebContainer } = await import('@webcontainer/api');
        webcontainerInstance = await WebContainer.boot();
        
      } catch (err) {
        console.error('WebContainer boot error:', err);
        setError(err instanceof Error ? err : new Error('Failed to boot WebContainer'));
      } finally {
        setIsLoading(false);
      }
    }

    bootWebContainer();

    return () => {
      if (webcontainerInstance) {
        webcontainerInstance.teardown();
        webcontainerInstance = null;
        bootAttempted.current = false;
      }
    };
  }, []);

  return (
    <WebContainerContext.Provider 
      value={{ 
        webcontainer: webcontainerInstance, 
        isLoading, 
        error 
      }}
    >
      {children}
    </WebContainerContext.Provider>
  );
}

export const useWebContainer = () => useContext(WebContainerContext); 