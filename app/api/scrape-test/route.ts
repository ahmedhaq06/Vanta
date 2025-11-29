import { NextRequest, NextResponse } from 'next/server';
import { scrapeProfile } from '@/lib/scraper';
import { detectPlatform } from '@/lib/csv-parser';

export async function GET(request: NextRequest) {
  try {
    const urlObj = new URL(request.url);
    const profileUrl = urlObj.searchParams.get('url');
    if (!profileUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }
    const platform = detectPlatform(profileUrl) || 'LinkedIn';
    const data = await scrapeProfile(profileUrl, platform as any);
    return NextResponse.json({ success: true, platform, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
