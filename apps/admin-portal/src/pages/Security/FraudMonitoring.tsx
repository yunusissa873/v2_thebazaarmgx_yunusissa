import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@thebazaar/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Badge } from '@thebazaar/ui/badge';
import { formatDate } from '@thebazaar/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function FraudMonitoring() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: fraudAlerts, isLoading } = useQuery({
    queryKey: ['fraud-alerts-all'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: string }) => {
      const { error } = await supabaseAdmin
        .from('fraud_alerts')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Fraud alert updated');
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts-all'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update alert');
    },
  });

  const handleResolve = (alertId: string, status: string) => {
    resolveMutation.mutate({ alertId, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fraud Monitoring</h1>
        <p className="text-muted-foreground">Monitor and investigate fraudulent activities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fraud Alerts</CardTitle>
          <CardDescription>All fraud detection alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {fraudAlerts?.map((alert: any) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <p className="font-semibold capitalize">{alert.type.replace(/_/g, ' ')}</p>
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
                        <Badge variant="outline">{alert.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {alert.related_entity_type}: {alert.related_entity_id} • Created: {formatDate(alert.created_at)}
                      </p>
                      {alert.resolved_at && (
                        <p className="text-xs text-muted-foreground">
                          Resolved: {formatDate(alert.resolved_at)} by {alert.resolved_by}
                        </p>
                      )}
                    </div>
                    {alert.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert.id, 'investigating')}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600"
                          onClick={() => handleResolve(alert.id, 'resolved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleResolve(alert.id, 'false_positive')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          False Positive
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!fraudAlerts || fraudAlerts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No fraud alerts found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


