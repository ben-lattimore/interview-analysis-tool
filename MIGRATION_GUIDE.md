# Database Migration Guide - Option 1: Manual Schema Recreation

This guide will help you recreate your database schema in a new Supabase instance.

## Prerequisites

- Access to your old Supabase instance (for data export)
- New Supabase project created
- Supabase CLI installed (optional but recommended)

## Step 1: Create Database Schema

1. **Open your new Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Execute the migration script**:
   - Copy the entire contents of `database_migration.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

## Step 2: Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your new project
supabase link --project-ref YOUR_NEW_PROJECT_ID

# Deploy all functions
supabase functions deploy analyze-transcripts
supabase functions deploy chat-with-transcripts
supabase functions deploy cleanup-quote
```

### Option B: Manual Upload via Dashboard

1. Go to Edge Functions in your Supabase dashboard
2. Create new function: `analyze-transcripts`
   - Copy contents from `supabase/functions/analyze-transcripts/index.ts`
3. Create new function: `chat-with-transcripts`
   - Copy contents from `supabase/functions/chat-with-transcripts/index.ts`
4. Create new function: `cleanup-quote`
   - Copy contents from `supabase/functions/cleanup-quote/index.ts`

## Step 3: Configure Environment Variables

### For Edge Functions

In your new Supabase project settings, add these environment variables:

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_new_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
```

### For Your Application

Update your local `.env` file:

```env
VITE_SUPABASE_URL=your_new_supabase_url
VITE_SUPABASE_ANON_KEY=your_new_anon_key
```

## Step 4: Set Up Authentication

1. **Go to Authentication > Settings in your new Supabase dashboard**
2. **Configure the same auth providers** you used in the old instance:
   - Email/Password
   - OAuth providers (Google, GitHub, etc.)
3. **Update redirect URLs** if needed
4. **Copy any custom email templates**

## Step 5: Export Data from Old Instance

### Using Supabase Dashboard

1. Go to your old Supabase project
2. Navigate to Table Editor
3. For each table, export as CSV:
   - `profiles`
   - `projects`
   - `transcripts`
   - `analysis_results`
   - `chat_conversations`

### Using SQL (Alternative)

```sql
-- Export profiles
COPY profiles TO '/tmp/profiles.csv' WITH CSV HEADER;

-- Export projects
COPY projects TO '/tmp/projects.csv' WITH CSV HEADER;

-- Export transcripts
COPY transcripts TO '/tmp/transcripts.csv' WITH CSV HEADER;

-- Export analysis_results
COPY analysis_results TO '/tmp/analysis_results.csv' WITH CSV HEADER;

-- Export chat_conversations
COPY chat_conversations TO '/tmp/chat_conversations.csv' WITH CSV HEADER;
```

## Step 6: Import Data to New Instance

**Important**: Import in this exact order to respect foreign key constraints:

1. **profiles** (no dependencies)
2. **projects** (no dependencies)
3. **transcripts** (depends on projects)
4. **analysis_results** (depends on projects)
5. **chat_conversations** (depends on projects)

### Using Supabase Dashboard

1. Go to Table Editor in your new project
2. Select each table
3. Click "Insert" > "Import data from CSV"
4. Upload the corresponding CSV file

### Using SQL (Alternative)

```sql
-- Import profiles
COPY profiles FROM '/tmp/profiles.csv' WITH CSV HEADER;

-- Import projects
COPY projects FROM '/tmp/projects.csv' WITH CSV HEADER;

-- Import transcripts
COPY transcripts FROM '/tmp/transcripts.csv' WITH CSV HEADER;

-- Import analysis_results
COPY analysis_results FROM '/tmp/analysis_results.csv' WITH CSV HEADER;

-- Import chat_conversations
COPY chat_conversations FROM '/tmp/chat_conversations.csv' WITH CSV HEADER;
```

## Step 7: Update Project Configuration

1. **Update `supabase/config.toml`**:
   ```toml
   project_id = "your_new_project_id"
   ```

2. **Test your application**:
   ```bash
   npm run dev
   ```

## Step 8: Verification Checklist

- [ ] All tables created successfully
- [ ] Foreign key relationships working
- [ ] Row Level Security policies active
- [ ] Edge functions deployed and working
- [ ] Authentication working
- [ ] Data imported correctly
- [ ] Application connects to new instance
- [ ] All features working (create projects, upload transcripts, AI analysis, chat)

## Troubleshooting

### Common Issues

1. **Foreign key constraint errors during import**:
   - Ensure you're importing in the correct order
   - Check that referenced IDs exist in parent tables

2. **RLS policy blocking access**:
   - Verify user authentication is working
   - Check policy conditions match your auth setup

3. **Edge functions not working**:
   - Verify environment variables are set
   - Check function logs in Supabase dashboard
   - Ensure OpenAI API key is valid

4. **Application can't connect**:
   - Double-check environment variables
   - Verify Supabase URL and keys are correct
   - Check network connectivity

### Rollback Plan

If issues occur:
1. Keep your old Supabase instance running
2. Switch back to old environment variables
3. Debug issues in new instance without affecting production

## Post-Migration Tasks

1. **Monitor performance** for the first few days
2. **Update any external integrations** with new URLs/keys
3. **Update documentation** with new project details
4. **Schedule old instance cleanup** after confirming everything works

## Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Review browser console for client-side errors
3. Test individual components (auth, database, functions)
4. Consult Supabase documentation for specific error messages