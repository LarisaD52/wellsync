-- Silver Challenge: Password reset tokens + OAuth accounts + MANAGER role

-- Password Reset Tokens
CREATE TABLE "password_reset_tokens" (
    "id"        SERIAL PRIMARY KEY,
    "userId"    INTEGER NOT NULL,
    "token"     VARCHAR(255) NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP NOT NULL,
    "used"      BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "password_reset_tokens_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- OAuth Accounts
CREATE TABLE "oauth_accounts" (
    "id"         SERIAL PRIMARY KEY,
    "userId"     INTEGER NOT NULL,
    "provider"   VARCHAR(50) NOT NULL,
    "providerId" VARCHAR(255) NOT NULL,
    "email"      VARCHAR(200) NOT NULL,
    CONSTRAINT "oauth_accounts_provider_providerId_key" UNIQUE ("provider", "providerId"),
    CONSTRAINT "oauth_accounts_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
