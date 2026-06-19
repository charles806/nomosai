import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Scale, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // If user came from pricing with a plan selected
    const selectedPlan = searchParams.get('plan');
    const billingPeriod = searchParams.get('billing');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await signUp(email, password);

            if (selectedPlan) {
                navigate(`/payment?plan=${selectedPlan}&billing=${billingPeriod || 'monthly'}`);
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-[#e8e6e0] font-sans antialiased flex items-center justify-center p-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&display=swap');
                .font-serif { font-family: 'Source Serif 4', Georgia, serif; }
                .font-sans { font-family: 'Inter', system-ui, sans-serif; }
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
                .fade-up { opacity: 0; transform: translateY(14px); animation: fadeUp 0.6s ease forwards; }
                @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
                @media (prefers-reduced-motion: reduce) {
                    .fade-up { opacity: 1; transform: none; animation: none; }
                }
            `}</style>

            {/* -- AMBIENT GRADIENT ORBS -- */}
            <div className="orb w-[420px] h-[420px] -top-32 -right-24 bg-gradient-to-br from-[#c9a961]/25 via-[#c9a961]/10 to-transparent" />
            <div className="orb w-[360px] h-[360px] -bottom-32 -left-24 bg-gradient-to-tr from-[#4a5a8a]/20 via-[#2a3a6a]/10 to-transparent" />

            <div className="relative w-full max-w-md fade-up">
                <div className="relative seal-corner border border-[#2a3142] bg-[#0f1420]/90 backdrop-blur-sm rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40">
                    {/* Logo */}
                    <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full gold-gradient shadow-lg shadow-[#c9a961]/25">
                            <Scale className="h-5 w-5 text-[#0a0e1a]" strokeWidth={2} />
                        </div>
                        <span className="text-lg font-serif font-semibold tracking-wide">NOMOS AI</span>
                    </Link>

                    <p className="text-[10px] text-center tracking-[0.25em] uppercase text-[#c9a961] mb-4">
                        New Account
                    </p>
                    <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f2f0ea] text-center mb-2.5">
                        Create your account
                    </h1>
                    <p className="text-[#8b92a8] text-center text-sm mb-8 leading-relaxed">
                        {selectedPlan
                            ? `Sign up to continue with the ${selectedPlan} plan`
                            : 'Start your free trial — 5 messages on us'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium tracking-wide text-[#7a8094] uppercase mb-2">
                                Email Address
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-[#0a0e1a] border border-[#2a3142] rounded-xl px-4 py-3 text-[#e8e6e0] placeholder-[#5a6178] focus:outline-none focus:border-[#c9a961] focus:ring-1 focus:ring-[#c9a961]/40 transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium tracking-wide text-[#7a8094] uppercase mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0a0e1a] border border-[#2a3142] rounded-xl px-4 py-3 text-[#e8e6e0] placeholder-[#5a6178] focus:outline-none focus:border-[#c9a961] focus:ring-1 focus:ring-[#c9a961]/40 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-[#7a8094] hover:text-[#c9a961] transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-[#5a6178] mt-1.5">Minimum 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-medium tracking-wide text-[#7a8094] uppercase mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="register-confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full bg-[#0a0e1a] border border-[#2a3142] rounded-xl px-4 py-3 text-[#e8e6e0] placeholder-[#5a6178] focus:outline-none focus:border-[#c9a961] focus:ring-1 focus:ring-[#c9a961]/40 transition-colors"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 bg-[#c9a961]/5 border border-red-500/30 rounded-xl p-3">
                                <AlertCircle size={17} className="text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="register-submit"
                            type="submit"
                            disabled={isLoading}
                            className="w-full gold-gradient hover:brightness-110 disabled:opacity-50 text-[#0a0e1a] font-semibold py-3.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-[#c9a961]/25 hover:shadow-xl hover:shadow-[#c9a961]/35 hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a] rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Switch to login */}
                    <div className="mt-7 border-t border-[#1a2030] pt-6">
                        <p className="text-center text-[#7a8094] text-sm">
                            Already have an account?
                            <Link
                                to="/login"
                                className="text-[#c9a961] hover:text-[#d8ba78] font-medium ml-2 transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-[#5a6178] text-xs text-center mt-6 tracking-wide">
                    NOMOS AI &middot; Legal Intelligence
                </p>
            </div>
        </div>
    );
}