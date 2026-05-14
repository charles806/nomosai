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
    Star,
    ArrowRight,
} from 'lucide-react';

/* ─── Scroll Reveal Hook ─── */
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

/* ─── FAQ Data ─── */
const faqs = [
    {
        q: 'What is Legal Gee?',
        a: 'Legal Gee is an AI-powered legal assistant that provides comprehensive legal analysis, case citations, constitutional provisions, and practical legal guidance across multiple jurisdictions worldwide.',
    },
    {
        q: 'How accurate is the AI?',
        a: 'Legal Gee is built on advanced AI models fine-tuned for legal analysis. While it provides highly informed guidance, it is designed to assist — not replace — qualified legal professionals. Always verify critical legal advice with a licensed attorney.',
    },
    {
        q: 'What jurisdictions do you cover?',
        a: 'Legal Gee covers a wide range of jurisdictions including Nigerian law, UK common law, US federal and state law, EU regulations, and international law principles. Coverage is continuously expanding.',
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

/* ─── Testimonials ─── */
const testimonials = [
    {
        quote: 'Legal Gee has transformed how I approach legal research. What used to take hours now takes minutes.',
        name: 'Adebayo Ogunlesi',
        role: 'Corporate Attorney, Lagos',
    },
    {
        quote: 'The constitutional analysis feature is incredibly detailed. It\'s like having a senior counsel available 24/7.',
        name: 'Sarah Nnamdi',
        role: 'Legal Consultant, Abuja',
    },
    {
        quote: 'I use Legal Gee daily for contract reviews. It catches issues I would have missed. Truly invaluable.',
        name: 'Chinedu Okafor',
        role: 'In-House Counsel, Enugu',
    },
];

/* ─── Feature Cards ─── */
const features = [
    {
        icon: Search,
        title: 'Legal Research',
        desc: 'Instantly search and analyze case law, statutes, and legal principles from multiple jurisdictions.',
    },
    {
        icon: FileText,
        title: 'Case Analysis',
        desc: 'Get detailed breakdowns of legal cases with relevant precedents, holdings, and practical implications.',
    },
    {
        icon: BookOpen,
        title: 'Contract Review',
        desc: 'Upload contracts for AI-powered clause analysis, risk identification, and improvement suggestions.',
    },
    {
        icon: Shield,
        title: 'Constitutional Advisory',
        desc: 'Navigate constitutional provisions with precision — fundamental rights, government powers, and amendments.',
    },
];

/* ─── FAQ Accordion Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-700/60 rounded-xl overflow-hidden transition-colors hover:border-gray-600">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
            >
                <span className="font-semibold text-white pr-4">{q}</span>
                <ChevronDown
                    className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="px-6 pb-5 text-gray-400 leading-relaxed">{a}</p>
            </div>
        </div>
    );
}

/* ─── Landing Page ─── */
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
            {/* ── HEADER ── */}
            <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                            <Scale className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">Legal Gee</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/register"
                            className="text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/pricing"
                            className="text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            Pricing
                        </Link>
                        <button
                            onClick={() => scrollTo('footer')}
                            className="text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            Contact
                        </button>
                        <Link
                            to="/login"
                            className="text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                        >
                            Get Started Free
                        </Link>
                    </nav>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                        onClick={() => setMobileNav(!mobileNav)}
                    >
                        {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile nav dropdown */}
                {mobileNav && (
                    <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-lg animate-fade-in">
                        <nav className="flex flex-col px-6 py-4 gap-3">
                            <Link to="/register" onClick={() => setMobileNav(false)} className="py-2 text-gray-300 hover:text-white">
                                Get Started
                            </Link>
                            <Link to="/pricing" onClick={() => setMobileNav(false)} className="py-2 text-gray-300 hover:text-white">
                                Pricing
                            </Link>
                            <button onClick={() => scrollTo('footer')} className="py-2 text-left text-gray-300 hover:text-white">
                                Contact
                            </button>
                            <Link to="/login" onClick={() => setMobileNav(false)} className="py-2 text-gray-300 hover:text-white">
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileNav(false)}
                                className="bg-blue-600 text-white text-center font-medium py-2.5 rounded-lg mt-2"
                            >
                                Get Started Free
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* ── HERO ── */}
            <section
                ref={heroRef}
                className="reveal relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-32 lg:pb-36 text-center"
            >
                {/* Glow */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
                    <Star className="h-4 w-4" />
                    AI-Powered Legal Intelligence
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                    Your AI-Powered{' '}
                    <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-green-400 bg-clip-text text-transparent">
                        Legal Assistant
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
                    Get instant legal research, case analysis, contract reviews, and constitutional
                    advisory — powered by cutting-edge AI, available 24/7.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/register"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl text-base hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2"
                    >
                        Get Started Free
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                        to="/pricing"
                        className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-8 py-3.5 rounded-xl text-base hover:bg-gray-800/50 transition-all duration-200"
                    >
                        View Pricing
                    </Link>
                </div>
            </section>

            {/* ── ABOUT US ── */}
            <section ref={aboutRef} className="reveal max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                    About <span className="text-blue-400">Legal Gee</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
                    Legal Gee is a super-intelligent global legal assistant that delivers direct, comprehensive
                    legal analysis. Built for lawyers, law students, and businesses, it draws on worldwide
                    case law, constitutional provisions, and legal doctrines to help you make informed decisions
                    — faster than ever before.
                </p>
            </section>

            {/* ── FEATURES ── */}
            <section ref={featRef} className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                    What We Offer
                </h2>
                <p className="text-gray-400 text-center mb-14 max-w-2xl mx-auto">
                    Powerful AI tools designed specifically for legal professionals
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-stagger">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="group bg-gray-800/50 border border-gray-700/60 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/40 transition-all duration-300"
                        >
                            <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-5 group-hover:bg-blue-500/20 transition-colors">
                                <f.icon className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section ref={testRef} className="reveal bg-gray-800/30 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        What Our Users Say
                    </h2>
                    <p className="text-gray-400 text-center mb-14 max-w-2xl mx-auto">
                        Trusted by legal professionals across the country
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 reveal-stagger">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-6 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-300 italic leading-relaxed mb-6">"{t.quote}"</p>
                                <div>
                                    <p className="font-semibold text-white">{t.name}</p>
                                    <p className="text-sm text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section ref={faqRef} className="reveal max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                    Frequently Asked Questions
                </h2>
                <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
                    Everything you need to know about Legal Gee
                </p>

                <div className="space-y-3">
                    {faqs.map((f) => (
                        <FAQItem key={f.q} q={f.q} a={f.a} />
                    ))}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer id="footer" ref={footRef} className="reveal border-t border-gray-800 bg-gray-900/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                    <Scale className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold">Legal Gee</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                AI-powered legal intelligence for modern professionals. Research, analyze,
                                and advise — all in one place.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
                            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for legal AI news and updates.</p>
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
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 px-4 rounded-r-lg transition-colors"
                                >
                                    <Send className="h-4 w-4 text-white" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Legal Gee. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="LinkedIn">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Instagram">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
