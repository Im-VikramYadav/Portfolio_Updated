-- Add public read policy for projects
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Update storage policy to allow public access to thumbnails
DROP POLICY IF EXISTS "Thumbnails are publicly accessible" ON storage.objects;
CREATE POLICY "Thumbnails are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-thumbnails');