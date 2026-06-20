import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Scale,
    Search,
    FileText,
    BookOpen,
    Shield,
    ChevronDown,
    Menu,
    X,
    Send,
    ArrowRight,
    Quote,
} from 'lucide-react';

/* --- Scroll Reveal Hook --- */
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

/* --- FAQ Data --- */
const faqs = [
    {
        q: 'What is NOMOS AI?',
        a: 'NOMOS AI is an AI-powered legal assistant that provides comprehensive legal analysis, case citations, constitutional provisions, and practical legal guidance across multiple jurisdictions worldwide.',
    },
    {
        q: 'How accurate is the AI?',
        a: 'NOMOS AI is built on advanced AI models fine-tuned for legal analysis. While it provides highly informed guidance, it is designed to assist - not replace - qualified legal professionals. Always verify critical legal advice with a licensed attorney.',
    },
    {
        q: 'What jurisdictions do you cover?',
        a: 'NOMOS AI covers a wide range of jurisdictions including Nigerian law, UK common law, US federal and state law, EU regulations, and international law principles. Coverage is continuously expanding.',
    },
    {
        q: 'Is my data secure?',
        a: 'Absolutely. All conversations are encrypted in transit and at rest. We use Supabase for authentication and data storage, ensuring enterprise-grade security. Your legal queries are never shared with third parties.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. All subscription plans can be cancelled at any time. You will retain access until the end of your current billing period.',
    },
];

/* --- Testimonials --- */
const testimonials = [
    {
        quote: 'NOMOS AI has transformed how I approach legal research. What used to take hours now takes minutes.',
        name: 'Adebayo Ogunlesi',
        role: 'Corporate Attorney, Lagos',
    },
    {
        quote: "The constitutional analysis feature is incredibly detailed. It's like having a senior counsel available 24/7.",
        name: 'Sarah Nnamdi',
        role: 'Legal Consultant, Abuja',
    },
    {
        quote: 'I use NOMOS AI daily for contract reviews. It catches issues I would have missed. Truly invaluable.',
        name: 'Chinedu Okafor',
        role: 'In-House Counsel, Enugu',
    },
];

/* --- Feature Cards --- */
const features = [
    {
        icon: Search,
        mark: '§ 01',
        title: 'Legal Research',
        desc: 'Instantly search and analyze case law, statutes, and legal principles from multiple jurisdictions.',
    },
    {
        icon: FileText,
        mark: '§ 02',
        title: 'Case Analysis',
        desc: 'Get detailed breakdowns of legal cases with relevant precedents, holdings, and practical implications.',
    },
    {
        icon: BookOpen,
        mark: '§ 03',
        title: 'Contract Review',
        desc: 'Upload contracts for AI-powered clause analysis, risk identification, and improvement suggestions.',
    },
    {
        icon: Shield,
        mark: '§ 04',
        title: 'Constitutional Advisory',
        desc: 'Navigate constitutional provisions with precision — fundamental rights, government powers, and amendments.',
    },
];

/* --- FAQ Accordion Item --- */
function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-[#2a3142] last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 py-6 text-left group"
            >
                <span className="font-serif text-[17px] sm:text-lg text-[#e8e6e0] pr-4 group-hover:text-[#c9a961] transition-colors">
                    {q}
                </span>
                <ChevronDown
                    className={`h-4.5 w-4.5 text-[#7a8094] flex-shrink-0 transition-transform duration-300 ${
                        open ? 'rotate-180 text-[#c9a961]' : ''
                    }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    open ? 'max-h-60 opacity-100 pb-6' : 'max-h-0 opacity-0'
                }`}
            >
                <p className="text-[#8b92a8] leading-relaxed pr-8">{a}</p>
            </div>
        </div>
    );
}

