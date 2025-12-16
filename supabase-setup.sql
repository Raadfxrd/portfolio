-- Supabase Database Setup for Portfolio
-- Run this SQL directly in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/[your-project]/editor

-- Create users table
CREATE TABLE IF NOT EXISTS users
(
    id
    SERIAL
    PRIMARY
    KEY,
    username
    VARCHAR
(
    255
) NOT NULL UNIQUE,
    password VARCHAR
(
    255
) NOT NULL,
    email VARCHAR
(
    255
) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW
(
)
    );

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts
(
    id
    SERIAL
    PRIMARY
    KEY,
    slug
    VARCHAR
(
    255
) NOT NULL UNIQUE,
    title VARCHAR
(
    255
) NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR
(
    255
) NOT NULL,
    date VARCHAR
(
    10
) NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW
(
),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW
(
)
    );

-- Create newsletter table
CREATE TABLE IF NOT EXISTS newsletter
(
    id
    SERIAL
    PRIMARY
    KEY,
    email
    VARCHAR
(
    255
) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP NOT NULL DEFAULT NOW
(
),
    active BOOLEAN NOT NULL DEFAULT TRUE
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (published);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter (active);

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts
    ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter
    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users
    ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow public to read published blog posts
CREATE
POLICY "public_can_read_published_posts"
    ON blog_posts
    FOR
SELECT
    TO anon
    USING (published = true);

-- Allow authenticated users to read all blog posts
CREATE
POLICY "authenticated_can_read_all_posts"
    ON blog_posts
    FOR
SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert, update, delete blog posts
CREATE
POLICY "authenticated_can_manage_posts"
    ON blog_posts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Newsletter: Only authenticated users can manage
CREATE
POLICY "authenticated_can_manage_newsletter"
    ON newsletter
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Users: Only authenticated users can read users
CREATE
POLICY "authenticated_can_read_users"
    ON users
    FOR
SELECT
    TO authenticated
    USING (true);

-- Create a function to update the updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at
= NOW();
RETURN NEW;
END;
$$
language 'plpgsql';

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE
    ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT schemaname,
       tablename,
       tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'blog_posts', 'newsletter');