# Reply Detection & Follow-up System

## Overview
Automatic meeting detection and follow-up system for replied leads.

## Features

### 1. Smart Meeting Detection (`/api/replies/process`)
Automatically detects when a reply indicates a booked meeting by analyzing:
- **Meeting keywords**: "confirmed", "booked", "scheduled", "see you on"
- **Calendar indicators**: "calendly", "zoom", "meet.google"
- **Time references**: Days of week, time indicators (AM/PM)
- **Confirmation phrases**: "works for me", "sounds good", "looking forward"

**Auto-actions when meeting detected:**
- Updates lead status to `meeting_booked`
- Adds $19 charge via `mark_meeting_booked()` RPC
- Records meeting timestamp

### 2. Auto Follow-up System (`/api/follow-ups/send`)
Automatically schedules follow-ups for interested leads:

**Follow-up Logic:**
- Detects interest keywords: "interested", "tell me more", "curious"
- Identifies questions (contains "?")
- Auto-schedules if no reply after 3 days

**Follow-up Sequence:**
1. **Day 3**: Gentle reminder about previous email
2. **Day 8**: Direct ask with easy opt-out
3. **Day 13**: Final "breakup" email asking to close file

**Limits:**
- Max 3 follow-ups per lead
- 5-day intervals between follow-ups
- Auto-stops after 3 attempts

### 3. Database Schema (`supabase/reply-tracking.sql`)

**New columns in `leads` table:**
```sql
replied_at              -- When they replied
reply_content           -- Their reply text
meeting_booked_at       -- When meeting was detected
needs_follow_up         -- Boolean flag
follow_up_scheduled_for -- Next follow-up date
follow_up_count         -- Number of follow-ups sent (max 3)
last_follow_up_at       -- Last follow-up timestamp
```

## Usage

### Process Incoming Reply
```typescript
POST /api/replies/process
{
  "leadId": "uuid",
  "emailBody": "Thanks! Monday at 2pm works for me.",
  "replyDate": "2025-11-26T10:00:00Z"
}

Response:
{
  "success": true,
  "meetingBooked": true,
  "message": "Meeting detected and booked! $19 charge added."
}
```

### Send Scheduled Follow-ups
```typescript
POST /api/follow-ups/send

Response:
{
  "success": true,
  "sent": 15,
  "total": 15
}
```

## Integration Options

### Option 1: Webhook from Email Provider
Set up webhook from Resend/SendGrid when replies received:
```typescript
// In your webhook handler
await fetch('/api/replies/process', {
  method: 'POST',
  body: JSON.stringify({
    leadId: email.metadata.leadId,
    emailBody: email.text,
    replyDate: email.receivedAt
  })
});
```

### Option 2: Cron Job for Follow-ups
Set up daily cron (using Vercel Cron or similar):
```bash
# vercel.json
{
  "crons": [{
    "path": "/api/follow-ups/send",
    "schedule": "0 9 * * *"  # 9 AM daily
  }]
}
```

### Option 3: IMAP Polling
Poll inbox for replies:
```typescript
// Use node-imap or similar
const imap = new Imap({ /* config */ });
imap.on('mail', async () => {
  // Fetch new emails
  // Call /api/replies/process for each
});
```

## Deployment Steps

1. **Run SQL Migration:**
   ```sql
   -- Execute in Supabase SQL Editor
   \i supabase/reply-tracking.sql
   ```

2. **Set up Webhook (Resend):**
   - Go to Resend Dashboard → Webhooks
   - Add webhook: `https://yourdomain.com/api/replies/process`
   - Subscribe to: `email.delivered`, `email.replied`

3. **Set up Cron Job:**
   - Add to `vercel.json` for automatic follow-ups
   - Or use GitHub Actions for scheduling

4. **Test Reply Detection:**
   ```bash
   curl -X POST https://yourdomain.com/api/replies/process \
     -H "Content-Type: application/json" \
     -d '{
       "leadId": "...",
       "emailBody": "Yes, Monday at 2pm works!"
     }'
   ```

## Notes

- Meeting detection is keyword-based (no AI yet)
- False positives possible—review meeting charges regularly
- Follow-ups stop automatically after 3 attempts
- Auto-reply detection prevents marking OOO as meetings
- All RPC functions are user-scoped (RLS enabled)
