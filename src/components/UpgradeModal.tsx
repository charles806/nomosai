import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
    isOpen: boolean;
}

export function UpgradeModal({ isOpen }: UpgradeModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scale-in">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30">
                        <Lock className="h-8 w-8 text-amber-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-3">
                    Free Trial Ended
                </h2>

                {/* Message */}
                <p className="text-gray-400 text-center mb-8 leading-relaxed">
                    You've used all <span className="text-white font-semibold">5 free messages</span>.
                    Upgrade to a premium plan to continue using Legal Gee's AI-powered legal assistant.
                </p>

                {/* Upgrade Button */}
                <button
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
                >
                    Upgrade Now
                    <ArrowRight className="h-5 w-5" />
                </button>

                {/* Sign Out Link */}
                <button
                    onClick={handleSignOut}
                    className="w-full mt-4 text-gray-500 hover:text-gray-300 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out Instead
                </button>
            </div>
        </div>
    );
}
