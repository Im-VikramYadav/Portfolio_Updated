-- Add badge_image_url column to certifications table
ALTER TABLE public.certifications 
ADD COLUMN badge_image_url text;

-- Add location column and start_date/end_date for proper sorting to experience table  
ALTER TABLE public.experience 
ADD COLUMN location text,
ADD COLUMN start_date date,
ADD COLUMN end_date date;