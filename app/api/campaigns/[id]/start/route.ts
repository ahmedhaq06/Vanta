import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { scrapeProfile } from '@/lib/scraper';
import { generatePersonalizedEmail } from '@/lib/llm';
import { sendBatchEmails } from '@/lib/email';
import { Lead } from '@/lib/types';

interface LeadResultSummary {
  id: string;
  finalStatus: string;
  emailLength?: number;
  error?: string;
  usedMockScrape?: boolean;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const campaignId = params.id;
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode') || 'async'; // 'sync' or 'async'
  console.log(`🚀 Start campaign request id=${campaignId} mode=${mode}`);
  const supabase = getSupabaseClient();
  try {
    // Set active
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'active' })
      .eq('id', campaignId);
    if (updateError) {
      console.warn('⚠ Failed updating campaign to active:', updateError);
    }

    // Fetch pending leads immediately
    const { data: pendingLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');
    if (leadsError) {
      console.error('❌ Error fetching pending leads:', leadsError);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
    const pendingCount = pendingLeads?.length || 0;
    console.log(`🔢 Pending leads count: ${pendingCount}`);

    if (pendingCount === 0) {
      // Revert to draft so user can retry easily
      await supabase
        .from('campaigns')
        .update({ status: 'draft' })
        .eq('id', campaignId);
      return NextResponse.json({ success: false, error: 'No pending leads', pending: 0 }, { status: 400 });
    }

    if (mode === 'sync') {
      console.log('🧵 Running workflow synchronously');
      const { results, counts } = await runWorkflowSequence(pendingLeads!);
      const { error: finalErr } = await supabase
        .from('campaigns')
        .update({ status: 'completed' })
        .eq('id', campaignId);
      if (finalErr) console.warn('⚠ Failed setting campaign completed:', finalErr);
      return NextResponse.json({ success: true, message: 'Workflow complete', pending: pendingCount, processed: results.length, counts, results });
    } else {
      console.log('🧵 Scheduling async workflow');
      // Fire and forget
      processWorkflow(campaignId);
      return NextResponse.json({ success: true, message: 'Workflow started', pending: pendingCount });
    }
  } catch (error: any) {
    console.error('❌ Start campaign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processWorkflow(campaignId: string) {
  try {
    const supabase = getSupabaseClient();
    
    console.log('🔍 Checking for pending leads in campaign:', campaignId);
    
    // Get all pending leads
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');

    if (error) {
      console.error('❌ Error fetching leads:', error);
      return;
    }

    if (!leads || leads.length === 0) {
      console.log('⚠️  No pending leads found for campaign:', campaignId);
      console.log('Tip: Make sure you uploaded a CSV file first!');
      // Revert campaign back to draft so the Start button reappears and state is consistent.
      await supabase
        .from('campaigns')
        .update({ status: 'draft' })
        .eq('id', campaignId);
      return;
    }

    console.log(`✅ Found ${leads.length} pending leads to process`);

    // Process each lead
    for (const lead of leads) {
      try {
        await processLead(lead);
      } catch (error) {
        console.error(`Error processing lead ${lead.id}:`, error);
        await updateLeadStatus(lead.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId);

  } catch (error) {
    console.error('Workflow error:', error);
  }
}

async function runWorkflowSequence(leads: any[]): Promise<{ results: LeadResultSummary[]; counts: Record<string, number> }> {
  console.log(`▶ Running synchronous workflow for ${leads.length} leads`);
  const results: LeadResultSummary[] = [];
  const counts: Record<string, number> = {};
  for (const lead of leads) {
    try {
      const summary = await processLead(lead);
      results.push(summary);
      counts[summary.finalStatus] = (counts[summary.finalStatus] || 0) + 1;
    } catch (e) {
      console.error(`Lead ${lead.id} failed in sync workflow:`, e);
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      await updateLeadStatus(lead.id, 'failed', errMsg);
      results.push({ id: lead.id, finalStatus: 'failed', error: errMsg });
      counts['failed'] = (counts['failed'] || 0) + 1;
    }
  }
  return { results, counts };
}

async function processLead(lead: Lead): Promise<LeadResultSummary> {
  const supabase = getSupabaseClient();
  console.log(`➡️ Processing lead ${lead.id} name='${lead.name}' status='${lead.status}'`);
  
  // Step 1: Scrape profile
  await updateLeadStatus(lead.id, 'scraping');
  console.log(`🔄 [${lead.id}] scraping profile_url=${lead.profile_url} platform=${lead.platform}`);
  const scrapedData = await scrapeProfile(lead.profile_url, lead.platform);
  const usedMockScrape = !!scrapedData.mock;
  console.log(`🧪 [${lead.id}] scrapedData=`, scrapedData, 'mockFlag=', usedMockScrape);
  
  // Drop lead if insufficient data from BrightData (avoids generic emails)
  if (scrapedData.insufficient) {
    console.warn(`⚠️ [${lead.id}] Dropping lead due to insufficient data - missing company/bio details`);
    await supabase
      .from('leads')
      .update({
        status: 'failed',
        error: 'Insufficient data from profile scraping'
      })
      .eq('id', lead.id);
    
    return {
      id: lead.id,
      finalStatus: 'dropped_insufficient_data',
      error: 'Lead dropped: missing critical business/company information',
      usedMockScrape
    };
  }
  
  await supabase
    .from('leads')
    .update({
      status: 'scraped',
      bio: scrapedData.bio,
      recent_posts: scrapedData.recent_posts,
      job_title: scrapedData.job_title
    })
    .eq('id', lead.id);

  // Step 2: Generate personalized email
  await updateLeadStatus(lead.id, 'generating');
  console.log(`✏️  [${lead.id}] generating personalized email`);
  const personalizedEmail = await generatePersonalizedEmail({
    name: lead.name,
    bio: scrapedData.bio || '',
    recent_posts: scrapedData.recent_posts || '',
    job_title: scrapedData.job_title || '',
    platform: lead.platform
  });
  console.log(`✅ [${lead.id}] email length=${personalizedEmail.length}`);

  await supabase
    .from('leads')
    .update({
      status: 'generated',
      personalized_email: personalizedEmail
    })
    .eq('id', lead.id);

  // Step 3: Send email
  await updateLeadStatus(lead.id, 'sending');
  console.log(`📤 [${lead.id}] sending email to ${lead.email}`);
  
  try {
    await sendBatchEmails([{
      to: lead.email,
      name: lead.name,
      subject: `Hey ${lead.name.split(' ')[0]}!`,
      html: `<p>Hi ${lead.name},</p>${personalizedEmail.replace(/\n/g, '<br>')}`
    }]);
    console.log(`📬 [${lead.id}] email sent successfully`);

    // Only update status and increment counter if email was sent successfully
    await supabase
      .from('leads')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', lead.id);
    console.log(`🏁 [${lead.id}] lead marked sent`);
    
    // Update campaign counter only after successful send
    await supabase.rpc('increment_campaign_sent', { campaign_id: lead.campaign_id });
    console.log(`📊 [${lead.id}] campaign sent_count incremented`);
  } catch (emailError) {
    console.error(`❌ [${lead.id}] Failed to send email:`, emailError);
    await updateLeadStatus(lead.id, 'failed', emailError instanceof Error ? emailError.message : 'Email send failed');
    throw emailError; // Re-throw to be caught by the outer try-catch
  }

  return {
    id: lead.id,
    finalStatus: 'sent',
    emailLength: personalizedEmail.length,
    usedMockScrape
  };
}

async function updateLeadStatus(leadId: string, status: string, errorMessage?: string) {
  const supabase = getSupabaseClient();
  const update: any = { status };
  if (errorMessage) {
    update.error_message = errorMessage;
  }
  console.log(`🔖 updateLeadStatus lead=${leadId} -> ${status}${errorMessage ? ' error='+errorMessage : ''}`);
  
  await supabase
    .from('leads')
    .update(update)
    .eq('id', leadId);
}
