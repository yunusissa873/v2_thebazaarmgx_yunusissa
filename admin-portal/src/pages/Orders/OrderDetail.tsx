import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/client';
import { updateOrderStatus } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Package, User, Store } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*, products(name, price))')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const order = orderData;

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(id!, status, user?.id || ''),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">Order Details & Management</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="capitalize">{order.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(order.total || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="font-medium">{formatCurrency(order.subtotal || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shipping</p>
              <p className="font-medium">{formatCurrency(order.shipping_cost || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & Vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Buyer ID</p>
              <p className="font-medium">{order.buyer_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendor ID</p>
              <p className="font-medium">{order.vendor_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shipping Address</p>
              <p className="font-medium">{order.shipping_address || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{item.products?.name || 'Product'}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} • Price: {formatCurrency(item.price || 0)}
                  </p>
                </div>
                <p className="font-bold">{formatCurrency((item.price || 0) * (item.quantity || 1))}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>Change order status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(
              (status) => (
                <Button
                  key={status}
                  variant={order.status === status ? 'default' : 'outline'}
                  onClick={() => statusMutation.mutate(status)}
                  disabled={statusMutation.isPending}
                >
                  {status}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


