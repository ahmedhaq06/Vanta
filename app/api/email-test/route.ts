import { NextRequest, NextResponse } from 'next/server';
import { sendSingleEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const to = url.searchParams.get('to');
    const from = process.env.RESEND_FROM;
    if (!from) {
      return NextResponse.json({ success: false, error: 'RESEND_FROM not set. Please set it to an address at your verified domain (e.g., "Your Name <hello@autoconnect.info>").' }, { status: 400 });
    }
    if (!to) {
      return NextResponse.json({ success: false, error: 'Missing to query param: /api/email-test?to=recipient@example.com' }, { status: 400 });
    }

    const html = `<div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
      <h2>Resend Email Test</h2>
      <p>This is a test email sent from your verified domain using RESEND_FROM = ${from}.</p>
      <p>Time: ${new Date().toISOString()}</p>
    </div>`;

    const result = await sendSingleEmail({
      to,
      name: to.split('@')[0],
      subject: '[TEST] Resend domain verification check',
      html
    });

    return NextResponse.json({ success: true, from, to, result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
