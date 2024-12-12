interface ParsedBlock {
  type: 'text' | 'code';
  content: string;
  filepath?: string;
}

export function parseCodeBlocks(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let currentText = '';
  
  // Split the text into lines and process each line
  const lines = text.split('\n');
  let isInCodeBlock = false;
  let currentFilePath = '';
  let currentCodeBlock = '';

  for (let line of lines) {
    // Clean up the line
    line = line.replace(/\s+/g, ' ').trim();

    // Check for code block markers
    if (line.toLowerCase().includes('typescript:src/')) {
      // Extract filepath
      const filepathMatch = line.match(/typescript:src\/[^`\s]*/i);
      if (filepathMatch) {
        // If we have accumulated text, add it as a text block
        if (currentText.trim()) {
          blocks.push({
            type: 'text',
            content: currentText.trim()
          });
          currentText = '';
        }
        
        isInCodeBlock = true;
        currentFilePath = filepathMatch[0].replace('typescript:', '');
        currentCodeBlock = '';
        continue;
      }
    }

    // Check for code block end
    if (line.includes('file:') || line.includes('these two files')) {
      if (isInCodeBlock && currentCodeBlock) {
        blocks.push({
          type: 'code',
          content: currentCodeBlock.trim(),
          filepath: currentFilePath
        });
        currentCodeBlock = '';
        currentFilePath = '';
        isInCodeBlock = false;
      }
      currentText = line;
      continue;
    }

    // Add content to appropriate buffer
    if (isInCodeBlock) {
      currentCodeBlock += line + '\n';
    } else {
      currentText += ' ' + line;
    }
  }

  // Add any remaining text
  if (currentText.trim()) {
    blocks.push({
      type: 'text',
      content: currentText.trim()
    });
  }

  // Add any remaining code block
  if (isInCodeBlock && currentCodeBlock.trim()) {
    blocks.push({
      type: 'code',
      content: currentCodeBlock.trim(),
      filepath: currentFilePath
    });
  }

  return blocks;
}

// Helper function to clean up code content
export function cleanCodeContent(code: string): string {
  return code
    .replace(/\s+/g, ' ')          // Replace multiple spaces with single space
    .replace(/\s*([{}()])\s*/g, '$1') // Clean up spaces around brackets
    .replace(/\s*,\s*/g, ', ')     // Clean up spaces around commas
    .replace(/\s*;\s*/g, '; ')     // Clean up spaces around semicolons
    .replace(/\s*=\s*/g, ' = ')    // Clean up spaces around equals
    .replace(/\s*:\s*/g, ': ')     // Clean up spaces around colons
    .split(' ').filter(Boolean).join(' ') // Remove empty parts
    .trim();
}

// Helper function to format the code with proper indentation
export function formatCode(code: string): string {
  let indentLevel = 0;
  const indentSize = 2;
  const lines = code.split(/[;{}]/).filter(Boolean);
  
  return lines.map(line => {
    line = line.trim();
    if (line.includes('}')) indentLevel--;
    const indent = ' '.repeat(indentLevel * indentSize);
    if (line.includes('{')) indentLevel++;
    return indent + line + ';';
  }).join('\n');
} 