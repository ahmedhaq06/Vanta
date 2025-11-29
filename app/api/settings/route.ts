import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No settings found, create default
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          daily_email_limit: 100,
          emails_sent_today: 0,
          billing_plan: 'free',
          billing_status: 'active'
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ settings: newSettings });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { daily_email_limit } = body;

    // Validate limit
    if (daily_email_limit < 10 || daily_email_limit > 1000) {
      return NextResponse.json(
        { error: 'Daily limit must be between 10 and 1000' },
        { status: 400 }
      );
    }

    // Update settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .update({ daily_email_limit })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // If no settings exist, create them
      if (error.code === 'PGRST116') {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            daily_email_limit,
            emails_sent_today: 0,
            billing_plan: 'free',
            billing_status: 'active'
          })
          .select()
          .single();

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ settings: newSettings });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
