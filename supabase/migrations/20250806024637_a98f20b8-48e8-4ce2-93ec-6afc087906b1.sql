-- Fix security warning by setting proper search_path for the function
CREATE OR REPLACE FUNCTION public.track_visitor(
  visitor_ip INET,
  visitor_user_agent TEXT DEFAULT NULL
) 
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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