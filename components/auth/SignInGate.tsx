"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SignInGateProps {
  onAuth: (user: any) => void;
}

export default function SignInGate({ onAuth }: SignInGateProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        onAuth(data.session.user);
      }
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        onAuth(session.user);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [onAuth]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) setError(error.message); else setSent(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Checking auth...</div>;
  if (user) return null; // Gate passes; parent renders payment UI

  return (
    <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-xl p-8">
      <h2 className="text-xl font-bold text-white mb-2">Sign In to Continue</h2>
      <p className="text-sm text-gray-400 mb-6">Create an account or sign in to purchase credits and start outreach.</p>
      {sent ? (
        <div className="text-green-400 text-sm">Magic link sent! Check your email to finish signing in.</div>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <button
            type="submit"
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
          >
            Send Magic Link
          </button>
        </form>
      )}
    </div>
  );
}