/* --- Landing Page --- */
export default function LandingPage() {
    const [mobileNav, setMobileNav] = useState(false);
    const [email, setEmail] = useState('');

    const heroRef = useReveal();
    const aboutRef = useReveal();
    const featRef = useReveal();
    const testRef = useReveal();
    const faqRef = useReveal();
    const footRef = useReveal();

    const scrollTo = (id: string) => {
        setMobileNav(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-[#e8e6e0] overflow-x-hidden overflow-y-auto font-sans antialiased">
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
            `}</style>

            {/* -- HEADER -- */}
            <header className="sticky top-0 z-40 bg-[#0a0e1a]/90 backdrop-blur-lg border-b border-[#1a2030]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md border border-[#c9a961]/40 bg-[#c9a961]/5 group-hover:border-[#c9a961] transition-colors">
                            <Scale className="h-4 w-4 text-[#c9a961]" />
                        </div>
                        <span className="text-lg font-serif font-semibold tracking-wide">NOMOS AI</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/register" className="text-sm text-[#8b92a8] hover:text-[#e8e6e0] transition-colors">
                            Get Started
                        </Link>
                        <Link to="/pricing" className="text-sm text-[#8b92a8] hover:text-[#e8e6e0] transition-colors">
                            Pricing
                        </Link>
                        <button onClick={() => scrollTo('footer')} className="text-sm text-[#8b92a8] hover:text-[#e8e6e0] transition-colors">
                            Contact
                        </button>
                        <Link to="/login" className="text-sm text-[#8b92a8] hover:text-[#e8e6e0] transition-colors">
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="border border-[#c9a961] text-[#c9a961] hover:bg-[#c9a961] hover:text-[#0a0e1a] text-sm font-medium px-5 py-2 rounded transition-all duration-200"
                        >
                            Get Started Free
                        </Link>
                    </nav>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 text-[#8b92a8] hover:text-[#e8e6e0]"
                        onClick={() => setMobileNav(!mobileNav)}
                        aria-label="Toggle navigation"
                    >
                        {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile nav dropdown */}
                {mobileNav && (
                    <div className="md:hidden border-t border-[#1a2030] bg-[#0a0e1a]/98 backdrop-blur-lg">
                        <nav className="flex flex-col px-6 py-4 gap-1">
                            <Link to="/register" onClick={() => setMobileNav(false)} className="py-2.5 text-[#8b92a8] hover:text-[#e8e6e0]">
                                Get Started
                            </Link>
                            <Link to="/pricing" onClick={() => setMobileNav(false)} className="py-2.5 text-[#8b92a8] hover:text-[#e8e6e0]">
                                Pricing
                            </Link>
                            <button onClick={() => scrollTo('footer')} className="py-2.5 text-left text-[#8b92a8] hover:text-[#e8e6e0]">
                                Contact
                            </button>
                            <Link to="/login" onClick={() => setMobileNav(false)} className="py-2.5 text-[#8b92a8] hover:text-[#e8e6e0]">
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileNav(false)}
                                className="border border-[#c9a961] text-[#c9a961] text-center font-medium py-2.5 rounded mt-2"
                            >
                                Get Started Free
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* -- HERO -- */}
            <section
                ref={heroRef}
                className="reveal relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32"
            >
                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
                    {/* Left: copy */}
                    <div>
                        <div className="inline-flex items-center gap-2 text-[#c9a961] text-xs font-semibold tracking-[0.2em] uppercase mb-7">
                            <span className="h-px w-8 bg-[#c9a961]" />
                            AI-Powered Legal Intelligence
                        </div>

                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.1] mb-7 text-[#f2f0ea]">
                            Counsel,<br />on every question.
                        </h1>

                        <p className="max-w-xl text-lg text-[#8b92a8] mb-10 leading-relaxed">
                            Instant legal research, case analysis, contract review, and constitutional
                            advisory — reasoned like a senior counsel, available at any hour.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Link
                                to="/register"
                                className="bg-[#c9a961] hover:bg-[#d8ba78] text-[#0a0e1a] font-semibold px-7 py-3.5 rounded text-base transition-all duration-200 flex items-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/pricing"
                                className="border border-[#2a3142] hover:border-[#8b92a8] text-[#e8e6e0] font-medium px-7 py-3.5 rounded text-base transition-all duration-200"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>

                    {/* Right: statute-page panel (signature element) */}
                    <div className="relative seal-corner border border-[#2a3142] bg-[#0f1420] rounded-sm p-8 lg:p-10">
                        <p className="text-[10px] tracking-[0.25em] uppercase text-[#c9a961] mb-6">
                            Sample Inquiry
                        </p>
                        <p className="font-serif text-[#e8e6e0] text-base leading-relaxed mb-6">
                            "What remedies are available for a breach of contract under Nigerian law?"
                        </p>
                        <div className="h-px bg-[#1a2030] mb-6" />
                        <p className="text-xs tracking-[0.15em] uppercase text-[#7a8094] mb-3">NOMOS AI Responds</p>
                        <ul className="space-y-2.5 text-sm text-[#8b92a8] leading-relaxed">
                            <li className="flex gap-2.5">
                                <span className="text-[#c9a961] font-serif">§</span>
                                Damages — compensatory, consequential, and liquidated
                            </li>
                            <li className="flex gap-2.5">
                                <span className="text-[#c9a961] font-serif">§</span>
                                Specific performance, where damages are inadequate
                            </li>
                            <li className="flex gap-2.5">
                                <span className="text-[#c9a961] font-serif">§</span>
                                Rescission and restitution to the original position
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* -- ABOUT US -- */}
            <section ref={aboutRef} className="reveal border-t border-[#1a2030]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <p className="text-[#c9a961] text-xs font-semibold tracking-[0.2em] uppercase mb-5">About</p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-7 text-[#f2f0ea]">
                        Built for the practice of law
                    </h2>
                    <p className="text-[#8b92a8] text-lg leading-relaxed max-w-2xl mx-auto">
                        NOMOS AI is a global legal assistant that delivers direct, comprehensive
                        analysis for lawyers, law students, and businesses. It draws on worldwide
                        case law, constitutional provisions, and legal doctrine to help you decide
                        with confidence — faster than ever before.
                    </p>
                </div>
            </section>

            {/* -- FEATURES -- */}
            <section ref={featRef} className="reveal border-t border-[#1a2030]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center mb-16">
                        <p className="text-[#c9a961] text-xs font-semibold tracking-[0.2em] uppercase mb-5">What We Offer</p>
                        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#f2f0ea]">
                            Four ways NOMOS works for you
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a2030] border border-[#1a2030]">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group bg-[#0a0e1a] hover:bg-[#0f1420] p-8 transition-colors duration-300"
                            >
                                <p className="text-[#c9a961]/70 font-serif text-sm mb-6">{f.mark}</p>
                                <f.icon className="h-5 w-5 text-[#c9a961] mb-5" strokeWidth={1.5} />
                                <h3 className="font-serif text-lg font-semibold text-[#e8e6e0] mb-2.5">{f.title}</h3>
                                <p className="text-[#8b92a8] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* -- TESTIMONIALS -- */}
            <section ref={testRef} className="reveal border-t border-[#1a2030] bg-[#0f1420]/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center mb-16">
                        <p className="text-[#c9a961] text-xs font-semibold tracking-[0.2em] uppercase mb-5">Testimony</p>
                        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#f2f0ea]">
                            Trusted by legal professionals
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t) => (
                            <div key={t.name} className="flex flex-col">
                                <Quote className="h-6 w-6 text-[#c9a961]/50 mb-5" strokeWidth={1.5} />
                                <p className="font-serif text-[#e8e6e0] leading-relaxed mb-6 flex-1">
                                    "{t.quote}"
                                </p>
                                <div className="pt-5 border-t border-[#1a2030]">
                                    <p className="font-semibold text-sm text-[#e8e6e0]">{t.name}</p>
                                    <p className="text-sm text-[#7a8094]">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* -- FAQ -- */}
            <section ref={faqRef} className="reveal border-t border-[#1a2030]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center mb-14">
                        <p className="text-[#c9a961] text-xs font-semibold tracking-[0.2em] uppercase mb-5">FAQ</p>
                        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#f2f0ea]">
                            Frequently asked questions
                        </h2>
                    </div>

                    <div>
                        {faqs.map((f) => (
                            <FAQItem key={f.q} q={f.q} a={f.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* -- FOOTER -- */}
            <footer id="footer" ref={footRef} className="reveal border-t border-[#1a2030]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="flex items-center justify-center h-8 w-8 rounded-md border border-[#c9a961]/40 bg-[#c9a961]/5">
                                    <Scale className="h-4 w-4 text-[#c9a961]" />
                                </div>
                                <span className="text-lg font-serif font-semibold tracking-wide">NOMOS AI</span>
                            </div>
                            <p className="text-[#8b92a8] text-sm leading-relaxed">
                                AI-powered legal intelligence for modern professionals. Research, analyze,
                                and advise — all in one place.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7a8094] mb-5">Quick Links</h4>
                            <ul className="space-y-2.5 text-sm text-[#8b92a8]">
                                <li><Link to="/pricing" className="hover:text-[#e8e6e0] transition-colors">Pricing</Link></li>
                                <li><Link to="/register" className="hover:text-[#e8e6e0] transition-colors">Get Started</Link></li>
                                <li><a href="#" className="hover:text-[#e8e6e0] transition-colors">Terms &amp; Conditions</a></li>
                                <li><a href="#" className="hover:text-[#e8e6e0] transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7a8094] mb-5">Stay Updated</h4>
                            <p className="text-[#8b92a8] text-sm mb-4">Subscribe for legal AI news and product updates.</p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setEmail('');
                                }}
                                className="flex"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="flex-1 min-w-0 bg-[#0f1420] border border-[#2a3142] rounded-l px-4 py-2.5 text-sm text-[#e8e6e0] placeholder-[#5a6178] focus:outline-none focus:border-[#c9a961] transition-colors"
                                />
                                <button
                                    type="submit"
                                    aria-label="Subscribe"
                                    className="bg-[#c9a961] hover:bg-[#d8ba78] px-4 rounded-r transition-colors"
                                >
                                    <Send className="h-4 w-4 text-[#0a0e1a]" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-14 pt-8 border-t border-[#1a2030] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[#5a6178] text-sm">&copy; {new Date().getFullYear()} NOMOS AI. All rights reserved.</p>
                        <div className="flex gap-5">
                            <a href="#" className="text-[#5a6178] hover:text-[#c9a961] transition-colors" aria-label="Twitter">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a href="#" className="text-[#5a6178] hover:text-[#c9a961] transition-colors" aria-label="LinkedIn">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            <a href="#" className="text-[#5a6178] hover:text-[#c9a961] transition-colors" aria-label="Instagram">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}