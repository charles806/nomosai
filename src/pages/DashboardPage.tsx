import { useState } from 'react';
import { Scale, LogOut } from 'lucide-react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatMessages } from '../components/ChatMessages';
import { ChatInput } from '../components/ChatInput';
import { ErrorMessage } from '../components/ErrorMessage';
import { MobileMenu } from '../components/MobileMenu';
import { SettingsModal } from '../components/SettingsModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { GeminiService } from '../services/geminiService';

export default function DashboardPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [aiMode, setAiMode] = useState<'professional' | 'companion'>('professional');
    const { user, signOut } = useAuth();
    const {
        canSendMessage,
        isFreeTrial,
        freeTrialRemaining,
        incrementMessageCount,
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
        // Increment after sending
        await incrementMessageCount();

        // Check if this was the last free message
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
        <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
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
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="lg:hidden w-10" />
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <Scale className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Legal Gee</h1>
                                <p className="text-xs text-gray-400">
                                    {aiMode === 'professional'
                                        ? 'Super Intelligent Global Legal Assistant'
                                        : 'Friendly Global Legal Companion'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Free trial badge */}
                            {isFreeTrial && (
                                <span className="hidden sm:inline-flex items-center text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-medium">
                                    {freeTrialRemaining} message{freeTrialRemaining !== 1 ? 's' : ''} left
                                </span>
                            )}
                            <p className="text-xs text-gray-400 hidden sm:block">{user?.email}</p>
                            <button
                                onClick={handleSignOut}
                                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
                                title="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
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
        </div>
    );
}
