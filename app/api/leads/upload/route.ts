import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { detectPlatform, validateCSVRow } from '@/lib/csv-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, leads } = body;

    // Get authenticated user from session
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

    console.log('📤 CSV Upload Request:', {
      campaignId,
      userId,
      leadCount: leads?.length,
      leads: leads?.slice(0, 2) // Log first 2 for debugging
    });

    if (!campaignId || !leads || !Array.isArray(leads)) {
      console.error('❌ Invalid request data');
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Validate and prepare leads
    const validLeads = [];
    const errors = [];
    const emailMap = new Map<string, number[]>(); // Track email duplicates: email -> [row numbers]
    const duplicates: Array<{ email: string; rows: number[] }> = [];

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const rowNumber = i + 1;
      console.log(`Validating lead ${rowNumber}:`, lead);
      
      const validationError = validateCSVRow(lead);
      if (validationError) {
        console.log(`❌ Validation failed for lead ${rowNumber}:`, validationError);
        errors.push({ row: lead, error: validationError, rowNumber });
        continue;
      }

      const platform = detectPlatform(lead.profile_url);
      if (!platform) {
        console.log(`❌ Invalid platform for lead ${rowNumber}:`, lead.profile_url);
        errors.push({ row: lead, error: 'Invalid platform', rowNumber });
        continue;
      }

      // Check for duplicate emails in current batch
      const normalizedEmail = lead.email.toLowerCase().trim();
      if (emailMap.has(normalizedEmail)) {
        const existingRows = emailMap.get(normalizedEmail)!;
        console.log(`⚠️ Duplicate email detected at row ${rowNumber}, matches row(s): ${existingRows.join(', ')}`);
        errors.push({ 
          row: lead, 
          error: `Duplicate email (same as lead ${existingRows.join(', ')})`, 
          rowNumber 
        });
        
        // Track all occurrences of this duplicate
        existingRows.push(rowNumber);
        continue;
      }

      // Track this email for duplicate detection
      emailMap.set(normalizedEmail, [rowNumber]);

      console.log(`✅ Lead ${rowNumber} valid, platform:`, platform);
      validLeads.push({
        campaign_id: campaignId,
        user_id: userId,
        name: lead.name,
        email: lead.email,
        profile_url: lead.profile_url,
        platform,
        status: 'pending',
        rowNumber // Keep track of original row for reporting
      });
    }

    // Check for existing emails in database for this campaign
    if (validLeads.length > 0) {
      const emailsToCheck = validLeads.map(l => l.email.toLowerCase().trim());
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('email')
        .eq('campaign_id', campaignId)
        .in('email', emailsToCheck);

      if (existingLeads && existingLeads.length > 0) {
        const existingEmailSet = new Set(existingLeads.map(l => l.email.toLowerCase().trim()));
        const leadsToInsert = [];
        
        for (const lead of validLeads) {
          if (existingEmailSet.has(lead.email.toLowerCase().trim())) {
            console.log(`⚠️ Lead ${lead.rowNumber} already exists in campaign database`);
            errors.push({
              row: { name: lead.name, email: lead.email, profile_url: lead.profile_url },
              error: 'Already exists in campaign',
              rowNumber: lead.rowNumber
            });
          } else {
            leadsToInsert.push(lead);
          }
        }
        
        // Update validLeads to only include non-duplicates
        validLeads.length = 0;
        validLeads.push(...leadsToInsert);
      }
    }

    // Build duplicate summary for reporting
    const duplicateSummary: string[] = [];
    emailMap.forEach((rows, email) => {
      if (rows.length > 1) {
        duplicateSummary.push(`Lead ${rows.join(' and ')} have the same email (${email})`);
      }
    });

    // Insert valid leads
    if (validLeads.length > 0) {
      console.log('✅ Valid leads to insert:', validLeads.length);
      console.log('Sample lead:', validLeads[0]);
      
      // Check if user has enough credits
      const { data: settings } = await supabase
        .from('user_settings')
        .select('test_credits_remaining')
        .eq('user_id', userId)
        .single();
      
      if (!settings || settings.test_credits_remaining < validLeads.length) {
        console.error('❌ Insufficient credits');
        return NextResponse.json({
          success: false,
          error: `Insufficient credits. You need ${validLeads.length} credits but only have ${settings?.test_credits_remaining || 0}. Purchase more credits to continue.`,
          needsCredits: true,
          creditsNeeded: validLeads.length,
          creditsAvailable: settings?.test_credits_remaining || 0
        }, { status: 402 });
      }
      
      // Remove rowNumber field before database insertion (not a database column)
      const leadsToInsert = validLeads.map(({ rowNumber, ...lead }) => lead);
      
      const { data, error } = await supabase
        .from('leads')
        .insert(leadsToInsert)
        .select();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw error;
      }

      console.log('✅ Leads inserted:', data?.length);

      // Decrement test credits
      const { error: creditError } = await supabase.rpc('decrement_test_credits', {
        credits_to_use: validLeads.length
      });
      
      if (creditError) {
        console.error('⚠️ Credit decrement error:', creditError);
      }

      // Update campaign total_leads count
      const { error: rpcError } = await supabase.rpc('increment_campaign_leads', {
        campaign_id: campaignId,
        count: validLeads.length
      });

      if (rpcError) {
        console.error('⚠️  RPC error (non-critical):', rpcError);
      }

      console.log('✅ Upload complete:', {
        inserted: validLeads.length,
        errors: errors.length,
        duplicates: duplicateSummary.length
      });

      return NextResponse.json({
        success: true,
        inserted: validLeads.length,
        errors: errors.length,
        errorDetails: errors,
        duplicates: duplicateSummary.length > 0 ? duplicateSummary : undefined
      });
    }

    console.error('❌ No valid leads to insert. Errors:', errors);
    // Build aggregated reason counts
    const reasonCounts: Record<string, number> = {};
    errors.forEach(e => { reasonCounts[e.error] = (reasonCounts[e.error] || 0) + 1; });
    return NextResponse.json({
      success: false,
      error: 'No valid leads to insert',
      errors: errors.length,
      reasonCounts,
      errorDetails: errors
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
