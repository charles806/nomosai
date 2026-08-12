import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
    isOpen: boolean;
    msUntilReset?: number;
}

function formatResetTime(ms?: number): string {
    if (!ms || ms <= 0) return 'shortly';
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

    if (hours <= 0) return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
    if (minutes === 0) return `in ${hours} hour${hours === 1 ? '' : 's'}`;
    return `in ${hours}h ${minutes}m`;
}

export function UpgradeModal({ isOpen, msUntilReset }: UpgradeModalProps) {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        navigate('/pricing');
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (err) {
            console.error('Sign out failed:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&display=swap');
                .font-serif { font-family: 'Source Serif 4', Georgia, serif; }
                .font-sans { font-family: 'Inter', system-ui, sans-serif; }
                .blue-gradient {
                    background: linear-gradient(135deg, #60a5fa 0%, #6366f1 50%, #2563eb 100%);
                }
                .seal-corner::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 24px; height: 24px;
                    border-top: 1.5px solid #3b82f6;
                    border-left: 1.5px solid #3b82f6;
                    border-top-left-radius: 1.5rem;
                }
                .seal-corner::after {
                    content: '';
                    position: absolute;
                    bottom: 0; right: 0;
                    width: 24px; height: 24px;
                    border-bottom: 1.5px solid #3b82f6;
                    border-right: 1.5px solid #3b82f6;
                    border-bottom-right-radius: 1.5rem;
                }
                .orb {
                    position: absolute;
                    border-radius: 9999px;
                    filter: blur(70px);
                    pointer-events: none;
                }
            `}</style>

            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#05070d]/80 backdrop-blur-md" />

            {/* Modal */}
            <div className="relative seal-corner bg-[#0f1420] border border-[#2a3142] rounded-3xl shadow-2xl shadow-black/50 max-w-md w-full p-8 sm:p-10 font-sans animate-scale-in overflow-hidden">
                {/* Ambient gradient orbs */}
                <div className="orb w-64 h-64 -top-20 -right-20 bg-gradient-to-br from-[#3b82f6]/25 via-[#3b82f6]/10 to-transparent" />
                <div className="orb w-48 h-48 -bottom-16 -left-16 bg-gradient-to-tr from-[#7c3aed]/20 via-[#06b6d4]/10 to-transparent" />

                <div className="relative">
                    {/* Eyebrow */}
                    <div className="flex items-center justify-center gap-2 text-[#3b82f6] text-[11px] font-semibold tracking-[0.2em] uppercase mb-7">
                        <span className="h-px w-6 bg-[#3b82f6]/60" />
                        Daily Limit Reached
                        <span className="h-px w-6 bg-[#3b82f6]/60" />
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-7">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full blue-gradient shadow-lg shadow-[#3b82f6]/25">
                            <Lock className="h-7 w-7 text-white" strokeWidth={1.75} />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="font-serif text-2xl sm:text-[28px] font-semibold text-[#f2f0ea] text-center mb-3.5 leading-tight">
                        You've hit today's message limit
                    </h2>

                    {/* Message */}
                    <p className="text-[#8b92a8] text-center text-[15px] mb-9 leading-relaxed">
                        Free accounts get <span className="text-[#e8e6e0] font-medium">10 messages per day</span>.
                        Your limit resets {formatResetTime(msUntilReset)}, or upgrade to a premium plan for unlimited access to NOMOS AI's legal intelligence.
                    </p>

                    {/* Upgrade Button */}
                    <button
                        onClick={handleUpgrade}
                        className="w-full blue-gradient hover:brightness-110 text-white font-semibold py-3.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-[#3b82f6]/25 hover:shadow-xl hover:shadow-[#3b82f6]/35"
                    >
                        Upgrade Now
                        <ArrowRight className="h-4.5 w-4.5" />
                    </button>

                    {/* Sign Out Link */}
                    <button
                        onClick={handleSignOut}
                        className="w-full mt-4 text-[#5a6178] hover:text-[#8b92a8] text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out instead
                    </button>
                </div>
            </div>
        </div>
    );
}
