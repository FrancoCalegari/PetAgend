-- PetAgent Supabase Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Note: Supabase Auth handles user authentication
-- This table stores additional user profile data
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, is_custom) VALUES
  ('Dog', false),
  ('Cat', false),
  ('Bird', false)
ON CONFLICT DO NOTHING;

-- Enable RLS (public read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 3. PETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  surname TEXT,
  dni TEXT,
  blood_type TEXT,
  photo_url TEXT,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. MEDICAL DOCS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL,
  info TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical_docs ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access docs of their own pets)
CREATE POLICY "Users can view docs of own pets" ON medical_docs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = medical_docs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert docs for own pets" ON medical_docs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = medical_docs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update docs of own pets" ON medical_docs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = medical_docs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete docs of own pets" ON medical_docs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = medical_docs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. FOOD LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity TEXT,
  fed_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access food logs of their own pets)
CREATE POLICY "Users can view food logs of own pets" ON food_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = food_logs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert food logs for own pets" ON food_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = food_logs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update food logs of own pets" ON food_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = food_logs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete food logs of own pets" ON food_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = food_logs.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================
-- Run these commands in Supabase Dashboard > Storage
-- Or use the Supabase CLI

-- Create buckets (do this in Supabase Dashboard):
-- 1. pet-photos (public)
-- 2. user-avatars (public)
-- 3. medical-docs (private, authenticated users only)

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup:

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check categories
SELECT * FROM categories;
