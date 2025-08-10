import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisitorStats {
  total_unique_visitors: number;
  total_page_views: number;
  last_updated: string;
  is_new_visitor?: boolean;
}

export const useVisitorTracking = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track visitor on component mount
  useEffect(() => {
    trackVisit();
  }, []);

  const trackVisit = async (page?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('visitor-tracking', {
        body: { 
          page: page || window.location.pathname,
          timestamp: new Date().toISOString()
        }
      });

      if (functionError) {
        throw functionError;
      }

      setStats(data);
    } catch (err: any) {
      console.error('Error tracking visit:', err);
      setError(err.message || 'Failed to track visit');
    } finally {
      setLoading(false);
    }
  };

  const getVisitorCount = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('visitor-tracking');

      if (functionError) {
        throw functionError;
      }

      setStats(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching visitor count:', err);
      setError(err.message || 'Failed to fetch visitor count');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    trackVisit,
    getVisitorCount,
  };
};