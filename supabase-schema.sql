-- ============================================
-- MEDLEARN AFRICA DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SEMESTERS TABLE (using TEXT IDs for compatibility)
-- ============================================
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS course_units CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

CREATE TABLE semesters (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#6366f1',
  gradient VARCHAR(100) DEFAULT 'from-indigo-500 to-violet-600',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CATEGORIES TABLE (using TEXT IDs for compatibility)
-- ============================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Folder',
  color VARCHAR(50) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COURSE UNITS TABLE (using TEXT IDs for compatibility)
-- ============================================
CREATE TABLE course_units (
  id TEXT PRIMARY KEY,
  semester_id TEXT REFERENCES semesters(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'BookOpen',
  color VARCHAR(50) DEFAULT '#3b82f6',
  keywords TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOPICS TABLE (using TEXT IDs for compatibility)
-- ============================================
CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  course_unit_id TEXT REFERENCES course_units(id) ON DELETE SET NULL,
  semester_id TEXT REFERENCES semesters(id) ON DELETE SET NULL,
  description TEXT,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  featured_image TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_course_unit ON topics(course_unit_id);
CREATE INDEX IF NOT EXISTS idx_topics_semester ON topics(semester_id);
CREATE INDEX IF NOT EXISTS idx_course_units_semester ON course_units(semester_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_semesters_updated_at ON semesters;
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_units_updated_at ON course_units;
CREATE TRIGGER update_course_units_updated_at BEFORE UPDATE ON course_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - DISABLED FOR MIGRATION
-- ============================================
-- Disable RLS to allow migration with anon key
ALTER TABLE semesters DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================
-- Create a storage bucket for topic images
INSERT INTO storage.buckets (id, name, public)
VALUES ('topic-images', 'topic-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can view images
DROP POLICY IF EXISTS "Public view images" ON storage.objects;
CREATE POLICY "Public view images" ON storage.objects FOR SELECT
  USING (bucket_id = 'topic-images');

-- Storage policy: anyone can upload (for migration)
DROP POLICY IF EXISTS "Public upload images" ON storage.objects;
CREATE POLICY "Public upload images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'topic-images');

-- Storage policy: anyone can update
DROP POLICY IF EXISTS "Public update images" ON storage.objects;
CREATE POLICY "Public update images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'topic-images');

-- Storage policy: anyone can delete
DROP POLICY IF EXISTS "Public delete images" ON storage.objects;
CREATE POLICY "Public delete images" ON storage.objects FOR DELETE
  USING (bucket_id = 'topic-images');

-- ============================================
-- DONE! Your database is ready.
-- Now run the migration from the admin panel
-- ============================================
