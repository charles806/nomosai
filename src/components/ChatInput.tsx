import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Loader2, X, Mic, Square, Paperclip } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileUploadRef = useRef<FileUploadRef>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [message]);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      audioChunksRef.current = [];
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const sendVoiceNote = async (audioBlob: Blob) => {
    const voiceNote: FileAttachment = {
      id: `voice-${Date.now()}`,
      name: `Voice note (${Math.floor(recordingTime)}s)`,
      type: audioBlob.type,
      size: audioBlob.size,
      url: URL.createObjectURL(audioBlob),
    };

    onSendMessage('Please transcribe and respond to my voice message.', [voiceNote]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasContent = message.trim().length > 0 || attachments.length > 0;

  return (
    <div className="flex-shrink-0 w-full bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-3 pb-2.5 px-2.5 sm:pt-6 sm:pb-4 sm:px-4">
      <style>{`
        @keyframes nomos-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .nomos-gradient-ring {
          background: linear-gradient(115deg, #2563eb, #7c3aed, #06b6d4, #2563eb);
          background-size: 300% 300%;
          animation: nomos-spin 6s ease infinite;
        }
        .nomos-gradient-ring.idle {
          animation-duration: 14s;
          opacity: 0.55;
        }
        .nomos-wordmark {
          background: linear-gradient(90deg, #60a5fa, #a78bfa, #22d3ee, #60a5fa);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: nomos-spin 6s ease infinite;
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3 select-none">
          <span className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase font-semibold nomos-wordmark">
            NOMOS AI
          </span>
        </div>

        {showFileUpload && (
          <div className="mb-2.5 sm:mb-3 p-2.5 sm:p-3 bg-gray-800/90 backdrop-blur rounded-xl sm:rounded-2xl border border-gray-700 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-white flex items-center gap-1.5">
                <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400" />
                Attach files
              </span>
              <button
                onClick={() => setShowFileUpload(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FileUpload ref={fileUploadRef} onFilesSelected={setAttachments} />
          </div>
        )}

        {/* Recording UI */}
        {isRecording ? (
          <div className="relative rounded-[20px] sm:rounded-[26px] p-[1.5px] nomos-gradient-ring shadow-2xl shadow-red-500/10">
            <div className="flex items-center gap-2 sm:gap-3 bg-gray-900 rounded-[18px] sm:rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500" />
                </span>
                <span className="text-white font-medium text-sm sm:text-base">Recording</span>
                <span className="text-gray-400 text-xs sm:text-sm tabular-nums">{formatTime(recordingTime)}</span>
              </div>
              <button
                onClick={cancelRecording}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 flex-shrink-0"
                title="Cancel"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={stopRecording}
                className="flex-shrink-0 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white transition-all shadow-lg shadow-blue-500/30"
                title="Send voice note"
              >
                <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`relative rounded-[20px] sm:rounded-[26px] p-[1.5px] transition-opacity duration-300 nomos-gradient-ring ${
              isFocused || hasContent ? '' : 'idle'
            }`}
          >
            <div className="relative flex items-end gap-1.5 sm:gap-2 bg-gray-900 rounded-[18px] sm:rounded-[24px] px-2 py-2 sm:px-3 sm:py-2.5">
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="flex-shrink-0 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                title="Attach files"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder || 'Ask NOMOS AI...'}
                className="flex-1 min-w-0 bg-transparent text-white placeholder-gray-500 py-2 px-1 sm:py-2.5 outline-none resize-none text-sm sm:text-[15px] leading-relaxed max-h-32 sm:max-h-40 min-h-[20px] sm:min-h-[24px]"
              />

              <button
                type="button"
                onClick={startRecording}
                className="flex-shrink-0 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                title="Record voice note"
              >
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={() => handleSubmit()}
                disabled={!hasContent || isLoading}
                className={`flex-shrink-0 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 ${
                  hasContent
                    ? 'bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/30 scale-100'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed scale-95'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {attachments.map(att => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-blue-500/20"
              >
                <Paperclip className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{att.name}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                  className="hover:text-blue-100 transition-colors"
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-2 sm:mt-2.5 text-center text-[10px] sm:text-[11px] text-gray-600">
          NOMOS AI can make mistakes. Verify important legal information.
        </p>
      </div>
    </div>
  );
}