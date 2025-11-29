// Ensure this API route is always executed at request time (not during build)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    return NextResponse.json({ error: 'PayPal credentials not set' }, { status: 500 });
  }

  const basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  try {
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    if (!data.access_token) {
      return NextResponse.json({ error: 'Failed to get PayPal access token' }, { status: 500 });
    }
    return NextResponse.json({ accessToken: data.access_token });
  } catch (err: any) {
    return NextResponse.json({ error: 'PayPal token fetch failed', details: err.message }, { status: 500 });
  }
}
