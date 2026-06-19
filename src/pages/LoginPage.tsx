import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
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
                .fade-up { opacity: 0; transform: translateY(14px); animation: fadeUp 0.6s ease forwards; }
                @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
                @media (prefers-reduced-motion: reduce) {
                    .fade-up { opacity: 1; transform: none; animation: none; }
                }
            `}</style>

            <div className="w-full max-w-md fade-up">
                <div className="relative seal-corner border border-[#2a3142] bg-[#0f1420] rounded-sm p-8 sm:p-10">
                    {/* Logo */}
                    <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
                        <div className="flex items-center justify-center h-9 w-9 rounded-md border border-[#c9a961]/40 bg-[#c9a961]/5">
                            <Scale className="h-4.5 w-4.5 text-[#c9a961]" />
                        </div>
                        <span className="text-lg font-serif font-semibold tracking-wide">NOMOS AI</span>
                    </Link>

                    <p className="text-[10px] text-center tracking-[0.25em] uppercase text-[#c9a961] mb-4">
                        Welcome Back
                    </p>
                    <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f2f0ea] text-center mb-2.5">
                        Sign in to counsel
                    </h1>
                    <p className="text-[#8b92a8] text-center text-sm mb-8 leading-relaxed">
                        Continue with your NOMOS AI account
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium tracking-wide text-[#7a8094] uppercase mb-2">
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-[#0a0e1a] border border-[#2a3142] rounded px-4 py-3 text-[#e8e6e0] placeholder-[#5a6178] focus:outline-none focus:border-[#c9a961] transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium tracking-wide text-[#7a8094] uppercase mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0a0e1a] border border-[#2a3142] rounded px-4 py-3 text-[#e8e6e0] placeholder-[#5a6178] focus:outline-none focus:border-[#c9a961] transition-colors"
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
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 bg-[#c9a961]/5 border border-red-500/30 rounded p-3">
                                <AlertCircle size={17} className="text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#c9a961] hover:bg-[#d8ba78] disabled:opacity-50 text-[#0a0e1a] font-semibold py-3 rounded transition-colors duration-200 flex items-center justify-center gap-2.5"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a] rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Switch to register */}
                    <div className="mt-7 border-t border-[#1a2030] pt-6">
                        <p className="text-center text-[#7a8094] text-sm">
                            Don't have an account?
                            <Link
                                to="/register"
                                className="text-[#c9a961] hover:text-[#d8ba78] font-medium ml-2 transition-colors"
                            >
                                Sign Up
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