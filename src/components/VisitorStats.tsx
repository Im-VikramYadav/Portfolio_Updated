import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { Eye, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const VisitorStats = () => {
  const { stats, loading, error } = useVisitorTracking();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Loading visitor stats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load visitor stats
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Unique Visitors
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_unique_visitors.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total unique visitors
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Page Views
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_page_views.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total page views
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Pages/Visitor
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total_unique_visitors > 0 
              ? (stats.total_page_views / stats.total_unique_visitors).toFixed(1)
              : '0'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Pages per visitor
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorStats;