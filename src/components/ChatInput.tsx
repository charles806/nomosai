import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Loader2, X } from 'lucide-react';
import { FileUpload, FileUploadRef } from './FileUpload';
import { FileAttachment } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSendMessage, isLoading, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileUploadRef = useRef<FileUploadRef>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      const currentAttachments = [...attachments];
      const currentMessage = message.trim() || 'Please analyze the attached file(s)';

      onSendMessage(currentMessage, currentAttachments);

      setMessage('');
      setAttachments([]);
      setShowFileUpload(false);
      fileUploadRef.current?.clearFiles();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="flex-shrink-0 w-full bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-4 pb-4 px-4">
      <div className="max-w-3xl mx-auto">
        {showFileUpload && (
          <div className="mb-3 p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Attach Files</span>
              <button
                onClick={() => setShowFileUpload(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FileUpload ref={fileUploadRef} onFilesSelected={setAttachments} />
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-gray-800 rounded-2xl border border-gray-700 px-3 py-2 shadow-lg">
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-gray-300"
            title="Attach files"
          >
            <Plus className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask NOMOS AI..."}
            className="flex-1 bg-transparent text-white placeholder-gray-500 py-2 px-1 outline-none resize-none text-[15px] leading-relaxed max-h-32 min-h-[24px]"
            style={{ fontFamily: 'inherit' }}
          />

          <button
            onClick={() => handleSubmit()}
            disabled={(!message.trim() && attachments.length === 0) || isLoading}
            className={`flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg transition-all ${
              message.trim() || attachments.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </button>
        </div>

        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map(att => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20"
              >
                <span className="truncate max-w-[100px]">{att.name}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                  className="hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}