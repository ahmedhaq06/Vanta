import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Keywords that indicate a meeting was booked
const MEETING_KEYWORDS = [
  // Affirmative responses
  'sounds good', 'works for me', 'perfect', 'see you', 'talk to you',
  'looking forward', 'confirmed', 'booked', 'scheduled', 'calendar',
  
  // Meeting time confirmations
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'tomorrow', 'next week', 'this week',
  'am', 'pm', 'noon', 'morning', 'afternoon', 'evening',
  
  // Calendar/meeting links
  'calendly', 'calendar', 'zoom', 'meet.google', 'teams.microsoft',
  'meeting link', 'join', 'invite',
  
  // Explicit confirmations
  'yes, let\'s meet', 'absolutely', 'count me in', 'i\'m available',
  'that works', 'let\'s do it', 'book it', 'set it up'
];

// Keywords that indicate interest but not a booked meeting
const INTEREST_KEYWORDS = [
  'interested', 'tell me more', 'send me', 'more information',
  'curious', 'learn more', 'sounds interesting'
];

// Auto-reply indicators (should not mark as meeting)
const AUTO_REPLY_PATTERNS = [
  'out of office', 'automatic reply', 'auto-reply', 'away from',
  'on vacation', 'currently unavailable', 'will respond when'
];

function detectMeetingBooked(emailBody: string): boolean {
  const lowerBody = emailBody.toLowerCase();
  
  // Check for auto-replies first (should return false)
  if (AUTO_REPLY_PATTERNS.some(pattern => lowerBody.includes(pattern))) {
    return false;
  }
  
  // Count meeting keyword matches
  const meetingMatches = MEETING_KEYWORDS.filter(keyword => 
    lowerBody.includes(keyword)
  ).length;
  
  // If 2+ meeting keywords found, likely a booked meeting
  if (meetingMatches >= 2) {
    return true;
  }
  
  // Single strong indicator
  const strongIndicators = [
    'see you on', 'talk to you on', 'confirmed for',
    'scheduled for', 'booked for', 'meeting is set'
  ];
  
  return strongIndicators.some(indicator => lowerBody.includes(indicator));
}

function needsFollowUp(emailBody: string, daysSinceLastEmail: number): boolean {
  const lowerBody = emailBody.toLowerCase();
  
  // Check if showing interest
  const hasInterest = INTEREST_KEYWORDS.some(keyword => lowerBody.includes(keyword));
  
  // Check if asking questions
  const hasQuestion = lowerBody.includes('?');
  
  // Follow up if interested/asking questions, or if no reply after 3 days
  if (hasInterest || hasQuestion) {
    return true;
  }
  
  // Auto follow-up after 3 days of no response
  if (daysSinceLastEmail >= 3) {
    return true;
  }
  
  return false;
}

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
    const body = await req.json();
    const { leadId, emailBody, replyDate } = body;

    if (!leadId || !emailBody) {
      return NextResponse.json(
        { success: false, error: 'Lead ID and email body are required' },
        { status: 400 }
      );
    }

    // Get lead and last email date
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*, campaign_id, last_email_sent_at')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Calculate days since last email
    const lastEmailDate = lead.last_email_sent_at ? new Date(lead.last_email_sent_at) : new Date();
    const daysSince = Math.floor((Date.now() - lastEmailDate.getTime()) / (1000 * 60 * 60 * 24));

    // Detect if meeting was booked
    const isMeetingBooked = detectMeetingBooked(emailBody);
    
    // Check if follow-up is needed
    const shouldFollowUp = needsFollowUp(emailBody, daysSince);

    let updates: any = {
      status: 'replied',
      replied_at: replyDate || new Date().toISOString(),
      reply_content: emailBody,
      updated_at: new Date().toISOString(),
    };

    // If meeting detected, mark as booked and charge $19
    if (isMeetingBooked) {
      updates.status = 'meeting_booked';
      updates.meeting_booked_at = new Date().toISOString();

      // Call RPC to add meeting charge
      const { error: rpcError } = await supabase.rpc('mark_meeting_booked');

      if (rpcError) {
        console.error('Error adding meeting charge:', rpcError);
      }
    } else if (shouldFollowUp) {
      // Mark for follow-up
      updates.needs_follow_up = true;
      updates.follow_up_scheduled_for = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days from now
    }

    // Update lead
    const { error: updateError } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      meetingBooked: isMeetingBooked,
      needsFollowUp: shouldFollowUp,
      message: isMeetingBooked 
        ? 'Meeting detected and booked! $19 charge added.'
        : shouldFollowUp
        ? 'Follow-up scheduled'
        : 'Reply recorded'
    });
  } catch (error: any) {
    console.error('Error processing reply:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process reply' },
      { status: 500 }
    );
  }
}
