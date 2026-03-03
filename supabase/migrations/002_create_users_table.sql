-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users table for Clerk user synchronization
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Clerk userId (not UUID)
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Clerk metadata (JSONB for flexibility)
  public_metadata JSONB DEFAULT '{}',
  private_metadata JSONB DEFAULT '{}',
  unsafe_metadata JSONB DEFAULT '{}',

  -- Last sync timestamp with Clerk
  last_synced_at TIMESTAMPTZ,

  -- User preferences (can be extended)
  preferences JSONB DEFAULT '{}',

  -- Account status
  is_banned BOOLEAN DEFAULT false,
  banned_at TIMESTAMPTZ,
  banned_reason TEXT
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- updated_at trigger for users
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role can manage users
CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow public read of certain user data (optional, for user profiles)
-- Comment this out if you want to keep all user data private
CREATE POLICY "Public can read basic user data"
  ON users FOR SELECT
  USING (
    -- Only read basic fields if not own profile or service role
    auth.uid() != id AND auth.role() != 'service_role'
    AND (
      -- Only allow reading non-sensitive fields via RLS
      -- Note: This is a placeholder - you may want to restrict further
      false -- Default: private, remove this line to enable
    )
  );

-- Comment for documentation
COMMENT ON TABLE users IS 'Stores user profiles synchronized from Clerk authentication';
COMMENT ON COLUMN users.id IS 'Clerk userId (TEXT, not UUID)';
COMMENT ON COLUMN users.email IS 'User email address';
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';
COMMENT ON COLUMN users.username IS 'Username (optional)';
COMMENT ON COLUMN users.image_url IS 'Profile image URL';
COMMENT ON COLUMN users.public_metadata IS 'Public metadata from Clerk';
COMMENT ON COLUMN users.private_metadata IS 'Private metadata from Clerk';
COMMENT ON COLUMN users.unsafe_metadata IS 'Unsafe metadata from Clerk';
COMMENT ON COLUMN users.last_synced_at IS 'Last synchronization timestamp with Clerk';
COMMENT ON COLUMN users.preferences IS 'User preferences (JSONB)';
COMMENT ON COLUMN users.is_banned IS 'Whether user is banned';
COMMENT ON COLUMN users.banned_at IS 'Timestamp when user was banned';
COMMENT ON COLUMN users.banned_reason IS 'Reason for ban';
