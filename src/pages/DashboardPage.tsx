import { useState } from 'react';
import { Scale } from 'lucide-react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatMessages } from '../components/ChatMessages';
import { ChatInput } from '../components/ChatInput';
import { ErrorMessage } from '../components/ErrorMessage';
import { MobileMenu } from '../components/MobileMenu';
import { SettingsModal } from '../components/SettingsModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { BadgeNotification } from '../components/BadgeNotification';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { GeminiService } from '../services/geminiService';

export default function DashboardPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [aiMode, setAiMode] = useState<'professional' | 'companion'>('professional');
    const { signOut } = useAuth();
    const {
        canSendMessage,
        isFreeTrial,
        freeTrialRemaining,
        incrementMessageCount,
        newBadge,
        clearNewBadge,
    } = useSubscription();

    const {
        conversations,
        currentConversation,
        isLoading,
        error,
        sendMessage,
        createNewConversation,
        selectConversation,
        deleteConversation,
        clearAllConversations,
    } = useChat();

    const geminiService = GeminiService.getInstance();

    const [showUpgrade, setShowUpgrade] = useState(false);

    const handleSendMessage = async (message: string, attachments?: any) => {
        if (!canSendMessage) {
            setShowUpgrade(true);
            return;
        }

        sendMessage(message, attachments);
        await incrementMessageCount();

        if (isFreeTrial && freeTrialRemaining <= 1) {
            setShowUpgrade(true);
        }
    };

    const handleNewConversation = () => {
        createNewConversation();
        setMobileMenuOpen(false);
    };

    const handleModeChange = (mode: 'professional' | 'companion') => {
        setAiMode(mode);
        geminiService.setMode(mode);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <ChatSidebar
                    conversations={conversations}
                    currentConversationId={currentConversation?.id || null}
                    onSelectConversation={selectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={deleteConversation}
                    onClearAll={clearAllConversations}
                    onShowSettings={() => setShowSettings(true)}
                />
            </div>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                conversations={conversations}
                currentConversationId={currentConversation?.id || null}
                onSelectConversation={selectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={deleteConversation}
                onClearAll={clearAllConversations}
                onShowSettings={() => setShowSettings(true)}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full">
                {/* Header - Fixed */}
                <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-gray-400 hover:text-white flex-shrink-0"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex-shrink-0">
                                <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-lg font-bold text-white truncate">NOMOS AI</h1>
                                <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block truncate">
                                    {aiMode === 'professional'
                                        ? 'Super Intelligent Global Legal Assistant'
                                        : 'Friendly Global Legal Companion'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {isFreeTrial && (
                                <span className="inline-flex items-center text-[10px] sm:text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium">
                                    {freeTrialRemaining} left
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <ErrorMessage
                        error={error}
                        onRetry={() => window.location.reload()}
                    />
                )}

                {/* Messages */}
                <ChatMessages
                    messages={currentConversation?.messages || []}
                    isLoading={isLoading}
                    onPromptSelect={(prompt) => handleSendMessage(prompt)}
                />

                {/* Input */}
                <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder={
                        canSendMessage
                            ? 'Ask any legal question...'
                            : 'Free trial ended — upgrade to continue'
                    }
                />
            </div>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                mode={aiMode}
                onModeChange={handleModeChange}
            />

            {/* Upgrade Modal */}
            <UpgradeModal isOpen={showUpgrade} />

            {/* Badge Notification */}
            <BadgeNotification badge={newBadge} onClose={clearNewBadge} />
        </div>
    );
}