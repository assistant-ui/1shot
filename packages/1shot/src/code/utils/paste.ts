export function getPastedTextPrompt(text: string, pasteNumber: number): string {
  const lineCount = (text.match(/\r\n|\r|\n/g) || []).length;
  return `[Pasted text #${pasteNumber} +${lineCount} lines]`;
}

export interface PastedText {
  id: number;
  text: string;
  prompt: string;
}