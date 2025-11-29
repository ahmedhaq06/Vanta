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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, numberOfMeetings = 1, userId } = body;
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    let amount = 2;
    let description = '500 Lead Credits';
    if (type === 'meeting') {
      amount = 19 * numberOfMeetings;
      description = `${numberOfMeetings} Qualified Meeting${numberOfMeetings > 1 ? 's' : ''}`;
    }

    const accessToken = await getPayPalAccessToken();
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
          description,
        },
      ],
      application_context: {
        brand_name: 'Vanta Outreach',
        user_action: 'PAY_NOW',
        return_url: 'https://yourapp.com/paypal-success',
        cancel_url: 'https://yourapp.com/paypal-cancel',
      },
    };
    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });
    const data = await response.json();
    if (!data.id) throw new Error('Failed to create PayPal order');

    // Persist transaction with status created
    const supabase = getSupabaseClient();
    await supabase.from('transactions').insert({
      user_id: userId,
      order_id: data.id,
      amount: amount.toFixed(2),
      type,
      status: 'created'
    });
    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: 'PayPal order creation failed', details: err.message }, { status: 500 });
  }
}
