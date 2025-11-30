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
    // For Web SDK v6, the clientToken must be a JWT obtained via identity/generate-token
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/identity/generate-token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // No body required; returns { client_token: "<JWT>" }
    });
    const text = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      // If PayPal returned HTML or non-JSON, surface it for debugging
      return NextResponse.json({ error: 'Failed to parse PayPal response', status: response.status, body: text }, { status: 500 });
    }
    if (!response.ok) {
      return NextResponse.json({ error: 'PayPal token endpoint error', status: response.status, details: data }, { status: response.status });
    }
    // Validate JWT format: it should have 3 dot-separated segments
    if (!data.client_token || typeof data.client_token !== 'string' || data.client_token.split('.').length !== 3) {
      return NextResponse.json({ error: 'Failed to get valid PayPal client token', received: data }, { status: 500 });
    }
    return NextResponse.json({ clientToken: data.client_token });
  } catch (err: any) {
    return NextResponse.json({ error: 'PayPal token fetch failed', details: err.message }, { status: 500 });
  }
}
