-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  document_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage buckets for files
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-thumbnails', 'project-thumbnails', true);

-- Storage policies for documents (private)
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for thumbnails (public)
CREATE POLICY "Thumbnails are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-thumbnails');

CREATE POLICY "Users can upload their own thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own thumbnails" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own thumbnails" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();