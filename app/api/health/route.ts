import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // Test database connection
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('count')
      .limit(1);

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('count')
      .limit(1);

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: {
          campaigns: campaignsError ? { status: 'error', error: campaignsError.message } : { status: 'ok' },
          leads: leadsError ? { status: 'error', error: leadsError.message } : { status: 'ok' }
        }
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        resendKey: process.env.RESEND_API_KEY ? 'configured' : 'missing',
        togetherKey: process.env.TOGETHER_API_KEY ? 'configured' : 'missing',
        brightDataKey: process.env.BRIGHT_DATA_API_KEY ? 'configured' : 'missing'
      }
    };

    if (campaignsError || leadsError) {
      health.status = 'degraded';
    }

    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Database health check failed. Make sure you have run the SQL scripts in Supabase.'
    }, { status: 500 });
  }
}
