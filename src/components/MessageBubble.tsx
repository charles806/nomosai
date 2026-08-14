import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.type === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  if (isAssistant) {
    // No bubble: full-width, plain text, aligned left like ChatGPT's assistant messages
    return (
      <div className="w-full mb-4 group">
        <div className="max-w-3xl mx-auto sm:px-4">
          <div className="text-[#ececec] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-500 hover:text-white transition-colors rounded hover:bg-[#2f2f2f]"
              title="Copy"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User message: bubble, right-aligned
  return (
    <div className="w-full mb-4">
      <div className="max-w-3xl mx-auto sm:px-4 flex justify-end">
        <div className="max-w-[75%] sm:max-w-[60%] flex flex-col items-end gap-2">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {message.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2f2f2f] rounded-lg border border-gray-700"
                >
                  <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300 truncate max-w-[120px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white text-black text-sm sm:text-base leading-relaxed px-4 py-3 rounded-2xl whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
