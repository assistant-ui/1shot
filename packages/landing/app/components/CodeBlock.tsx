'use client';

import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showCopyButton?: boolean;
}

export default function CodeBlock({ 
  children, 
  language = 'bash', 
  title,
  showCopyButton = true 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group my-4">
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        {title && (
          <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">
              {title}
            </span>
          </div>
        )}
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
            <code className={`language-${language} text-gray-100`}>
              {children}
            </code>
          </pre>
          {showCopyButton && (
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700"
              aria-label="Copy code"
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 