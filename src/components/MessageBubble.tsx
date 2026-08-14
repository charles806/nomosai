import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

/**
 * Renders lightweight markdown-style content:
 * - A line that is entirely **bold** (optionally ending in ":") becomes a
 *   highlighted heading, like "Clear, Simple Explanation..." in the screenshot.
 * - Inline **bold** text becomes a highlighted (blue) keyword/phrase.
 * - Blank lines become spacing.
 */
function renderFormattedContent(content: string) {
  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      return <div key={lineIndex} className="h-3" />;
    }

    // Whole-line bold -> treat as a section heading
    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (headingMatch) {
      return (
        <p
          key={lineIndex}
          className="text-[#7bb3f0] font-semibold text-base sm:text-lg mt-5 mb-1 first:mt-0"
        >
          {headingMatch[1]}
          {trimmed.endsWith(':') ? ':' : ''}
        </p>
      );
    }

    // Otherwise render the line normally, but highlight any inline **bold** segments
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return (
      <p key={lineIndex} className="mb-2">
        {parts.map((part, i) => {
          const boldMatch = part.match(/^\*\*(.+)\*\*$/);
          if (boldMatch) {
            return (
              <span key={i} className="text-[#7bb3f0] font-medium">
                {boldMatch[1]}
              </span>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
      </p>
    );
  });
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

  // ChatGPT-style: assistant messages are plain text on the left, no bubble
  if (isAssistant) {
    return (
      <div className="flex w-full my-6 justify-start group">
        <div className="max-w-full sm:max-w-[85%] flex flex-col gap-2">
          <div className="text-[#ececec] text-sm sm:text-base leading-relaxed">
            {renderFormattedContent(message.content)}
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

  // User messages keep the bubble, aligned right
  return (
    <div className="flex w-full my-6 justify-end">
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
  );
}
