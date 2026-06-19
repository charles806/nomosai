import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/* --- Scroll Reveal Hook (matches landing page) --- */
function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    obs.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

const plans = [
    {
        id: 'basic',
        mark: '§ 01',
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
        mark: '§ 02',
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
        mark: '§ 03',
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

    const titleRef = useReveal();
    const toggleRef = useReveal();
    const cardsRef = useReveal();
    const noteRef = useReveal();

    const handleChoose = (planId: string) => {
        const billing = isYearly ? 'yearly' : 'monthly';
        if (user) {
            navigate(`/payment?plan=${planId}&billing=${billing}`);
        } else {
            navigate(`/register?plan=${planId}&billing=${billing}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-[#e8e6e0] font-sans antialiased">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&display=swap');
                .font-serif { font-family: 'Source Serif 4', Georgia, serif; }
                .font-sans { font-family: 'Inter', system-ui, sans-serif; }
                .reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; }
                .reveal.visible { opacity: 1; transform: translateY(0); }
                @media (prefers-reduced-motion: reduce) {
                    .reveal { opacity: 1; transform: none; transition: none; }
                }
                .seal-corner::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 28px; height: 28px;
                    border-top: 1.5px solid #c9a961;
                    border-left: 1.5px solid #c9a961;
                }
                .seal-corner::after {
                    content: '';
                    position: absolute;
                    bottom: 0; right: 0;
                    width: 28px; height: 28px;
                    border-bottom: 1.5px solid #c9a961;
                    border-right: 1.5px solid #c9a961;
                }
                .gold-gradient {
                    background: linear-gradient(135deg, #e0bd7d 0%, #c9a961 45%, #9c7d3f 100%);
                }
                .orb {
                    position: absolute;
                    border-radius: 9999px;
                    filter: blur(90px);
                    pointer-events: none;
                }
            `}</style>

            {/* -- AMBIENT GRADIENT ORBS -- */}
            <div className="relative">
                <div className="orb w-[420px] h-[420px] -top-40 -right-32 bg-gradient-to-br from-[#c9a961]/25 via-[#c9a961]/10 to-transparent" />
                <div className="orb w-[360px] h-[360px] top-[420px] -left-40 bg-gradient-to-tr from-[#4a5a8a]/20 via-[#2a3a6a]/10 to-transparent" />
                <div className="orb w-[300px] h-[300px] bottom-0 right-1/4 bg-gradient-to-t from-[#c9a961]/15 to-transparent" />
            </div>

            {/* -- HEADER -- */}
            <header className="sticky top-0 z-40 bg-[#0a0e1a]/90 backdrop-blur-lg border-b border-[#1a2030]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="relative flex items-center justify-center h-9 w-9 rounded-full gold-gradient shadow-lg shadow-[#c9a961]/20 group-hover:shadow-[#c9a961]/40 transition-shadow">
                            <Scale className="h-4.5 w-4.5 text-[#0a0e1a]" strokeWidth={2} />
                        </div>
                        <span className="text-lg font-serif font-semibold tracking-wide">NOMOS AI</span>
                    </Link>
                    <Link
                        to="/"
                        className="text-sm text-[#8b92a8] hover:text-[#e8e6e0] flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                </div>
            </header>

            {/* -- MAIN -- */}
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                {/* Title */}
                <div ref={titleRef} className="reveal text-center mb-14">
                    <div className="inline-flex items-center gap-2 text-[#c9a961] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                        <span className="h-px w-8 bg-[#c9a961]" />
                        Plans &amp; Pricing
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight mb-5 text-[#f2f0ea]">
                        Counsel, at every tier.
                    </h1>
                    <p className="text-[#8b92a8] text-lg max-w-xl mx-auto leading-relaxed">
                        Flexible terms for every legal professional. Begin with a free trial,
                        upgrade whenever your practice requires it.
                    </p>
                </div>

                {/* Billing toggle */}
                <div ref={toggleRef} className="reveal flex items-center justify-center gap-4 mb-16">
                    <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-[#e8e6e0]' : 'text-[#5a6178]'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="relative w-14 h-7 rounded-full bg-[#0f1420] border border-[#2a3142] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a961]"
                        aria-label="Toggle billing period"
                    >
                        <div
                            className={`absolute top-0.5 w-6 h-6 rounded-full gold-gradient shadow-md shadow-[#c9a961]/30 transition-all duration-300 ${
                                isYearly ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'
                            }`}
                        />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-[#e8e6e0]' : 'text-[#5a6178]'}`}>
                        Yearly
                    </span>
                    {isYearly && (
                        <span className="text-xs text-[#0a0e1a] gold-gradient px-3 py-1 rounded-full font-semibold tracking-wide shadow-md shadow-[#c9a961]/25">
                            Save up to 18%
                        </span>
                    )}
                </div>

                {/* Plan cards */}
                <div ref={cardsRef} className="reveal grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                        const period = isYearly ? '/year' : '/month';

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col p-8 lg:p-9 rounded-3xl transition-all duration-300 ${
                                    plan.popular
                                        ? 'bg-gradient-to-b from-[#1a2030] to-[#0f1420] border border-[#c9a961]/40 shadow-2xl shadow-[#c9a961]/10 md:scale-105'
                                        : 'bg-[#0f1420]/60 border border-[#1a2030] hover:border-[#2a3142] hover:-translate-y-1'
                                }`}
                            >
                                {plan.popular && (
                                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 gold-gradient text-[#0a0e1a] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#c9a961]/30 tracking-wide">
                                        Most Chosen
                                    </span>
                                )}

                                <p className="text-[#c9a961]/70 font-serif text-sm mb-5">{plan.mark}</p>
                                <h3 className="font-serif text-xl font-semibold text-[#e8e6e0] mb-6">{plan.name}</h3>

                                {/* Price */}
                                <div className="mb-8">
                                    <span className="font-serif text-4xl font-semibold text-[#f2f0ea]">
                                        {formatNaira(price)}
                                    </span>
                                    <span className="text-[#7a8094] text-sm ml-1">{period}</span>
                                    {isYearly && (
                                        <p className="text-[#c9a961] text-sm font-medium mt-2">
                                            Save {formatNaira(plan.yearlySavings)}
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-9 flex-1">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-2.5 text-sm text-[#8b92a8] leading-relaxed">
                                            <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-[#c9a961]/15 flex-shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-[#c9a961]" strokeWidth={2.5} />
                                            </span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => handleChoose(plan.id)}
                                    className={`w-full font-semibold py-3.5 rounded-full transition-all duration-200 hover:scale-[1.02] ${
                                        plan.popular
                                            ? 'gold-gradient text-[#0a0e1a] shadow-lg shadow-[#c9a961]/25 hover:shadow-xl hover:shadow-[#c9a961]/35'
                                            : 'border border-[#2a3142] hover:border-[#c9a961]/60 text-[#e8e6e0]'
                                    }`}
                                >
                                    Choose {plan.name}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom note */}
                <p ref={noteRef} className="reveal text-center text-[#5a6178] text-sm mt-14">
                    All plans include a <span className="text-[#8b92a8] font-medium">5-message free trial</span>. No credit card required to start.
                </p>
            </div>
        </div>
    );
}