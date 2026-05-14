import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Check, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const plans = [
    {
        id: 'basic',
        name: 'Basic',
        monthlyPrice: 2000,
        yearlyPrice: 20000,
        yearlySavings: 4000,
        features: [
            'Up to 50 AI queries per month',
            'Basic legal research',
            'Case law citations',
            'Email support',
        ],
    },
    {
        id: 'essential',
        name: 'Essential',
        monthlyPrice: 15000,
        yearlyPrice: 150000,
        yearlySavings: 30000,
        popular: true,
        features: [
            'Unlimited AI queries',
            'Advanced legal analysis',
            'Contract review & drafting',
            'Multi-jurisdiction support',
            'Priority support',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        monthlyPrice: 30000,
        yearlyPrice: 300000,
        yearlySavings: 65000,
        features: [
            'Everything in Essential',
            'Team collaboration',
            'Custom AI training',
            'API access',
            'Dedicated account manager',
            'SLA guarantee',
        ],
    },
];

function formatNaira(amount: number) {
    return `₦${amount.toLocaleString()}`;
}

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleChoose = (planId: string) => {
        const billing = isYearly ? 'yearly' : 'monthly';
        if (user) {
            navigate(`/payment?plan=${planId}&billing=${billing}`);
        } else {
            navigate(`/register?plan=${planId}&billing=${billing}`);
        }
    };

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
                        to="/"
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                </div>
            </header>

            {/* Main */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                {/* Title */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Flexible plans for every legal professional. Start with a free trial, upgrade anytime.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-4 mb-14 animate-fade-in">
                    <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="relative w-14 h-7 rounded-full bg-gray-700 border border-gray-600 transition-colors focus:outline-none"
                        aria-label="Toggle billing period"
                    >
                        <div
                            className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 ${isYearly
                                    ? 'left-[calc(100%-1.625rem)] bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-500/30'
                                    : 'left-0.5 bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg shadow-blue-500/30'
                                }`}
                        />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                        Yearly
                    </span>
                    {isYearly && (
                        <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-full font-medium animate-scale-in">
                            Save up to 18%
                        </span>
                    )}
                </div>

                {/* Plan cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {plans.map((plan, idx) => {
                        const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                        const period = isYearly ? '/year' : '/month';

                        return (
                            <div
                                key={plan.id}
                                className={`relative group rounded-2xl border p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular
                                        ? 'bg-gradient-to-b from-blue-500/10 to-gray-800/80 border-blue-500/40 shadow-lg shadow-blue-500/10 md:scale-105'
                                        : 'bg-gray-800/50 border-gray-700/60 hover:border-gray-600 hover:shadow-blue-500/5'
                                    }`}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                {/* Popular badge */}
                                {plan.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/25">
                                            <Star className="h-3 w-3 fill-white" />
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold tracking-tight">
                                        {formatNaira(price)}
                                    </span>
                                    <span className="text-gray-400 text-sm ml-1">{period}</span>
                                    {isYearly && (
                                        <p className="text-green-400 text-sm font-medium mt-1 animate-fade-in">
                                            Save {formatNaira(plan.yearlySavings)}
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-300">
                                            <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => handleChoose(plan.id)}
                                    className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${plan.popular
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                        }`}
                                >
                                    Choose {plan.name}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom note */}
                <p className="text-center text-gray-500 text-sm mt-12">
                    All plans include a <span className="text-gray-300 font-medium">5-message free trial</span>. No credit card required to start.
                </p>
            </div>
        </div>
    );
}
