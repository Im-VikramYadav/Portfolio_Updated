-- Create bio table for user bio information
CREATE TABLE public.bio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create experience table for work experience
CREATE TABLE public.experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date_issued TEXT,
  credential_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  proficiency_level INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.bio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Anyone can view bio" 
ON public.bio 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view experience" 
ON public.experience 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view certifications" 
ON public.certifications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view skills" 
ON public.skills 
FOR SELECT 
USING (true);

-- Create user-specific CRUD policies for bio
CREATE POLICY "Users can create their own bio" 
ON public.bio 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bio" 
ON public.bio 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bio" 
ON public.bio 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user-specific CRUD policies for experience
CREATE POLICY "Users can create their own experience" 
ON public.experience 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experience" 
ON public.experience 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experience" 
ON public.experience 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user-specific CRUD policies for certifications
CREATE POLICY "Users can create their own certifications" 
ON public.certifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications" 
ON public.certifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications" 
ON public.certifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user-specific CRUD policies for skills
CREATE POLICY "Users can create their own skills" 
ON public.skills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" 
ON public.skills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" 
ON public.skills 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_bio_updated_at
BEFORE UPDATE ON public.bio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experience_updated_at
BEFORE UPDATE ON public.experience
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
BEFORE UPDATE ON public.certifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();