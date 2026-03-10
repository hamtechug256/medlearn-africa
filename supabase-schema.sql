-- ============================================
-- MEDLEARN AFRICA DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SEMESTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Folder',
  color VARCHAR(50) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COURSE UNITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS course_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
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
-- TOPICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  course_unit_id UUID REFERENCES course_units(id) ON DELETE SET NULL,
  semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS site_settings (
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
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_units_updated_at BEFORE UPDATE ON course_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read published content)
CREATE POLICY "Public read semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read course_units" ON course_units FOR SELECT USING (true);
CREATE POLICY "Public read published topics" ON topics FOR SELECT USING (is_published = true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Authenticated users can do everything
CREATE POLICY "Auth full access semesters" ON semesters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access course_units" ON course_units FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access topics" ON topics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================
-- Create a storage bucket for topic images
INSERT INTO storage.buckets (id, name, public)
VALUES ('topic-images', 'topic-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can view images
CREATE POLICY "Public view images" ON storage.objects FOR SELECT
  USING (bucket_id = 'topic-images');

-- Storage policy: authenticated users can upload
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'topic-images' AND auth.role() = 'authenticated');

-- Storage policy: authenticated users can update
CREATE POLICY "Auth update images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'topic-images' AND auth.role() = 'authenticated');

-- Storage policy: authenticated users can delete
CREATE POLICY "Auth delete images" ON storage.objects FOR DELETE
  USING (bucket_id = 'topic-images' AND auth.role() = 'authenticated');

-- ============================================
-- DONE! Your database is ready.
-- ============================================
