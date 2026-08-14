import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, FileText, Award, User, Trash2, Settings, LogOut, ChevronUp, CreditCard, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Conversation } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  onShowSettings: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAll,
  onShowSettings
}: ChatSidebarProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-64 bg-[#171717] flex flex-col h-full text-white font-sans">
      {/* Search and Header Actions */}
      <div className="p-3 space-y-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#2f2f2f] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-0 placeholder-gray-500"
          />
        </div>

        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#212121] hover:bg-[#2f2f2f] rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>New chat</span>
        </button>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-[#212121] hover:bg-[#2f2f2f] rounded-lg transition-colors text-[11px] font-medium">
            <FileText className="h-3.5 w-3.5" />
            <span>Documents</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-[#212121] hover:bg-[#2f2f2f] rounded-lg transition-colors text-[11px] font-medium">
            <Award className="h-3.5 w-3.5" />
            <span>Badges</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 mt-2 space-y-0.5">
        {conversations.length === 0 ? (
          <div className="text-center py-10 opacity-20">
            <p className="text-xs">No history</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                currentConversationId === conversation.id ? 'bg-[#212121]' : 'hover:bg-[#212121]'
              }`}
            >
              <div className="flex-1 truncate pr-2">
                <p className="truncate">{conversation.title}</p>
                <p className="text-[10px] text-gray-500">{formatDate(conversation.updatedAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Settings & System Actions */}
      <div className="px-2 py-2 space-y-1 border-t border-gray-800/40">
        <button
          onClick={onShowSettings}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#212121] rounded-lg transition-all text-xs"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Settings</span>
        </button>
        <Link
          to="/payment"
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#212121] rounded-lg transition-all text-xs"
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Payment</span>
        </Link>
        <Link
          to="/pricing"
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#212121] rounded-lg transition-all text-xs"
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Pricing</span>
        </Link>
        <button
          onClick={onClearAll}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-red-400 hover:bg-[#212121] rounded-lg transition-all text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear history</span>
        </button>
      </div>

      {/* User Profile Footer */}
      <div className="p-2 border-t border-gray-800/50 relative" ref={menuRef}>
        {showUserMenu && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-[#2f2f2f] rounded-xl border border-gray-700/50 overflow-hidden shadow-lg z-50">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#3a3a3a] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowUserMenu((prev) => !prev)}
          className="w-full flex items-center gap-3 p-2.5 hover:bg-[#212121] rounded-xl transition-colors text-left group"
        >
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            {user?.email ? (
              <span className="text-xs font-semibold text-white">
                {getInitials(user.email)}
              </span>
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>

          <span className="text-sm font-medium text-gray-300 truncate flex-1">
            {user?.email ?? 'Guest'}
          </span>

          <ChevronUp
            className={`h-3.5 w-3.5 text-gray-500 transition-transform flex-shrink-0 ${
              showUserMenu ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}
