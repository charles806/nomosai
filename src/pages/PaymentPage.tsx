import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Scale, ArrowLeft, CreditCard, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { initializePaystack, generateReference } from '../services/paystackService';

const planDetails: Record<string, { name: string; monthly: number; yearly: number }> = {
    basic: { name: 'Basic', monthly: 2000, yearly: 20000 },
    essential: { name: 'Essential', monthly: 15000, yearly: 150000 },
    enterprise: { name: 'Enterprise', monthly: 30000, yearly: 300000 },
};

export default function PaymentPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { activateSubscription } = useSubscription();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const planId = searchParams.get('plan') || 'basic';
    const billing = searchParams.get('billing') || 'monthly';
    const plan = planDetails[planId] || planDetails.basic;
    const price = billing === 'yearly' ? plan.yearly : plan.monthly;
    const amountKobo = price * 100;

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    const handlePay = () => {
        if (!user?.email) return;
        setError('');
        setProcessing(true);

        try {
            initializePaystack({
                email: user.email,
                amount: amountKobo,
                reference: generateReference(),
                onSuccess: async (reference) => {
                    try {
                        await activateSubscription(planId, reference);
                        setSuccess(true);
                        setTimeout(() => navigate('/dashboard'), 1500);
                    } catch (err) {
                        setError('Payment received but failed to activate subscription. Contact support.');
                        setProcessing(false);
                    }
                },
                onClose: () => {
                    setProcessing(false);
                },
            });
        } catch (err) {
            setError('Failed to initialize payment. Please try again.');
            setProcessing(false);
        }
    };

    const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`;

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <div className="text-center animate-scale-in">
                    <div className="inline-flex p-4 bg-green-500/15 rounded-2xl mb-6">
                        <CheckCircle className="h-12 w-12 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Payment Successful!</h2>
                    <p className="text-gray-400 mb-6">Redirecting you to the dashboard...</p>
                    <div className="w-8 h-8 border-3 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                            <Scale className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">Legal Gee</span>
                    </Link>
                    <Link
                        to="/pricing"
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to plans
                    </Link>
                </div>
            </header>

            {/* Main */}
            <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24">
                <div className="animate-fade-in-up">
                    <h1 className="text-3xl font-extrabold text-center mb-2">Complete Payment</h1>
                    <p className="text-gray-400 text-center mb-10">
                        Review your order and proceed with payment
                    </p>

                    {/* Order summary card */}
                    <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-6 mb-6">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                            Order Summary
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Plan</span>
                                <span className="font-semibold text-white">{plan.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Billing</span>
                                <span className="font-medium text-white capitalize">{billing}</span>
                            </div>
                            <div className="border-t border-gray-700 my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 font-medium">Total</span>
                                <span className="text-2xl font-bold text-white">{formatNaira(price)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security note */}
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6">
                        <Shield className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-300">Secured by Paystack — your payment info is safe</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6">
                            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Pay button */}
                    <button
                        id="pay-now-button"
                        onClick={handlePay}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/25"
                    >
                        {processing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-5 w-5" />
                                Pay {formatNaira(price)}
                            </>
                        )}
                    </button>

                    <p className="text-gray-500 text-xs text-center mt-4">
                        By proceeding, you agree to the Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
