import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, X } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      console.log('📤 Submitting message with attachments:', attachments.length);
      
      // Create a deep copy of attachments to preserve them
      const currentAttachments = attachments.map(att => ({
        ...att,
        base64: att.base64,
        type: att.type,
        name: att.name,
        size: att.size,
        url: att.url,
        id: att.id
      }));
      
      const currentMessage = message.trim() || 'Please analyze the attached file(s)';
      
      console.log('Sending:', {
        message: currentMessage,
        attachmentsCount: currentAttachments.length,
        attachments: currentAttachments.map(a => ({
          name: a.name,
          type: a.type,
          hasBase64: !!a.base64,
          base64Length: a.base64?.length
        }))
      });
      
      // Send message with attachments
      onSendMessage(currentMessage, currentAttachments);
      
      // Clear after a small delay to ensure data is sent
      setTimeout(() => {
        setMessage('');
        setAttachments([]);
        setShowFileUpload(false);
        fileUploadRef.current?.clearFiles();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleFilesSelected = (files: FileAttachment[]) => {
    console.log('Files selected:', files.length);
    setAttachments(files);
  };

  const removeAttachment = (fileId: string) => {
    const newAttachments = attachments.filter(f => f.id !== fileId);
    setAttachments(newAttachments);
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Upload Documents & Images</h3>
            <button
              onClick={() => setShowFileUpload(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <FileUpload ref={fileUploadRef} onFilesSelected={handleFilesSelected} />
        </div>
      )}

      {/* Attachment Preview */}
      {attachments.length > 0 && !showFileUpload && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm"
              >
                <Paperclip className="h-3 w-3 text-blue-400" />
                <span className="text-blue-300 max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="text-blue-400 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        <div className="relative flex items-end gap-2 bg-gray-800/50 rounded-lg border border-gray-700/50 focus-within:border-blue-500/50 transition-colors duration-200">
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`flex-shrink-0 p-2 m-1 rounded-lg transition-all duration-200 ${
              showFileUpload || attachments.length > 0
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask about any legal topic, upload documents/images for analysis..."}
            className="flex-1 bg-transparent text-white placeholder-gray-400 px-3 py-2 resize-none outline-none max-h-32 text-sm"
            rows={1}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || isLoading}
            className="flex-shrink-0 p-2 m-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2 px-1 text-xs">
          <p className="text-xs text-gray-500">
            Press Enter to send • Upload documents & images for legal analysis
          </p>
          {attachments.length > 0 && (
            <div className="flex items-center gap-1 text-blue-400">
              <Paperclip className="h-3 w-3" />
              <span>{attachments.length} file{attachments.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}