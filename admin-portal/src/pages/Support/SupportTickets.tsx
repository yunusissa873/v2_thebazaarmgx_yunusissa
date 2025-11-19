import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default function SupportTickets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('support_tickets')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ ticketId, adminId }: { ticketId: string; adminId: string }) => {
      const { error } = await supabaseAdmin
        .from('support_tickets')
        .update({
          assigned_to: adminId,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ticket assigned');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign ticket');
    },
  });

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-500',
    };
    return <Badge className={colors[priority] || 'bg-gray-500'}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground">Manage customer and vendor support tickets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>{tickets?.length || 0} total tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {tickets?.map((ticket: any) => (
                <div key={ticket.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        {getPriorityBadge(ticket.priority)}
                        <Badge variant="outline">{ticket.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{ticket.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        From: {ticket.profiles?.full_name || ticket.profiles?.email} • {formatDate(ticket.created_at)}
                      </p>
                      {ticket.assigned_to && (
                        <p className="text-xs text-muted-foreground">Assigned to: {ticket.assigned_to}</p>
                      )}
                    </div>
                    {ticket.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => assignMutation.mutate({ ticketId: ticket.id, adminId: user?.id || '' })}
                        disabled={assignMutation.isPending}
                      >
                        Assign to Me
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(!tickets || tickets.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No support tickets</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


