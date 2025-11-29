export type PlatformType = 'LinkedIn' | 'X' | 'Instagram';

export type LeadStatus = 'pending' | 'scraping' | 'scraped' | 'generating' | 'generated' | 'sending' | 'sent' | 'opened' | 'clicked' | 'replied' | 'meeting_booked' | 'failed';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export type CampaignType = 'b2b' | 'b2c';

export type EmailTone = 'professional' | 'casual' | 'friendly' | 'persuasive';

export type EmailGoal = 'meeting' | 'demo' | 'partnership' | 'sale' | 'networking' | 'feedback' | 'collaboration';

export interface Lead {
  id: string;
  campaign_id: string;
  name: string;
  email: string;
  profile_url: string;
  platform: PlatformType;
  status: LeadStatus;
  bio?: string;
  recent_posts?: string;
  job_title?: string;
  business_name?: string;
  business_niche?: string;
  website?: string;
  company_size?: string;
  personalized_email?: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  campaign_type: CampaignType;
  email_tone: EmailTone;
  email_goal: EmailGoal;
  custom_instructions?: string;
  status: CampaignStatus;
  total_leads: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export interface CSVRow {
  name: string;
  email: string;
  profile_url: string;
}

export interface B2BCSVRow {
  business_name: string;
  niche: string;
  website: string;
  email?: string;
}

export interface B2CCSVRow {
  name: string;
  email: string;
  profile_url: string;
}
