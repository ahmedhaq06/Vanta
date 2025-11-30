"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface InitialPurchaseProps {
  meetingMode?: boolean;
  meetings?: number;
  onSuccess: () => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export default function InitialPurchase({ meetingMode = false, meetings = 1, onSuccess }: InitialPurchaseProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inject PayPal Web SDK
  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.sandbox.paypal.com/web-sdk/v6/core';
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setError('Failed to load PayPal SDK');
    document.body.appendChild(script);
  }, []);

  const startFlow = useCallback(async () => {
    setError(null);
    setStatus(null);
    setCreatingOrder(true);
    try {
      // Get browser-safe client token (simplified access token for MVP)
      const tokenRes = await fetch('/api/paypal/auth/browser-safe-client-token');
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenJson.error || 'Token error');

      const instance = await window.paypal.createInstance({
        clientToken: tokenJson.clientToken,
        components: ['paypal-payments'],
        pageType: 'checkout'
      });

      // Create order via backend
      // Get current user id
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const orderRes = await fetch('/api/paypal/checkout/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: meetingMode ? 'meeting' : 'initial', numberOfMeetings: meetings, userId })
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.error || 'Order creation failed');

      const paymentSession = instance.createPayPalOneTimePaymentSession({
        async onApprove(data: any) {
          setStatus('Capturing...');
          try {
            const capRes = await fetch(`/api/paypal/checkout/orders/${data.orderId}/capture`, { method: 'POST' });
            const capJson = await capRes.json();
            if (!capRes.ok) throw new Error(capJson.error || 'Capture failed');
            setStatus('Success');
            onSuccess();
          } catch (err: any) {
            setError(err.message);
          }
        },
        onCancel() { setStatus('Cancelled'); },
        onError(err: any) { setError(err.message || 'Payment error'); }
      });

      // Try presentation modes fallback list
      const presentationModes = ['payment-handler', 'popup', 'modal'];
      let started = false;
      for (const mode of presentationModes) {
        try {
          await paymentSession.start({ presentationMode: mode }, { orderId: orderJson.id });
          started = true;
          break;
        } catch (e: any) {
          if (!e.isRecoverable) throw e;
        }
      }
      if (!started) throw new Error('Unable to start payment session');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingOrder(false);
    }
  }, [meetingMode, meetings, onSuccess]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">{meetingMode ? 'Pay for Meetings' : 'Unlock 500 Lead Credits'}</h2>
      <p className="text-sm text-gray-400 mb-4">
        {meetingMode ? `Checkout: ${meetings} meeting${meetings>1?'s':''} × $19` : 'One-time test purchase to cover scraping costs.'}
      </p>
      {error && <div className="text-red-500 text-xs mb-3">{error}</div>}
      {status && <div className="text-indigo-400 text-xs mb-3">{status}</div>}
      <button
        onClick={startFlow}
        disabled={!sdkReady || creatingOrder}
        className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white font-medium"
      >
        {creatingOrder ? 'Starting...' : meetingMode ? `Pay $${(meetings*19).toFixed(2)}` : 'Pay $2 to Start'}
      </button>
      {!sdkReady && <div className="text-xs text-gray-500 mt-2">Loading PayPal...</div>}
    </div>
  );
}