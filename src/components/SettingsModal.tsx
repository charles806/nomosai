import React from 'react';
import { X, Settings, User, MessageCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'professional' | 'companion';
  onModeChange: (mode: 'professional' | 'companion') => void;
}

export function SettingsModal({ isOpen, onClose, mode, onModeChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">AI Mode</h3>
            <div className="space-y-3">
              <button
                onClick={() => onModeChange('professional')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  mode === 'professional'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    mode === 'professional' ? 'bg-blue-500/20' : 'bg-gray-700/50'
                  }`}>
                    <User className={`h-5 w-5 ${
                      mode === 'professional' ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <h4 className={`font-semibold ${
                      mode === 'professional' ? 'text-blue-400' : 'text-white'
                    }`}>
                      Professional Mode
                    </h4>
                    <p className="text-sm text-gray-300 mt-1">
                      Serious, formal legal analysis with comprehensive case citations
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onModeChange('companion')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  mode === 'companion'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    mode === 'companion' ? 'bg-green-500/20' : 'bg-gray-700/50'
                  }`}>
                    <MessageCircle className={`h-5 w-5 ${
                      mode === 'companion' ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <h4 className={`font-semibold ${
                      mode === 'companion' ? 'text-green-400' : 'text-white'
                    }`}>
                      Companion Mode
                    </h4>
                    <p className="text-sm text-gray-300 mt-1">
                      Friendly, conversational legal guidance with simple explanations
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-xl p-4 border border-blue-700/30">
            <h4 className="text-blue-400 font-semibold mb-2">About Legal Gee</h4>
            <p className="text-gray-300 text-sm">
              Super intelligent global legal AI assistant with comprehensive knowledge of legal systems worldwide. 
              Provides direct, clear analysis with case explanations, constitutional provisions, and remembers 
              your conversation history for personalized assistance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}