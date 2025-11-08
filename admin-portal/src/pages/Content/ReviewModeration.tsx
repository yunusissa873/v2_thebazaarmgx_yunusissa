import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Star } from 'lucide-react';

export default function ReviewModeration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .select('*, products(name), profiles(full_name, email)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabaseAdmin
        .from('reviews')
        .update({
          is_approved: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review approved');
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve review');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabaseAdmin.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review rejected and removed');
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject review');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">Approve or reject product reviews</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>{reviews?.length || 0} reviews awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {reviews?.map((review: any) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <p className="font-semibold">{review.rating} / 5</p>
                        <Badge variant="outline">{review.products?.name || 'Product'}</Badge>
                      </div>
                      <p className="font-medium mt-2">{review.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        By: {review.profiles?.full_name || review.profiles?.email} • {formatDate(review.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600"
                        onClick={() => approveMutation.mutate(review.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!reviews || reviews.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No pending reviews</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


