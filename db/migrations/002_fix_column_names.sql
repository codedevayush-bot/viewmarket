-- Fix column names to match NextAuth Neon adapter expectations
-- The adapter uses camelCase, not snake_case

-- Drop old tables if they exist with wrong column names
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with camelCase columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create accounts table with camelCase columns
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" BIGINT,
    "token_type" VARCHAR(255),
    scope TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, "providerAccountId")
);

-- Create sessions table with camelCase columns
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create verification_tokens table with camelCase columns
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON accounts("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON sessions("userId");
CREATE INDEX IF NOT EXISTS "Session_sessionToken_idx" ON sessions("sessionToken");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON users(email);
