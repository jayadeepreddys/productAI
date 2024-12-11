import * as Babel from '@babel/standalone';

export async function transpileModule(code: string): Promise<string> {
  try {
    // Transform the code
    const result = Babel.transform(code, {
      presets: ['react'],
      plugins: [
        ['transform-typescript', { isTSX: true }]
      ],
      filename: 'component.tsx',
      sourceType: 'module',
    });

    if (!result?.code) {
      throw new Error('No code generated');
    }

    // Convert the code to React.createElement calls
    const processedCode = result.code
      .replace(/"use client";?/, '')
      .replace(/export\s+(?:default\s+)?function\s+(\w+)/, 'function $1')
      .replace(/export\s+(?:default\s+)?const\s+(\w+)/, 'const $1')
      .replace(/import\s+.*?from\s+['"]react['"];?/, '')
      .replace(/module\.exports\s+=\s+/, 'return ');

    // Wrap in a function that returns the component
    return `
      (function() {
        const React = window.React;
        ${processedCode}
      })()
    `;

  } catch (error) {
    console.error('Transpilation error:', error);
    return `
      (function() {
        return function ErrorComponent() {
          return React.createElement('div', {
            style: {
              padding: '1rem',
              margin: '1rem',
              border: '1px solid red',
              borderRadius: '4px',
              color: 'red'
            }
          }, 'Failed to load component: ${
            error instanceof Error ? error.message.replace(/'/g, "\\'") : 'Unknown error'
          }');
        }
      })()
    `;
  }
} 