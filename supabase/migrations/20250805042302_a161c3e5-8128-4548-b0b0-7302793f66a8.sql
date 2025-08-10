-- Create table to track individual visitors
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  user_agent TEXT,
  first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address)
);

-- Create table to store overall visitor statistics
CREATE TABLE public.visitor_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_unique_visitors INTEGER NOT NULL DEFAULT 0,
  total_page_views INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial stats record
INSERT INTO public.visitor_stats (total_unique_visitors, total_page_views) VALUES (0, 0);

-- Enable Row Level Security
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;

-- Create public read policies (for analytics display)
CREATE POLICY "Anyone can view visitor stats" 
ON public.visitor_stats 
FOR SELECT 
USING (true);

-- Create policies to prevent public access to individual visitor data
CREATE POLICY "No public access to visitor details" 
ON public.visitors 
FOR ALL
USING (false);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_visitors_updated_at
BEFORE UPDATE ON public.visitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitor_stats_updated_at
BEFORE UPDATE ON public.visitor_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to track visitor and update stats
CREATE OR REPLACE FUNCTION public.track_visitor(
  visitor_ip INET,
  visitor_user_agent TEXT DEFAULT NULL
) 
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_new_visitor BOOLEAN := false;
  current_stats JSON;
  visitor_record RECORD;
BEGIN
  -- Try to find existing visitor
  SELECT * INTO visitor_record 
  FROM public.visitors 
  WHERE ip_address = visitor_ip;
  
  IF visitor_record IS NULL THEN
    -- New visitor
    INSERT INTO public.visitors (ip_address, user_agent)
    VALUES (visitor_ip, visitor_user_agent);
    is_new_visitor := true;
    
    -- Update unique visitor count
    UPDATE public.visitor_stats 
    SET total_unique_visitors = total_unique_visitors + 1,
        total_page_views = total_page_views + 1,
        last_updated = now()
    WHERE id = (SELECT id FROM public.visitor_stats LIMIT 1);
  ELSE
    -- Existing visitor - update their record and increment page views
    UPDATE public.visitors 
    SET last_visit = now(),
        visit_count = visit_count + 1,
        updated_at = now()
    WHERE ip_address = visitor_ip;
    
    -- Update page view count only
    UPDATE public.visitor_stats 
    SET total_page_views = total_page_views + 1,
        last_updated = now()
    WHERE id = (SELECT id FROM public.visitor_stats LIMIT 1);
  END IF;
  
  -- Get current stats
  SELECT json_build_object(
    'total_unique_visitors', total_unique_visitors,
    'total_page_views', total_page_views,
    'is_new_visitor', is_new_visitor,
    'last_updated', last_updated
  ) INTO current_stats
  FROM public.visitor_stats 
  LIMIT 1;
  
  RETURN current_stats;
END;
$$;