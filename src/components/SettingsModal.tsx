import React from 'react';
import { X, Settings, User, MessageCircle, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'professional' | 'companion';
  onModeChange: (mode: 'professional' | 'companion') => void;
}

export function SettingsModal({ isOpen, onClose, mode, onModeChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div className="relative bg-[#111214] border border-white/10 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Settings className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content - Reduced Spacing */}
        <div className="p-5 space-y-5">
          
          <section>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">
              Assistant Personality
            </label>
            
            <div className="space-y-2">
              {/* Professional Option */}
              <button
                onClick={() => onModeChange('professional')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  mode === 'professional'
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'professional' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className={`text-sm font-semibold ${mode === 'professional' ? 'text-blue-400' : 'text-white'}`}>
                    Professional
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-tight">Formal analysis & citations</p>
                </div>
              </button>

              {/* Companion Option */}
              <button
                onClick={() => onModeChange('companion')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  mode === 'companion'
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'companion' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className={`text-sm font-semibold ${mode === 'companion' ? 'text-emerald-400' : 'text-white'}`}>
                    Companion
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-tight">Conversational & friendly</p>
                </div>
              </button>
            </div>
          </section>

          {/* Minimal Info Box */}
          <div className="p-3 bg-blue-500/[0.03] border border-blue-500/10 rounded-lg">
            <p className="text-[11px] text-gray-500 leading-normal">
              <span className="text-blue-400 font-medium">Legal Gee AI</span> provides multi-jurisdictional insights and remembers conversation context for accuracy.
            </p>
          </div>
        </div>

        {/* Footer - Small button */}
        <div className="px-5 py-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}