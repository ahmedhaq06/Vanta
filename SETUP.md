# 🚀 Vanta Setup Guide

## Step 1: Create Supabase Tables

Before you can use the app, you need to set up the database tables in Supabase.

### Instructions:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `eqhvrzwfrlgxwpwpokfm`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Schema SQL**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Ctrl+Enter`
   - You should see "Success. No rows returned"

4. **Run Functions SQL**
   - Click "New query" again
   - Copy the entire contents of `supabase-functions.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Ctrl+Enter`
   - You should see "Success. No rows returned"

5. **Verify Tables Were Created**
   - Click on "Table Editor" in the left sidebar
   - You should see two tables:
     - `campaigns`
     - `leads`

## Step 2: Start Using the App

Once the database is set up, refresh your browser at http://localhost:3000

### Quick Start:

1. **Create a Campaign**
   - Click "New Campaign"
   - Enter a name like "Q1 LinkedIn Outreach"
   - Click "Create"

2. **Upload Leads**
   - Click on your campaign
   - Click "Upload CSV"
   - Use the `sample-leads.csv` file included in the project
   - The file should have columns: `name`, `email`, `profile_url`

3. **Start Campaign**
   - Click "Start Campaign"
   - Watch the leads process through the workflow
   - Check Analytics for performance metrics

## Supported Profile URLs

✅ **LinkedIn**: linkedin.com/in/username
✅ **X (Twitter)**: twitter.com/username or x.com/username
✅ **Instagram**: instagram.com/username

❌ Any other platform will be rejected

## CSV Format Example

```csv
name,email,profile_url
John Doe,john@example.com,https://linkedin.com/in/johndoe
Jane Smith,jane@example.com,https://twitter.com/janesmith
Bob Wilson,bob@example.com,https://instagram.com/bobwilson
```

## Troubleshooting

### "500 Internal Server Error" on API calls
- **Solution**: Make sure you've run both SQL scripts in Supabase
- Check the browser console for specific error messages
- Verify your Supabase URL and API key in `.env.local`

### CSV Upload Issues
- Ensure CSV has headers: `name`, `email`, `profile_url`
- Check that email addresses are valid
- Verify profile URLs are from supported platforms

### Email Sending Fails
- Verify Resend API key is correct
- Check you haven't exceeded rate limits (3k/month free tier)
- Make sure recipient emails are valid

## API Keys Configured

All API keys are already set in `.env.local`:
- ✅ Supabase (Database)
- ✅ Resend (Email sending)
- ✅ Together AI (LLM for personalization)
- ✅ Bright Data (Web scraping)

---

**Need help?** Check the main README.md for detailed documentation.
