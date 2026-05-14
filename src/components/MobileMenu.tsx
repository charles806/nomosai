import React from 'react';
import { Menu, X } from 'lucide-react';
import { ChatSidebar } from './ChatSidebar';
import { Conversation } from '../types/chat';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  onShowSettings: () => void;
}

export function MobileMenu({
  isOpen,
  onToggle,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAll,
  onShowSettings
}: MobileMenuProps) {
  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    onToggle(); // Close menu after selection
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg border border-gray-700/50 backdrop-blur-sm transition-all duration-200"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={onNewConversation}
          onDeleteConversation={onDeleteConversation}
          onClearAll={onClearAll}
          onShowSettings={onShowSettings}
        />
      </div>
    </>
  );
}