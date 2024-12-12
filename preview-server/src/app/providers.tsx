'use client';

import { PropsWithChildren, createContext, useContext } from 'react';

// Create a default router context
const RouterContext = createContext({
  basename: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: async () => true,
  replace: async () => true,
  reload: () => {},
  back: () => {},
  prefetch: async () => {},
  beforePopState: () => {},
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
});

export function Providers({ children }: PropsWithChildren) {
  return (
    <RouterContext.Provider value={RouterContext._currentValue}>
      <div id="preview-root">
        {children}
      </div>
    </RouterContext.Provider>
  );
}

// Export the context for use in other components
export const useRouter = () => useContext(RouterContext); 