import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60000, // 1 minute
  maxRequests: 5,
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
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if suppression list table exists, if not create it
    const { data: existingUnsubscribe } = await supabase
      .from('unsubscribes')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('user_id', user.id)
      .single();

    if (existingUnsubscribe) {
      return NextResponse.json({
        success: true,
        message: 'Email already unsubscribed',
      });
    }

    // Add to unsubscribe list
    const { error: insertError } = await supabase.from('unsubscribes').insert({
      user_id: user.id,
      email: normalizedEmail,
      unsubscribed_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Email unsubscribed successfully',
    });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to unsubscribe email' },
      { status: 500 }
    );
  }
}
