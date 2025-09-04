-- Add deleted_at column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create a function to handle soft deletes
CREATE OR REPLACE FUNCTION public.soft_delete_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
BEGIN
  -- Mark the profile as deleted
  UPDATE public.profiles
  SET 
    deleted_at = NOW(),
    email = NULL
  WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for soft deletes
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.soft_delete_user();

-- Update handle_new_user function to handle re-registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  -- Check for existing deleted profile
  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE deleted_at IS NOT NULL
  AND user_id IN (
    SELECT id FROM auth.users WHERE email = NEW.email
  );

  -- If found, delete the old profile
  IF existing_profile_id IS NOT NULL THEN
    DELETE FROM public.profiles WHERE id = existing_profile_id;
  END IF;

  -- Insert new profile
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    role,
    deleted_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NULL
  );

  RETURN NEW;
END;
$$;
