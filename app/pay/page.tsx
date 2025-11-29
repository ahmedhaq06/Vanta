"use client";
import SignInGate from '@/components/auth/SignInGate';
import InitialPurchase from '@/components/payments/InitialPurchase';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function PayPage({ searchParams }: { searchParams: { [k: string]: string | undefined } }) {
  const type = searchParams?.type === 'meeting' ? 'meeting' : 'initial';
  const meetings = searchParams?.count ? parseInt(searchParams.count) || 1 : 1;
  const [authedUser, setAuthedUser] = useState<any>(null);

  // We gate auth client-side; server just renders shell.
  return (
    <main className="min-h-screen bg-black p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">{type === 'meeting' ? 'Complete Meeting Payment' : 'Get Started'}</h1>
        <p className="text-gray-400 text-sm mb-8">
          {type === 'meeting' ? 'Finalize payment for your booked meetings.' : 'Pay a $2 test fee to unlock 500 lead credits and start outreach.'}
        </p>
        {/* Sign-in gate: shows auth form until user authenticated */}
        {!authedUser && (
          <div className="mb-10">
            <SignInGate onAuth={(u) => setAuthedUser(u)} />
          </div>
        )}
        {/* Show payment only after authentication */}
        {authedUser && (
          <div className="mt-2">
            <InitialPurchase meetingMode={type==='meeting'} meetings={meetings} onSuccess={() => {
              if (typeof window !== 'undefined') {
                alert('Payment successful! You are ready to start outreach.');
                window.location.href = '/dashboard';
              }
            }} />
          </div>
        )}
        <div className="mt-12 text-xs text-gray-600">
          Secure payments processed via PayPal. You will only be charged now for the selected option.
        </div>
      </div>
    </main>
  );
}