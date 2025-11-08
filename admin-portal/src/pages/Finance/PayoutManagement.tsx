import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/client';
import { processPayout } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Wallet, CheckCircle, Clock } from 'lucide-react';

export default function PayoutManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallets, isLoading } = useQuery({
    queryKey: ['vendor-wallets'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('vendor_wallets')
        .select('*, vendors(business_name, profile_id)')
        .order('pending_payouts', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const payoutMutation = useMutation({
    mutationFn: ({ vendorId, amount }: { vendorId: string; amount: number }) =>
      processPayout(vendorId, amount, user?.id || ''),
    onSuccess: () => {
      toast.success('Payout processed successfully');
      queryClient.invalidateQueries({ queryKey: ['vendor-wallets'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process payout');
    },
  });

  const handlePayout = (vendorId: string, amount: number) => {
    if (confirm(`Process payout of ${formatCurrency(amount)}?`)) {
      payoutMutation.mutate({ vendorId, amount });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payout Management</h1>
        <p className="text-muted-foreground">Process vendor payouts and manage wallets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Wallets</CardTitle>
          <CardDescription>Manage vendor balances and process payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {wallets?.map((wallet: any) => (
                <div key={wallet.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">
                            {wallet.vendors?.business_name || 'Unknown Vendor'}
                          </h3>
                          <p className="text-sm text-muted-foreground">Vendor ID: {wallet.vendor_id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-lg font-bold">{formatCurrency(wallet.balance || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Payouts</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {formatCurrency(wallet.pending_payouts || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="text-sm">{formatCurrency(wallet.total_earnings || 0)}</p>
                      </div>
                      {wallet.pending_payouts > 0 && (
                        <Button
                          onClick={() => handlePayout(wallet.vendor_id, wallet.pending_payouts)}
                          disabled={payoutMutation.isPending}
                          className="mt-2"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Process Payout
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!wallets || wallets.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No vendor wallets found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


