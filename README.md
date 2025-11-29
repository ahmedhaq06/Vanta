# Vanta - AI Outreach Automation Platform

A high-performance outreach automation platform that personalizes cold emails at scale using AI, web scraping, and batch email sending.

## Features

- 📊 **Campaign Management**: Create and manage multiple outreach campaigns
- 📁 **CSV Upload**: Bulk import leads with name, email, and profile URL
- 🔍 **Profile Scraping**: Automatically scrape LinkedIn, X (Twitter), and Instagram profiles
- 🤖 **AI Personalization**: Generate hyper-personalized emails using DeepSeek-R1 LLM
- 📧 **Batch Email Sending**: Send personalized emails at scale with Resend
- 📈 **Analytics Dashboard**: Track open rates, click rates, and reply rates
- ⚡ **Real-time Status**: Monitor lead processing status in real-time

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Bright Data API
- **AI/LLM**: Together AI (DeepSeek-R1-Distill-Llama-70B)
- **Email**: Resend API
- **Charts**: Recharts

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL from `supabase-schema.sql` to create tables
4. Run the SQL from `supabase-functions.sql` to create helper functions

### 3. Environment Variables

The `.env.local` file is already configured with your API keys.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Create a Campaign

- Click "New Campaign" button
- Enter a campaign name
- Click "Create"

### 2. Upload Leads

- Click on a campaign to view details
- Click "Upload CSV" button
- Select a CSV file with columns: `name`, `email`, `profile_url`

**CSV Format Example:**
```csv
name,email,profile_url
John Doe,john@example.com,https://linkedin.com/in/johndoe
Jane Smith,jane@example.com,https://twitter.com/janesmith
```

**Supported Platforms:**
- LinkedIn (linkedin.com)
- X/Twitter (twitter.com, x.com)
- Instagram (instagram.com)

### 3. Start Campaign

- Click "Start Campaign" to begin the workflow
- The system will automatically:
  1. Scrape each profile for bio, posts, and job title
  2. Generate personalized emails using AI
  3. Send emails in batches
  4. Track delivery and engagement

### 4. Monitor Analytics

- Switch to "Analytics" view in the sidebar
- View overall performance metrics
- See campaign-by-campaign breakdowns
- Track conversion funnels

## Workflow Pipeline

```
CSV Upload → Parse Leads → Scrape Profiles → Generate AI Emails → Send Batch Emails → Track Results
```

### Lead Status Flow

1. **pending**: Lead uploaded, waiting to be processed
2. **scraping**: Currently scraping profile data
3. **scraped**: Profile data retrieved successfully
4. **generating**: AI is generating personalized email
5. **generated**: Email content created
6. **sending**: Email is being sent
7. **sent**: Email successfully delivered
8. **opened**: Recipient opened the email
9. **clicked**: Recipient clicked a link
10. **replied**: Recipient replied to the email
11. **failed**: Processing or sending failed

## API Endpoints

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PATCH /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/start` - Start campaign workflow

### Leads
- `GET /api/campaigns/[id]/leads` - Get leads for campaign
- `POST /api/leads/upload` - Upload leads from CSV

## Database Schema

### Campaigns Table
- `id`: UUID (Primary Key)
- `name`: Text
- `status`: Enum (draft, active, paused, completed)
- `total_leads`: Integer
- `sent_count`: Integer
- `opened_count`: Integer
- `clicked_count`: Integer
- `replied_count`: Integer
- `failed_count`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Leads Table
- `id`: UUID (Primary Key)
- `campaign_id`: UUID (Foreign Key)
- `name`: Text
- `email`: Text
- `profile_url`: Text
- `platform`: Enum (LinkedIn, X, Instagram)
- `status`: Enum (see Lead Status Flow above)
- `bio`: Text (nullable)
- `recent_posts`: Text (nullable)
- `job_title`: Text (nullable)
- `personalized_email`: Text (nullable)
- `sent_at`: Timestamp (nullable)
- `opened_at`: Timestamp (nullable)
- `clicked_at`: Timestamp (nullable)
- `replied_at`: Timestamp (nullable)
- `error_message`: Text (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Design Philosophy

The UI follows Vercel's design principles:
- **Minimal**: Clean, distraction-free interface
- **Fast**: Optimized for performance
- **Dark Mode**: Professional dark theme
- **Typography**: Clear hierarchy with system fonts
- **Spacing**: Generous whitespace for readability
- **Colors**: Semantic color coding for status and metrics

## Troubleshooting

### CSV Upload Issues
- Ensure CSV has headers: `name`, `email`, `profile_url`
- Verify email addresses are valid
- Check that profile URLs are from supported platforms

### Scraping Failures
- Verify Bright Data API key is correct
- Check profile URLs are publicly accessible
- Some profiles may have privacy settings

### Email Sending Issues
- Verify Resend API key is valid
- Check email addresses are valid
- Ensure you're within Resend's rate limits (3k/month free tier)

## License

MIT
