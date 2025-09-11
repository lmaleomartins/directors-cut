-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('master', 'admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add created_by column to movies table to track who created each movie
ALTER TABLE public.movies ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to check if user is master or admin
CREATE OR REPLACE FUNCTION public.is_admin_or_master(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role IN ('master', 'admin')
  );
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Masters can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters can create admin roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'master') AND 
  role IN ('admin', 'user') AND
  created_by = auth.uid()
);

CREATE POLICY "Masters can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'master'));

-- Update movies RLS policies
DROP POLICY IF EXISTS "Authenticated users can create movies" ON public.movies;
DROP POLICY IF EXISTS "Authenticated users can update movies" ON public.movies;
DROP POLICY IF EXISTS "Authenticated users can delete movies" ON public.movies;

-- New movies policies
CREATE POLICY "Authenticated users can create movies"
ON public.movies
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins and masters can update all movies"
ON public.movies
FOR UPDATE
USING (public.is_admin_or_master(auth.uid()));

CREATE POLICY "Users can update their own movies"
ON public.movies
FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Admins and masters can delete all movies"
ON public.movies
FOR DELETE
USING (public.is_admin_or_master(auth.uid()));

CREATE POLICY "Users can delete their own movies"
ON public.movies
FOR DELETE
USING (created_by = auth.uid());

-- Create trigger to automatically assign default role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();