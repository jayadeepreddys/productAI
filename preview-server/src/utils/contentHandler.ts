type ContentType = {
  type: 'component' | 'page';
  content: string;
  path?: string;
};

export function parseContent(data: any): ContentType {
  try {
    // Handle string input
    if (typeof data === 'string') {
      return {
        type: 'page',
        content: data
      };
    }

    // Handle object input
    if (typeof data === 'object' && data !== null) {
      return {
        type: data.type || 'page',
        content: data.content || data.html || JSON.stringify(data),
        path: data.path
      };
    }

    // Default fallback
    return {
      type: 'page',
      content: String(data)
    };
  } catch (e) {
    console.error('Content parsing error:', e);
    return {
      type: 'page',
      content: '<div class="text-red-500">Error parsing content</div>'
    };
  }
}

export function sanitizeContent(content: string): string {
  try {
    // Remove potentially harmful scripts
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  } catch (e) {
    console.error('Content sanitization error:', e);
    return '<div class="text-red-500">Error sanitizing content</div>';
  }
} 