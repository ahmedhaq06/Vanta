import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error('PayPal credentials missing');
  const basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  if (!data.access_token) throw new Error('Failed to get PayPal access token');
  return data.access_token;
}

export async function POST(_req: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: '{}',
    });
    const data = await response.json();
    if (!data.status || data.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'PayPal order capture failed', details: data }, { status: 500 });
    }

    // Update transaction & apply credit/meeting billing
    const supabase = getSupabaseClient();
    const { data: tx } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (tx) {
      await supabase.from('transactions').update({ status: 'completed' }).eq('id', tx.id);
      if (tx.type === 'initial') {
        // Add 500 credits: upsert into user_settings fields (assumes columns exist)
        await supabase.rpc('add_test_credits', { credits_to_add: 500 });
      } else if (tx.type === 'meeting') {
        // Increment amount due (assumes column total_amount_due exists)
        await supabase.rpc('add_meeting_charge', { meeting_count: 1 });
      }
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: 'PayPal order capture failed', details: err.message }, { status: 500 });
  }
}
