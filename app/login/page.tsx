'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError('✅ Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your Vanta account</p>
        </div>

        <form onSubmit={magicLinkMode ? handleMagicLink : handleLogin} className="mt-8 space-y-6 bg-gray-900/50 p-8 rounded-lg border border-white/10">
          {error && (
            <div className={`p-3 rounded text-sm ${error.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>

          {!magicLinkMode && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : magicLinkMode ? 'Send Magic Link' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setMagicLinkMode(!magicLinkMode)}
            className="w-full text-sm text-gray-400 hover:text-white transition"
          >
            {magicLinkMode ? 'Use password instead' : 'Or sign in with magic link'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </Link>
          </div>

          {!magicLinkMode && (
            <div className="text-center">
              <Link href="/reset-password" className="text-sm text-gray-400 hover:text-white transition">
                Forgot your password?
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
