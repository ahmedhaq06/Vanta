import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ leads: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
