import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const pathname = url.pathname;

    // Extract visitor information
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    console.log('Visitor tracking request:', {
      method: req.method,
      pathname,
      clientIP,
      userAgent: userAgent.substring(0, 100) // Log first 100 chars only
    });

    if ((pathname === '/visitor-count' || pathname === '/') && req.method === 'GET') {
      // GET /visitor-count - Just return current stats
      const { data: stats, error } = await supabase
        .from('visitor_stats')
        .select('total_unique_visitors, total_page_views, last_updated')
        .single();

      if (error) {
        console.error('Error fetching visitor stats:', error);
        throw error;
      }

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if ((pathname === '/track-visit' || pathname === '/') && req.method === 'POST') {
      // POST /track-visit - Track a new visit
      const { page } = await req.json().catch(() => ({ page: 'unknown' }));

      console.log('Tracking visit for IP:', clientIP, 'Page:', page);

      // Use the database function to track visitor and get updated stats
      const { data: result, error } = await supabase
        .rpc('track_visitor', {
          visitor_ip: clientIP,
          visitor_user_agent: userAgent
        });

      if (error) {
        console.error('Error tracking visitor:', error);
        throw error;
      }

      console.log('Visitor tracking result:', result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Invalid endpoint
      return new Response(JSON.stringify({ 
        error: 'Invalid endpoint. Use GET /visitor-count or POST /track-visit' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in visitor-tracking function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process visitor tracking request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});