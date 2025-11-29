import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseClient();
  const leadId = params.id;

  try {
    // Mark meeting as booked using RPC function
    const { error } = await supabase.rpc('mark_meeting_booked', {
      lead_id: leadId
    });

    if (error) {
      console.error('Error marking meeting booked:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get updated lead
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error('Error in mark meeting endpoint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
