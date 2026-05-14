import React, { useState } from 'react';
import { Copy, Check, User, Scale, FileText, Image, File, Download } from 'lucide-react';
import { Message, FileAttachment } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    if (type.includes('word') || type.includes('document')) return FileText;
    if (type.includes('excel') || type.includes('sheet')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatContent = (content: string) => {
    // Enhanced content formatting for comprehensive case explanations
    return content
      .split('\n')
      .map((line, index) => {
        // Handle bold text
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-green-300">$1</strong>');
        
        // Case citation formatting
        const citeFormatted = boldFormatted.replace(
          /([A-Z][a-zA-Z\s&]+v\.?\s+[A-Z][a-zA-Z\s&]+(\s*\[\d{4}\]|\s*\(\d{4}\))[^.]*|[A-Z][a-zA-Z\s&]+\s+v\.?\s+[A-Z][a-zA-Z\s&]+)/g,
          '<em class="text-blue-300 font-medium">$1</em>'
        );
        
        // Legal principle highlighting
        const principleFormatted = citeFormatted.replace(
          /(The Facts?:|Legal Issues?:|Judgment:|Decision:|Significance:|Background:|Impact:|Current Status:)/g,
          '<strong class="text-amber-400 font-bold">$1</strong>'
        );
        
        return line.trim() ? (
          <p 
            key={index} 
            className="mb-3 leading-relaxed text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: principleFormatted }}
          />
        ) : (
          <div key={index} className="h-3" />
        );
      });
  };

  return (
    <div className={`flex gap-3 p-3 ${message.type === 'assistant' ? 'bg-gray-800/30' : 'bg-gray-900/50'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
        message.type === 'user' 
          ? 'bg-gray-600' 
          : 'bg-gradient-to-br from-blue-500 to-blue-600'
      }`}>
        {message.type === 'user' ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Scale className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-300">
            {message.type === 'user' ? 'You' : 'Legal Gee'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        {/* File Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment) => {
              const IconComponent = getFileIcon(attachment.type);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                >
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <IconComponent className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(attachment.size)}</p>
                  </div>
                  {attachment.url && (
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-gray-100 space-y-2">
          {typeof message.content === 'string' ? (
            formatContent(message.content)
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        {/* Copy Button */}
        {message.type === 'assistant' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}