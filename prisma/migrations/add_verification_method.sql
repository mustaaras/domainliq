-- Migration: Add verification method field and mark existing domains as verified
-- This ensures backward compatibility for domains added before verification system

-- Add verificationMethod column (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Domain' AND column_name = 'verificationMethod'
    ) THEN
        ALTER TABLE "Domain" ADD COLUMN "verificationMethod" TEXT;
    END IF;
END $$;

-- Mark all existing domains as verified via 'a' record method
-- (Assuming they were already working/pointing to server)
UPDATE "Domain" 
SET 
    "isVerified" = true,
    "verificationMethod" = 'a',
    "verifiedAt" = COALESCE("verifiedAt", NOW())
WHERE 
    "isVerified" = false 
    AND "verificationToken" IS NOT NULL;

-- Also mark domains without verification tokens as verified
UPDATE "Domain" 
SET 
    "isVerified" = true,
    "verificationMethod" = 'a',
    "verifiedAt" = NOW(),
    "verificationToken" = gen_random_uuid()::text
WHERE 
    "verificationToken" IS NULL;
