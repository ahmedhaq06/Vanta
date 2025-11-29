import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

const RESEND_WEBHOOK_SECRET = 'whsec_PAEm/XeEWank1TZ8x/0fyvm529yZ2tS6';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();
  
  try {
    // Verify webhook signature
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const webhookId = req.headers.get('svix-id');
    
    const body = await req.text();
    
    // Verify signature if provided
    if (signature && timestamp && webhookId) {
      const signedPayload = `${webhookId}.${timestamp}.${body}`;
      const expectedSignature = crypto
        .createHmac('sha256', RESEND_WEBHOOK_SECRET.split('_')[1])
        .update(signedPayload)
        .digest('base64');
      
      const signatures = signature.split(' ');
      const isValid = signatures.some(sig => {
        const [, hash] = sig.split(',');
        return hash === expectedSignature;
      });
      
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    const event = JSON.parse(body);
    
    console.log('📨 Resend webhook received:', event.type);

    switch (event.type) {
      case 'email.delivered':
        console.log('✅ Email delivered to:', event.data.to);
        await supabase
          .from('leads')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('email', event.data.to);
        break;

      case 'email.opened':
        console.log('👀 Email opened by:', event.data.to);
        
        // Update lead
        const { data: lead } = await supabase
          .from('leads')
          .update({ 
            opened_at: new Date().toISOString(),
            status: 'opened'
          })
          .eq('email', event.data.to)
          .select('campaign_id')
          .single();

        // Increment campaign counter
        if (lead?.campaign_id) {
          await supabase.rpc('increment_campaign_opened', {
            campaign_id: lead.campaign_id
          });
        }
        break;

      case 'email.clicked':
        console.log('🖱️ Email link clicked by:', event.data.to);
        
        // Update lead
        const { data: clickedLead } = await supabase
          .from('leads')
          .update({ 
            clicked_at: new Date().toISOString(),
            status: 'clicked'
          })
          .eq('email', event.data.to)
          .select('campaign_id')
          .single();

        // Increment campaign counter
        if (clickedLead?.campaign_id) {
          await supabase.rpc('increment_campaign_clicked', {
            campaign_id: clickedLead.campaign_id
          });
        }
        break;

      case 'email.bounced':
        console.log('⚠️ Email bounced for:', event.data.to);
        await supabase
          .from('leads')
          .update({ 
            status: 'failed',
            error_message: `Email bounced: ${event.data.bounce?.type || 'unknown'}`
          })
          .eq('email', event.data.to);
        break;

      case 'email.complained':
        console.log('🚫 Email marked as spam by:', event.data.to);
        await supabase
          .from('leads')
          .update({ 
            status: 'failed',
            error_message: 'Marked as spam by recipient'
          })
          .eq('email', event.data.to);
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
