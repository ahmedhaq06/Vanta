import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ campaigns: data || [] });
  } catch (error: any) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, campaign_type, email_tone, email_goal, custom_instructions } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }
    if (!campaign_type) {
      return NextResponse.json({ error: 'Campaign type is required' }, { status: 400 });
    }
    if (!email_tone) {
      return NextResponse.json({ error: 'Email tone is required' }, { status: 400 });
    }
    if (!email_goal) {
      return NextResponse.json({ error: 'Email goal is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{ 
        name, 
        campaign_type, 
        email_tone, 
        email_goal, 
        custom_instructions, 
        status: 'draft' 
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('POST /api/campaigns error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create campaign' }, { status: 500 });
  }
}
