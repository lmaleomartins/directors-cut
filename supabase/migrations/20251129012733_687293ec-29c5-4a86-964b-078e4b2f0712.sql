-- Fix profiles table RLS to restrict public access to PII
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow viewing basic profile info for movie creators (for attribution)
-- This is needed so users can see who created a movie
CREATE POLICY "Public can view profiles of movie creators"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.movies
    WHERE movies.created_by = profiles.user_id
  )
);