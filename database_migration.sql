-- Database Migration Script for New Supabase Instance
-- Execute these commands in your new Supabase SQL Editor

-- =============================================
-- 1. CREATE TABLES (in dependency order)
-- =============================================

-- Create profiles table (no dependencies)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table (no dependencies)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  context TEXT,
  transcript_count INTEGER DEFAULT 0,
  last_analyzed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transcripts table (depends on projects)
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  size_kb NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analysis_results table (depends on projects)
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key_themes JSONB,
  disagreements JSONB,
  transcript_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_conversations table (depends on projects)
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  response_quotes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for foreign key relationships
CREATE INDEX idx_transcripts_project_id ON transcripts(project_id);
CREATE INDEX idx_analysis_results_project_id ON analysis_results(project_id);
CREATE INDEX idx_chat_conversations_project_id ON chat_conversations(project_id);

-- Indexes for common queries
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_transcripts_created_at ON transcripts(created_at DESC);
CREATE INDEX idx_analysis_results_created_at ON analysis_results(created_at DESC);
CREATE INDEX idx_chat_conversations_created_at ON chat_conversations(created_at ASC);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies (assuming users own their projects)
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update all projects" ON projects
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete all projects" ON projects
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Transcripts policies
CREATE POLICY "Users can view transcripts" ON transcripts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create transcripts" ON transcripts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update transcripts" ON transcripts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete transcripts" ON transcripts
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Analysis results policies
CREATE POLICY "Users can view analysis results" ON analysis_results
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create analysis results" ON analysis_results
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update analysis results" ON analysis_results
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete analysis results" ON analysis_results
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Chat conversations policies
CREATE POLICY "Users can view chat conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create chat conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update chat conversations" ON chat_conversations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete chat conversations" ON chat_conversations
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =============================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcripts_updated_at
  BEFORE UPDATE ON transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_results_updated_at
  BEFORE UPDATE ON analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Next steps:
-- 1. Deploy Edge Functions using Supabase CLI:
--    supabase functions deploy analyze-transcripts
--    supabase functions deploy chat-with-transcripts
--    supabase functions deploy cleanup-quote
--
-- 2. Set up authentication providers in Supabase dashboard
--
-- 3. Update environment variables:
--    VITE_SUPABASE_URL=your_new_supabase_url
--    VITE_SUPABASE_ANON_KEY=your_new_anon_key
--
-- 4. Export and import data from old instance
--
-- 5. Test all functionality