-- Add avatar_style column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_style text DEFAULT 'notionists-neutral';

-- Update existing profiles to have the default style
UPDATE public.profiles 
SET avatar_style = 'notionists-neutral' 
WHERE avatar_style IS NULL;
