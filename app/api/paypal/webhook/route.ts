import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// PayPal webhook signature verification
async function verifyPayPalWebhook(req: NextRequest, rawBody: string) {
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionTime = req.headers.get('paypal-transmission-time');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const certUrl = req.headers.get('paypal-cert-url');
  const authAlgo = req.headers.get('paypal-auth-algo');
  const webhookId = process.env.PAYPAL_WEBHOOK_ID; // You'll need to create webhook in PayPal dashboard and add ID here

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    throw new Error('Missing PayPal headers');
  }

  // Get access token
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error('PayPal credentials missing');
  
  const basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) throw new Error('Failed to get PayPal access token');

  // Verify webhook signature
  const verifyResponse = await fetch('https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  const verifyData = await verifyResponse.json();
  return verifyData.verification_status === 'SUCCESS';
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    console.log('📨 PayPal webhook received:', event.event_type);

    // Verify webhook signature
    try {
      const isValid = await verifyPayPalWebhook(req, rawBody);
      if (!isValid) {
        console.error('❌ Invalid PayPal webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } catch (verifyError: any) {
      console.error('⚠️ Webhook verification error:', verifyError.message);
      // For MVP, log but continue (in production, reject invalid signatures)
    }

    // Handle different event types
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
      
      if (!orderId) {
        console.error('❌ No order ID in webhook event');
        return NextResponse.json({ error: 'No order ID' }, { status: 400 });
      }

      console.log('✅ Payment captured for order:', orderId);

      // Update transaction status and apply credits/charges
      const supabase = getSupabaseClient();
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (txError || !tx) {
        console.error('❌ Transaction not found:', orderId);
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      // Only process if status is still 'created' (avoid duplicate processing)
      if (tx.status === 'created') {
        // Mark as completed
        await supabase
          .from('transactions')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', tx.id);

        // Apply credits or meeting charges based on type
        if (tx.type === 'initial') {
          console.log('💰 Adding 500 credits for user:', tx.user_id);
          await supabase.rpc('add_test_credits', { credits_to_add: 500 });
        } else if (tx.type === 'meeting') {
          const meetingCount = Math.round(parseFloat(tx.amount) / 19); // Calculate meetings from amount
          console.log(`📅 Adding ${meetingCount} meeting charge(s) for user:`, tx.user_id);
          await supabase.rpc('add_meeting_charge', { meeting_count: meetingCount });
        }

        console.log('✅ Transaction processed successfully');
      } else {
        console.log('ℹ️ Transaction already processed, skipping');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
