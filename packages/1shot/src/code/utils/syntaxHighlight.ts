// Simple regex to match string literals (single and double quotes)
const STRING_REGEX = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g;

// ANSI color codes
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

export const highlightStrings = (code: string): string => {
  if (!code) return '';
  
  let result = '';
  let lastIndex = 0;
  let match;
  
  while ((match = STRING_REGEX.exec(code)) !== null) {
    // Add text before the string
    if (match.index > lastIndex) {
      result += code.slice(lastIndex, match.index);
    }
    
    // Add the highlighted string
    result += CYAN + match[0] + RESET;
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < code.length) {
    result += code.slice(lastIndex);
  }
  
  return result;
};

export const highlightCodeWithStrings = (code: string): string => {
  if (!code) return '';
  
  const lines = code.split('\n');
  const highlightedLines = lines.map(line => highlightStrings(line));
  
  return highlightedLines.join('\n');
}; 