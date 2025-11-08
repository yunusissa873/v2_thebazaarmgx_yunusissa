import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Shield, AlertTriangle, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SecurityDashboard() {
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('security_events')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const { data: fraudAlerts, isLoading: fraudLoading } = useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('fraud_alerts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const criticalEvents = securityEvents?.filter((e) => e.severity === 'critical').length || 0;
  const highSeverity = securityEvents?.filter((e) => e.severity === 'high').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor security events, fraud alerts, and system threats</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{highSeverity}</div>
            <p className="text-xs text-muted-foreground">Needs investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <Lock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{fraudAlerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Pending investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Unresolved events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Security Events</CardTitle>
            <CardDescription>Recent security incidents</CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                {securityEvents?.map((event: any) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.created_at)} • IP: {event.ip_address || 'N/A'}
                        </p>
                      </div>
                      <Badge
                        className={
                          event.severity === 'critical'
                            ? 'bg-red-500'
                            : event.severity === 'high'
                            ? 'bg-orange-500'
                            : event.severity === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }
                      >
                        {event.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!securityEvents || securityEvents.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">No security events</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud Alerts</CardTitle>
            <CardDescription>Potential fraudulent activities</CardDescription>
          </CardHeader>
          <CardContent>
            {fraudLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                {fraudAlerts?.map((alert: any) => (
                  <Link
                    key={alert.id}
                    to={`/security/fraud/${alert.id}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{alert.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(alert.created_at)} • {alert.related_entity_type}: {alert.related_entity_id}
                        </p>
                      </div>
                      <Badge
                        className={
                          alert.severity === 'critical'
                            ? 'bg-red-500'
                            : alert.severity === 'high'
                            ? 'bg-orange-500'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </Link>
                ))}
                {(!fraudAlerts || fraudAlerts.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">No fraud alerts</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


