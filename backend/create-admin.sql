-- Direct SQL script to create admin user
-- Run this on your production/staging database

-- First, check if user exists
DO $$
DECLARE
    user_exists boolean;
    hashed_password text;
BEGIN
    -- Check if admin user exists
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'lekankolawolejohn@gmail.com') INTO user_exists;

    -- bcrypt hash of 'Kolawolelekan@21' with salt round 10
    -- You'll need to generate this hash using bcrypt
    -- The hash below is a placeholder - generate the actual hash using the Node.js script provided
    hashed_password := '$2b$10$YourHashedPasswordHere';

    IF user_exists THEN
        -- Update existing user
        UPDATE users
        SET
            password = hashed_password,
            role = 'ADMIN',
            "isVerified" = true,
            "updatedAt" = NOW()
        WHERE email = 'lekankolawolejohn@gmail.com';

        RAISE NOTICE 'Admin user updated successfully';
    ELSE
        -- Create new admin user
        INSERT INTO users (
            id,
            email,
            password,
            "firstName",
            "lastName",
            role,
            "isVerified",
            "createdAt",
            "updatedAt"
        ) VALUES (
            gen_random_uuid()::text,
            'lekankolawolejohn@gmail.com',
            hashed_password,
            'Lekan',
            'Kolawole',
            'ADMIN',
            true,
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Admin user created successfully';
    END IF;
END $$;

-- Verify the user was created/updated
SELECT
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isVerified",
    "createdAt"
FROM users
WHERE email = 'lekankolawolejohn@gmail.com';
