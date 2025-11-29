import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Follow-up email templates
const FOLLOW_UP_TEMPLATES = [
  // First follow-up (Day 3)
  {
    subject: 'Re: {{originalSubject}}',
    body: `Hi {{firstName}},

Just wanted to follow up on my previous email about {{topic}}.

I know you're probably busy, but I'd really appreciate a few minutes of your time to discuss how we could help {{companyName}} with {{value}}.

Would you be available for a quick 15-minute call this week?

Best,
{{senderName}}`
  },
  // Second follow-up (Day 8)
  {
    subject: 'Quick question for {{companyName}}',
    body: `Hi {{firstName}},

I've reached out a couple times about {{topic}}, and I wanted to try one more time.

I completely understand if the timing isn't right, but I'd hate to miss an opportunity to help {{companyName}} {{value}}.

If you're interested, just reply "yes" and I'll send over some times.

If not, no worries—I'll stop bothering you!

Best,
{{senderName}}`
  },
  // Final follow-up (Day 13)
  {
    subject: 'Should I close your file?',
    body: `Hi {{firstName}},

I've reached out a few times about {{topic}} but haven't heard back.

I completely understand—timing isn't always right.

Should I go ahead and close your file, or would you like me to check back in a few months?

Either way, thanks for your time.

Best,
{{senderName}}`
  }
];

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get leads that need follow-up
    const { data: leads, error: leadsError } = await supabase.rpc('get_leads_for_follow_up');

    if (leadsError) {
      console.error('Error fetching follow-up leads:', leadsError);
      return NextResponse.json(
        { success: false, error: leadsError.message },
        { status: 500 }
      );
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads need follow-up at this time',
        sent: 0
      });
    }

    let sentCount = 0;
    const errors = [];

    // Process each lead
    for (const lead of leads) {
      try {
        // Get campaign details
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('name, email_subject, sender_name, sender_email')
          .eq('id', lead.campaign_id)
          .single();

        if (!campaign) continue;

        // Select appropriate follow-up template based on count
        const template = FOLLOW_UP_TEMPLATES[Math.min(lead.follow_up_count, 2)];

        // Personalize email
        const subject = template.subject
          .replace('{{originalSubject}}', campaign.email_subject)
          .replace('{{companyName}}', lead.company_name || 'your company');

        const body = template.body
          .replace(/{{firstName}}/g, lead.first_name || 'there')
          .replace(/{{companyName}}/g, lead.company_name || 'your company')
          .replace(/{{topic}}/g, campaign.name)
          .replace(/{{value}}/g, 'achieve your goals')
          .replace(/{{senderName}}/g, campaign.sender_name || 'The Team');

        // Send follow-up email
        const { error: sendError } = await resend.emails.send({
          from: campaign.sender_email || 'sales@autoconnect.info',
          to: lead.email,
          subject,
          text: body,
          headers: {
            'X-Entity-Ref-ID': lead.id,
          },
        });

        if (sendError) {
          console.error(`Failed to send follow-up to ${lead.email}:`, sendError);
          errors.push({ email: lead.email, error: sendError });
          continue;
        }

        // Mark follow-up as sent
        await supabase.rpc('mark_follow_up_sent', { lead_id_param: lead.id });

        sentCount++;
      } catch (error: any) {
        console.error(`Error processing lead ${lead.email}:`, error);
        errors.push({ email: lead.email, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: leads.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Error in follow-up system:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process follow-ups' },
      { status: 500 }
    );
  }
}
