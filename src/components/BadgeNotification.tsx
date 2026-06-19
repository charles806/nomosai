import { useEffect } from 'react';
import { X, Award, BookOpen, Crown, Star, MessageCircle } from 'lucide-react';

interface BadgeNotificationProps {
    badge: {
        name: string;
        description: string;
        icon: string;
    } | null;
    onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
    'message-circle': <MessageCircle className="h-8 w-8 text-blue-400" />,
    'book-open': <BookOpen className="h-8 w-8 text-emerald-400" />,
    'award': <Award className="h-8 w-8 text-amber-400" />,
    'crown': <Crown className="h-8 w-8 text-purple-400" />,
    'star': <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />,
};

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
    useEffect(() => {
        if (badge) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [badge, onClose]);

    if (!badge) return null;

    return (
        <div className="fixed top-4 right-4 z-[200] animate-slide-in-right">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/20 p-5 max-w-sm">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                        {iconMap[badge.icon] || <Award className="h-8 w-8 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                Badge Earned!
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">
                            {badge.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {badge.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}