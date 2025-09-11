-- Create a master user (you'll need to sign up with this email first)
-- This migration will fail if you haven't created the user yet, so we'll use a function that won't error

CREATE OR REPLACE FUNCTION public.set_master_user(_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _email
  LIMIT 1;
  
  IF _user_id IS NULL THEN
    RETURN 'User with email ' || _email || ' not found. Please sign up first.';
  END IF;
  
  -- Update their role to master
  UPDATE public.user_roles
  SET role = 'master'
  WHERE user_id = _user_id;
  
  -- If no role exists, insert one
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'master');
  END IF;
  
  RETURN 'User ' || _email || ' has been set as master.';
END;
$$;

-- You can call this function with: SELECT public.set_master_user('your-email@example.com');