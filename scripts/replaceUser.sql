-- PostgreSQL script to update userId across multiple tables within a transaction
-- Instructions:
-- 1. Replace 'old_user_id_value' with the current userId you want to change.
-- 2. Replace 'new_user_id_value' with the new userId you want to assign.

DO $$
DECLARE
    old_user_id TEXT := '7a168e2d-0d60-4c24-be8c-6059616d0281';  -- Replace with the existing userId
    new_user_id TEXT := 'f67e141b-7d78-45b0-b0a5-ff4bdc09f045';  -- Replace with the new userId

BEGIN
    -- Delete existing records with new_user_id to prevent unique key constraint violations

    -- UserProfile
    DELETE FROM "UserProfile"
    WHERE "userId" = new_user_id;

    -- OnboardingProfile
    DELETE FROM "OnboardingProfile"
    WHERE "userId" = new_user_id;

    -- Add DELETE statements for other tables with unique constraints on userId here
    -- Example:
    -- DELETE FROM "AnotherUniqueTable"
    -- WHERE "userId" = new_user_id;

    -- Update userId in all relevant tables

    -- Goal table
    UPDATE "Goal"
    SET "userId" = new_user_id
    WHERE "userId" = old_user_id;

    -- GoalTransfer table
    UPDATE "GoalTransfer"
    SET "userId" = new_user_id
    WHERE "userId" = old_user_id;

    -- OnboardingProfile table
    UPDATE "OnboardingProfile"
    SET "userId" = new_user_id
    WHERE "userId" = old_user_id;

    -- UserProfile table
    UPDATE "UserProfile"
    SET "userId" = new_user_id
    WHERE "userId" = old_user_id;

    -- PlaidItem table
    UPDATE "PlaidItem"
    SET "userId" = new_user_id
    WHERE "userId" = old_user_id;

    -- Transaction table
    UPDATE "Transaction"
    SET "userId" = new_user_id
    WHERE "userId" = old_user_id;

    -- Account table
    UPDATE "Account"
    SET "userId" = new_user_id
    WHERE "userId" = old_user_id;

    -- Optional: Add more UPDATE statements here for other tables if needed.

    -- Raise a notice to confirm the transaction was successful
    RAISE NOTICE 'userId updated from % to % successfully.', old_user_id, new_user_id;
EXCEPTION
    WHEN others THEN
        -- If any error occurs, raise a warning and let the transaction fail
        RAISE WARNING 'Transaction failed: %', SQLERRM;
        RAISE;
END $$;