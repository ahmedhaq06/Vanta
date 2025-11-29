import { PlatformType } from './types';

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY; // may be undefined; handle gracefully

interface ScrapedData {
  bio?: string;
  recent_posts?: string;
  job_title?: string;
  mock?: boolean; // indicates fallback synthetic data
  insufficient?: boolean; // indicates lead should be dropped due to missing data
}

/**
 * Validates if scraped data has sufficient information to personalize an email.
 * Drops leads that lack basic company/business details to avoid generic emails.
 */
function validateLeadQuality(data: ScrapedData, platform: PlatformType): boolean {
  // For LinkedIn (B2B), require bio OR job_title (company context needed)
  if (platform === 'LinkedIn') {
    const hasBio = !!(data.bio && data.bio.trim().length > 20);
    const hasJobTitle = !!(data.job_title && data.job_title.trim().length > 3);
    return hasBio || hasJobTitle;
  }

  // For X and Instagram, require bio (personal/brand context needed)
  const hasBio = !!(data.bio && data.bio.trim().length > 15);
  return hasBio;
}

export async function scrapeProfile(profileUrl: string, platform: PlatformType): Promise<ScrapedData> {
  console.log(`🔎 scrapeProfile start platform=${platform} url=${profileUrl}`);
  // Fallback mock if no API key (so pipeline keeps flowing)
  if (!BRIGHT_DATA_API_KEY) {
    console.warn('⚠ BRIGHT_DATA_API_KEY missing. Using mock scraped data.');
    return { ...mockData(platform, profileUrl), mock: true };
  }
  try {
    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zone: 'scraper',
        url: profileUrl,
        format: 'json'
      })
    });

    if (!response.ok) {
      const bodyText = await safeRead(response);
      console.error(`❌ Scraping failed status=${response.status} ${response.statusText} body=${bodyText}`);
      // Return mock fallback instead of throwing to avoid failing entire lead
      return { ...mockData(platform, profileUrl), mock: true };
    }

    const data = await response.json();
    console.log('🔎 Raw scrape data sample keys:', Object.keys(data).slice(0,10));
    const parsed = parsePlatformData(data, platform);
    
    // Validate lead quality - mark as insufficient if missing critical data
    const isQualityLead = validateLeadQuality(parsed, platform);
    if (!isQualityLead) {
      console.warn(`⚠️ Lead quality check failed for ${profileUrl} - insufficient data`);
      return { ...parsed, insufficient: true };
    }
    
    console.log('✅ Parsed scrape data:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ Exception scraping profile:', error);
    // On error, return mock data marked as insufficient to drop the lead
    return { ...mockData(platform, profileUrl), mock: true, insufficient: true };
  }
}

function parsePlatformData(data: any, platform: PlatformType): ScrapedData {
  // This is a simplified parser - adjust based on actual Bright Data response
  try {
    switch (platform) {
      case 'LinkedIn':
        return {
          bio: data.bio || data.summary || data.about || '',
          job_title: data.job_title || data.headline || data.title || '',
          recent_posts: data.recent_posts || data.posts || ''
        };
      
      case 'X':
        return {
          bio: data.bio || data.description || '',
          job_title: data.job_title || '',
          recent_posts: data.tweets || data.recent_tweets || data.posts || ''
        };
      
      case 'Instagram':
        return {
          bio: data.bio || data.biography || '',
          job_title: '',
          recent_posts: data.recent_posts || data.posts || ''
        };
      
      default:
        return {
          bio: '',
          job_title: '',
          recent_posts: ''
        };
    }
  } catch (error) {
    console.error('Error parsing platform data:', error);
    return {
      bio: '',
      job_title: '',
      recent_posts: ''
    };
  }
}

function mockData(platform: PlatformType, url: string): ScrapedData {
  const base: Record<PlatformType, ScrapedData> = {
    LinkedIn: {
      bio: 'Experienced professional passionate about innovation and growth.',
      job_title: 'Founder / Operator',
      recent_posts: 'Discussed market trends; Shared a product launch; Commented on industry news.'
    },
    X: {
      bio: 'Building things and tweeting thoughts.',
      job_title: 'Builder',
      recent_posts: 'Thread on SaaS metrics; Short post on AI tools; Reply about frameworks.'
    },
    Instagram: {
      bio: 'Visual storyteller and brand enthusiast.',
      job_title: '',
      recent_posts: 'Posted a reel about workflow; Shared a behind-the-scenes photo; Highlighted a brand collab.'
    }
  };
  const d = base[platform];
  return {
    bio: d.bio,
    job_title: d.job_title,
    recent_posts: d.recent_posts
  };
}

async function safeRead(res: Response): Promise<string> {
  try { return await res.text(); } catch { return '<unreadable body>'; }
}
