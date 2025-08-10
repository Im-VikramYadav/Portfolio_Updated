-- Create education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  degree TEXT NOT NULL,
  university TEXT NOT NULL,
  graduation_year TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Anyone can view education" 
ON public.education 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own education" 
ON public.education 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education" 
ON public.education 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education" 
ON public.education 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_education_updated_at
BEFORE UPDATE ON public.education
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();