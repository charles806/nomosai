import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface PaymentNudgeProps {
    isOpen: boolean;
    onDismiss: () => void;
}

// A soft, non-blocking nudge — unlike UpgradeModal (which hard-blocks once
// the daily limit is actually hit), this sits above the composer, doesn't
// stop the user from continuing to chat, and can be dismissed. Triggered
// periodically (every few sent messages) rather than at the hard limit.
export function PaymentNudge({ isOpen, onDismiss }: PaymentNudgeProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        navigate('/pricing');
        onDismiss();
    };

    return (
        <div className="flex-shrink-0 w-full px-2.5 sm:px-4 animate-slide-up">
            <style>{`
                @keyframes slide-up-nudge {
                    from { transform: translateY(16px); opacity: 0; }
                    to   { transform: translateY(0);     opacity: 1; }
                }
                .animate-slide-up { animation: slide-up-nudge 0.28s ease-out; }
                .nudge-blue-gradient {
                    background: linear-gradient(135deg, #60a5fa 0%, #6366f1 50%, #2563eb 100%);
                }
            `}</style>

            <div className="max-w-3xl mx-auto mb-2.5 sm:mb-3">
                <div className="relative flex items-center gap-3 sm:gap-4 bg-[#0f1420] border border-[#2a3142] rounded-2xl shadow-xl shadow-black/30 px-4 py-3 sm:px-5 sm:py-3.5 overflow-hidden">
                    {/* Subtle ambient glow, consistent with UpgradeModal's orbs */}
                    <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#3b82f6]/20 via-[#3b82f6]/8 to-transparent blur-2xl" />

                    <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full nudge-blue-gradient flex-shrink-0 shadow-lg shadow-[#3b82f6]/20 relative">
                        <Sparkles className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" strokeWidth={1.75} />
                    </div>

                    <div className="flex-1 min-w-0 relative">
                        <p className="text-[13px] sm:text-sm font-medium text-[#e8e6e0] leading-snug">
                            Enjoying NOMOS AI?
                        </p>
                        <p className="text-[11px] sm:text-xs text-[#8b92a8] leading-snug truncate sm:whitespace-normal">
                            Upgrade for unlimited messages and priority access.
                        </p>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="flex-shrink-0 nudge-blue-gradient hover:brightness-110 text-white text-[12px] sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full transition-all duration-200 flex items-center gap-1.5 hover:scale-[1.02] shadow-md shadow-[#3b82f6]/20 relative"
                    >
                        <span className="hidden sm:inline">See Pricing</span>
                        <span className="sm:hidden">Upgrade</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                        onClick={onDismiss}
                        aria-label="Dismiss"
                        className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full text-[#5a6178] hover:text-[#8b92a8] hover:bg-white/5 transition-colors relative"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
