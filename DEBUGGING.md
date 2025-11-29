# 🐛 Debugging Guide

## Check if the database is set up

**Problem:** Buttons not working, no data showing

**Solution:**
1. Run the health check:
```bash
node test-health.js
```

2. Or visit: http://localhost:3000/api/health

If you see errors about missing tables, run the SQL scripts in Supabase.

---

## Check the logs

With the new logging, you can now see exactly what's happening:

### When uploading CSV:
Look for these logs in your terminal:
```
📁 File selected: sample-leads.csv 234 bytes
📊 Parsed CSV rows: 5
📤 CSV Upload Request: { campaignId: '...', leadCount: 5 }
✅ Valid leads to insert: 5
✅ Leads inserted: 5
✅ Upload complete
```

### When starting campaign:
```
🚀 Starting campaign: abc-123
🔍 Checking for pending leads in campaign: abc-123
✅ Found 5 pending leads to process
```

### If no leads found:
```
⚠️  No pending leads found for campaign: abc-123
Tip: Make sure you uploaded a CSV file first!
```

---

## Common Issues

### 1. "No pending leads found" after upload

**Check:**
- Look at the browser console (F12) for upload logs
- Check terminal for CSV parsing logs
- Verify the CSV format matches: `name,email,profile_url`
- Make sure profile URLs are from LinkedIn, X, or Instagram

### 2. Upload shows success but no leads appear

**Check:**
- The `increment_campaign_leads` function exists in Supabase
- Run `supabase-functions.sql` if you haven't already
- Check Supabase dashboard → Table Editor → leads table

### 3. Start button does nothing

**Check:**
- Upload CSV first! Campaign needs leads
- Check browser console for errors
- Check terminal logs for "No pending leads found"

---

## Debug Commands

### Check health
```bash
node test-health.js
```

### Watch terminal logs
Keep the dev server terminal visible while testing

### Check browser console
Press F12 → Console tab

### Check Supabase tables directly
https://supabase.com/dashboard/project/eqhvrzwfrlgxwpwpokfm/editor

---

## Step-by-Step Test

1. **Create campaign**
   - Click "New Campaign"
   - Enter name → Create
   - Should see new campaign card

2. **Upload CSV**
   - Click on campaign
   - Click "Upload CSV"
   - Select `sample-leads.csv`
   - Should see alert: "✅ Successfully uploaded 5 leads!"
   - Should see leads in table

3. **Start campaign**
   - Click "Start Campaign"
   - Check terminal logs for processing
   - Watch lead statuses change

If any step fails, check the logs!
