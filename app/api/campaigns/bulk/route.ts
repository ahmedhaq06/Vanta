import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await limiter(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
    const { campaignIds, action } = body;

    if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign IDs array is required' },
        { status: 400 }
      );
    }

    if (!['pause', 'resume', 'delete'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be: pause, resume, or delete' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'delete') {
      // Delete campaigns
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .in('id', campaignIds)
        .eq('user_id', user.id);

      if (error) throw error;

      result = { deleted: campaignIds.length };
    } else {
      // Update status (pause/resume)
      const newStatus = action === 'pause' ? 'paused' : 'active';

      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', campaignIds)
        .eq('user_id', user.id);

      if (error) throw error;

      result = { updated: campaignIds.length, status: newStatus };
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
