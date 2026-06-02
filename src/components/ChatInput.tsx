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
    <div className="w-full max-w-3xl mx-auto p-4 bg-transparent">
      {showFileUpload && (
        <div className="mb-4 p-4 bg-[#2f2f2f] rounded-2xl border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Attach Files</span>
            <X className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => setShowFileUpload(false)} />
          </div>
          <FileUpload ref={fileUploadRef} onFilesSelected={setAttachments} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowFileUpload(!showFileUpload)}
          className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-[#2f2f2f] hover:bg-[#3f3f3f] transition-colors text-gray-300"
        >
          <Plus className="h-5 w-5" />
        </button>

        <div className="relative flex-1 flex items-center bg-[#2f2f2f] rounded-lg px-4 py-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask legal gee"}
            className="flex-1 bg-transparent text-[#ececec] placeholder-gray-500 py-2 outline-none resize-none text-base max-h-32"
          />

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => handleSubmit()}
              disabled={(!message.trim() && attachments.length === 0) || isLoading}
              className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-all ${
                message.trim() || attachments.length > 0
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-[#171717] text-gray-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4 stroke-[3px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="mt-2 ml-14 flex gap-2">
          {attachments.map(att => (
            <div key={att.id} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              {att.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}