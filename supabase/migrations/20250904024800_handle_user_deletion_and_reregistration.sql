-- Function to clean up user data on deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Delete profile
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  
  -- Delete any associated data like tickets
  DELETE FROM public.tickets WHERE user_id = OLD.id;
  
  -- Mark events as cancelled if user was creator
  UPDATE public.events 
  SET status = 'closed'
  WHERE created_by = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Function to handle user re-registration
CREATE OR REPLACE FUNCTION auth.handle_reregistration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- If user is being created and email exists in deleted_users, allow it
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE email = NEW.email AND deleted_at IS NOT NULL
  ) THEN
    -- Remove old user completely
    DELETE FROM auth.users WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for re-registration
DROP TRIGGER IF EXISTS on_auth_user_reregistration ON auth.users;
CREATE TRIGGER on_auth_user_reregistration
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.handle_reregistration();
