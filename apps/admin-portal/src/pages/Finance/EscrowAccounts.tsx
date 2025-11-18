import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@thebazaar/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Badge } from '@thebazaar/ui/badge';
import { formatCurrency, formatDate } from '@thebazaar/utils';
import { Lock, Unlock, DollarSign } from 'lucide-react';

export default function EscrowAccounts() {
  const { data: escrowAccounts, isLoading } = useQuery({
    queryKey: ['escrow-accounts'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('escrow_accounts')
        .select('*, orders(order_number, buyer_id, vendor_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const totalHeld = escrowAccounts?.filter((e) => e.status === 'held').reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;
  const totalPending = escrowAccounts?.filter((e) => e.status === 'pending').reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Escrow Accounts</h1>
        <p className="text-muted-foreground">Monitor order escrow accounts and funds</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Held</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalHeld)}</div>
            <p className="text-xs text-muted-foreground">Currently in escrow</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Release</CardTitle>
            <Unlock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">Awaiting release</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escrow Accounts</CardTitle>
          <CardDescription>All order escrow accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {escrowAccounts?.map((account: any) => (
                <div key={account.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <DollarSign className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">Order: {account.orders?.order_number || account.order_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(account.created_at)}
                        </p>
                        {account.held_until && (
                          <p className="text-sm text-muted-foreground">
                            Held until: {formatDate(account.held_until)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(account.amount || 0)}</p>
                      <Badge
                        className={
                          account.status === 'held'
                            ? 'bg-yellow-500'
                            : account.status === 'released'
                            ? 'bg-green-500'
                            : account.status === 'refunded'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                        }
                      >
                        {account.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {(!escrowAccounts || escrowAccounts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No escrow accounts found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


