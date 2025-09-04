-- Create a policy to disable duplicate email signups
DO $$ 
BEGIN
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_email_key'
    ) THEN
        -- Add unique constraint if it doesn't exist
        ALTER TABLE auth.users
        ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;
