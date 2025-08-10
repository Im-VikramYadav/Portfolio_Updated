-- Create storage policies for certification badge uploads
CREATE POLICY "Users can upload their certification badges" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-thumbnails' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE 'certification-badges/%'
);

CREATE POLICY "Users can view certification badges" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'project-thumbnails' 
  AND name LIKE 'certification-badges/%'
);

CREATE POLICY "Users can update their certification badges" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'project-thumbnails' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE 'certification-badges/%'
);

CREATE POLICY "Users can delete their certification badges" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'project-thumbnails' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE 'certification-badges/%'
);